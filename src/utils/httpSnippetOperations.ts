import { SnippetOperations } from "./snippetOperations";
import {
  ComplianceEnum,
  CreateSnippet,
  PaginatedSnippets,
  Snippet,
  UpdateSnippet,
} from "./snippet";
import { FileType } from "../types/FileType";
import { TestCase } from "../types/TestCase";
import { Rule } from "../types/Rule";
import { TestCaseResult } from "./queries";
import { PaginatedUsers } from "./users";
import { BACKEND_URL } from "./constants";
import { BackendSnippet } from "../types/BackendSnippet.ts";

export class HttpSnippetOperations implements SnippetOperations {
  private base = BACKEND_URL;
  private readonly getToken: () => Promise<string>;

  constructor(getToken: () => Promise<string>) {
    this.getToken = getToken;
  }

  private async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = await this.getToken();

    const res = await fetch(`${this.base}${path}`, {
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
    return this.request<Snippet | undefined>(
      `/snippets/${encodeURIComponent(id)}`,
    );
  }

  async listSnippetDescriptors(
    page: number,
    pageSize: number,
    snippetName?: string,
  ): Promise<PaginatedSnippets> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (snippetName) params.set("name", snippetName);

    const raw = await this.request<PaginatedSnippets | BackendSnippet[]>(
      `/snippets?${params.toString()}`,
    );

    if (Array.isArray(raw)) {
      const snippets: Snippet[] = raw.map((snippet) => ({
        id: String(snippet.snippetId ?? "Unknown ID"),
        name: snippet.name,
        description: snippet.description ?? "Unknown Description",
        language: snippet.language,
        version: snippet.version,
        content: "",
        extension: "",
        compliance: (snippet.compliance ?? "pending") as ComplianceEnum,
        author: snippet.author ?? "Unknown Author",
      }));

      return {
        page,
        page_size: pageSize,
        count: snippets.length,
        snippets,
      };
    }

    // Otherwise assume it's already the expected paginated structure
    return raw as PaginatedSnippets;
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
    name = "",
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedUsers> {
    const params = new URLSearchParams({
      name,
      page: String(page),
      pageSize: String(pageSize),
    });
    return this.request<PaginatedUsers>(`/users/friends?${params.toString()}`);
  }

  async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
    return this.request<Snippet>(
      `/snippets/${encodeURIComponent(snippetId)}/share`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      },
    );
  }

  async getFormatRules(): Promise<Rule[]> {
    return this.request<Rule[]>(`/rules/format`);
  }

  async getLintingRules(): Promise<Rule[]> {
    return this.request<Rule[]>(`/rules/lint`);
  }

  async formatSnippet(snippetContent: string): Promise<string> {
    const token = await this.getToken();
    const res = await fetch(`${this.base}/format`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${token}`,
      },
      body: snippetContent,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async getTestCases(): Promise<TestCase[]> {
    return this.request<TestCase[]>(`/testcases`);
  }

  async postTestCase(testCase: TestCase): Promise<TestCase> {
    return this.request<TestCase>(`/testcases`, {
      method: "POST",
      body: JSON.stringify(testCase),
    });
  }

  async removeTestCase(id: string): Promise<string> {
    await this.request(`/testcases/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return id;
  }

  async testSnippet(): Promise<TestCaseResult> {
    return this.request<TestCaseResult>(`/test`);
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

  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    return this.request<Rule[]>(`/rules/format`, {
      method: "PUT",
      body: JSON.stringify(newRules),
    });
  }

  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    return this.request<Rule[]>(`/rules/lint`, {
      method: "PUT",
      body: JSON.stringify(newRules),
    });
  }
}
