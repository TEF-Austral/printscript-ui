import {
  SnippetOperations,
  SharePermissions,
  AnalyzeResult,
} from "./snippetOperations";
import {
  SnippetFilters,
  defaultFilters,
} from "../types/SnippetFilter.types.ts";
import {
  CreateSnippet,
  PaginatedSnippets,
  Snippet,
  UpdateSnippet,
} from "./snippet";
import { FileType } from "../types/FileType";
import { TestCase } from "../types/TestCase";
import { Rule } from "../types/Rule";
import { BackendPaginatedUsers, PaginatedUsers, User } from "./users";
import {AUTH_URL, PRINTSCRIPT_URL, SNIPPET_URL} from "./constants";
import {
  BackendPaginatedSnippets,
  BackendSnippet,
} from "../types/BackendSnippet.ts";
import {TestCaseResult} from "../types/TestCaseResult.ts";

export class HttpSnippetOperations implements SnippetOperations {
  private readonly snippetUrl = SNIPPET_URL;
  private readonly authUrl = AUTH_URL;
  private readonly printscriptUrl = PRINTSCRIPT_URL;
  private readonly getToken: () => Promise<string>;

  constructor(getToken: () => Promise<string>) {
    this.getToken = getToken;
  }

  private async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = await this.getToken();

