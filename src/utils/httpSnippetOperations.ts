import { SnippetOperations } from "./snippetOperations";
import {
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

// Minimal HTTP implementation using fetch. Adjust endpoints to match your backend API.
export class HttpSnippetOperations implements SnippetOperations {
  private base = BACKEND_URL;

  private async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      headers: {
        "Content-Type": "application/json",
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
    return this.request<PaginatedSnippets>(`/snippets?${params.toString()}`);
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
    const res = await fetch(`${this.base}/format`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
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