    const res = await fetch(`${this.snippetUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opts.headers,
      },
      ...opts,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return (await res.json()) as T;
  }

  async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
    return this.request<Snippet>(`/snippets`, {
      method: "POST",
      body: JSON.stringify(createSnippet),
    });
  }

  async getSnippetById(id: string): Promise<Snippet | undefined> {
    const response = await this.request<BackendSnippet>(
        `/snippets/${encodeURIComponent(id)}`,
    );
    return this.mapBackendSnippetToSnippet(response);
  }

  private getExtensionFromLanguage(language: string): string {
    const extensions: Record<string, string> = {
      PRINTSCRIPT: "prs",
      JAVA: "java",
      PYTHON: "py",
      GOLANG: "go",
    };
    return extensions[language.toUpperCase()] || "txt";
  }

  async listSnippetDescriptors(
      page: number,
      pageSize: number,
      filters: SnippetFilters = defaultFilters,
  ): Promise<PaginatedSnippets> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    params.set("ownership", filters.ownership);

    if (filters.name) {
      params.set("name", filters.name);
    }

    if (filters.language) {
      params.set("language", filters.language);
    }

    params.set("compliance", filters.compliance);
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);

    const raw = await this.request<BackendPaginatedSnippets | BackendSnippet[]>(
        `/snippets?${params.toString()}`,
    );

    if (Array.isArray(raw)) {
      const snippets = raw.map((s) => this.mapBackendSnippetToSnippet(s));

      return {
        page,
        page_size: pageSize,
        count: snippets.length,
        snippets,
      };
    }

    const mappedSnippets = raw.snippets.map((s: BackendSnippet) =>
        this.mapBackendSnippetToSnippet(s),
    );

    return {
      page: raw.page ?? page,
      page_size: raw.pageSize ?? pageSize,
      count: raw.count ?? mappedSnippets.length,
      snippets: mappedSnippets,
    };
  }

  async updateSnippetById(
      id: string,
      updateSnippet: UpdateSnippet,
  ): Promise<Snippet> {
    return this.request<Snippet>(`/snippets/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(updateSnippet),
    });
  }

  async getUserFriends(
      email = "",
      page = 1,
      pageSize = 10,
  ): Promise<PaginatedUsers> {
    const params = new URLSearchParams({
      page: String(page - 1),
      pageSize: String(pageSize),
    });

    if (email) {
      params.set("query", `email:"${email}"`);
    }

    const token = await this.getToken();
    const res = await fetch(`${this.authUrl}/api/users?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }

    const backendResponse = (await res.json()) as BackendPaginatedUsers;

    const frontendUsers: User[] = backendResponse.users.map((backendUser) => ({
      id: backendUser.id,
      name: backendUser.email ?? "Unknown",
    }));

    return {
      users: frontendUsers,
      page: backendResponse.page + 1,
      page_size: backendResponse.pageSize,
      count: backendResponse.total,
    };
  }

  async shareSnippet(
      snippetId: string,
      userId: string,
      permissions?: SharePermissions,
  ): Promise<Snippet> {
    const payload = {
      userId,
      canRead: permissions?.canRead ?? true,
      canEdit: permissions?.canEdit ?? false,
    };

    return this.request<Snippet>(
        `/snippets/${encodeURIComponent(snippetId)}/share`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
    );
  }

  async formatSnippet(snippetId: string, version: string): Promise<string> {
    const token = await this.getToken();

    const params = new URLSearchParams({
      snippetId: snippetId,
      version: version,
    });

    const url = `${this.snippetUrl}/format/preview?${params.toString()}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        spaceBeforeColon: true,
        spaceAfterColon: true,
        spacesInAssignation: 1,
        newLineBeforePrintln: 1,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Format failed - HTTP ${res.status}: ${txt}`);
    }

    return res.text();
  }

  async analyzeSnippet(
      snippetId: string,
      version: string,
  ): Promise<AnalyzeResult> {
    const token = await this.getToken();

    const params = new URLSearchParams({
      snippetId: snippetId,
      version: version,
    });

    const url = `${this.snippetUrl}/analyze?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Analysis failed - HTTP ${res.status}: ${txt}`);
    }

    return (await res.json()) as AnalyzeResult;
  }

  async compileSnippet(
      snippetId: string,
      version: string,
  ): Promise<AnalyzeResult> {
    const token = await this.getToken();

    const params = new URLSearchParams({
      snippetId: snippetId,
      version: version,
    });

    const url = `${this.snippetUrl}/analyze/compile?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Compilation failed - HTTP ${res.status}: ${txt}`);
    }

    return (await res.json()) as AnalyzeResult;
  }

  async validateContent(
      content: string,
      language: string,
      version: string,
  ): Promise<AnalyzeResult> {
    const token = await this.getToken();

    const url = `${this.snippetUrl}/snippets/validate-content`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: content,
        language: language,
        version: version,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Validation failed - HTTP ${res.status}: ${txt}`);
    }

    return (await res.json()) as AnalyzeResult;
  }

  async getTestCases(snippetId: string): Promise<TestCase[]> {
    const params = new URLSearchParams();
    params.set("snippetId", snippetId);

    const raw = await this.request<any[]>(`/testcases?${params.toString()}`);
    return raw.map(t => ({
      id: String(t.id ?? ''),
      snippetId: t.snippetId,
      name: t.name,
      inputs: t.inputs || [],
      expectedOutputs: t.expectedOutputs || []
    }));
  }

  async createTestCase(request: Partial<TestCase>): Promise<TestCase> {
    const payload = {
      snippetId: request.snippetId,
      name: request.name,
      inputs: request.inputs ?? [],
      expectedOutputs: request.expectedOutputs ?? [],
    };

    return this.request<TestCase>(`/testcases`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
    return this.createTestCase(testCase);
  }

  async removeTestCase(id: string): Promise<string> {
    const token = await this.getToken();
    const res = await fetch(`${this.snippetUrl}/testcases/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return id;
  }

  async testSnippet(
      snippetId: string,
      version: string,
      testId: number,
  ): Promise<TestCaseResult> {
    const token = await this.getToken();
    const url = `${this.snippetUrl}/tests/execute`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        snippetId: parseInt(snippetId),
        version: version,
        testId: testId,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  }

  async deleteSnippet(id: string): Promise<string> {
    await this.request(`/snippets/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return id;
  }

  async getFileTypes(): Promise<FileType[]> {
    return this.request<FileType[]>(`/filetypes`);
  }

  private async _getRules(ruleType: "format" | "analyze"): Promise<Rule[]> {
    const token = await this.getToken();

    const url = `${this.printscriptUrl}/config/${ruleType}`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(
          `Failed to get ${ruleType} rules - HTTP ${res.status}: ${txt}`,
      );
    }

    return (await res.json()) as Rule[];
  }

  async getFormatRules(): Promise<Rule[]> {
    return this._getRules("format");
  }

  async getLintingRules(): Promise<Rule[]> {
    return this._getRules("analyze");
  }

  private async _modifyRule(
      newRules: Rule[],
      ruleType: "format" | "analyze",
  ): Promise<Rule[]> {
    const token = await this.getToken();
    const url = `${this.printscriptUrl}/config/update/${ruleType}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rules: newRules }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(
          `Failed to update ${ruleType} rules - HTTP ${res.status}: ${txt}`,
      );
    }

    return (await res.json()) as Rule[];
  }

  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    return this._modifyRule(newRules, "format");
  }

  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    return this._modifyRule(newRules, "analyze");
  }

  private mapBackendSnippetToSnippet(backendSnippet: BackendSnippet): Snippet {
    return {
      id: String(backendSnippet.snippetId ?? "0"),
      name: backendSnippet.name,
      description: backendSnippet.description ?? "",
      content: backendSnippet.content ?? "",
      language: backendSnippet.language,
      version: backendSnippet.version,
      extension: this.getExtensionFromLanguage(backendSnippet.language),
      compliance: backendSnippet.complianceStatus ?? "pending",
      complianceStatus:
          backendSnippet.complianceStatus ?? backendSnippet.complianceStatus,
      author: backendSnippet.author ?? "Unknown Author",
    };
  }
}