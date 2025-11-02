import {
  CreateSnippet,
  PaginatedSnippets,
  Snippet,
  UpdateSnippet,
} from "./snippet";
import { PaginatedUsers } from "./users.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "./queries.tsx";
import { FileType } from "../types/FileType.ts";
import { Rule } from "../types/Rule.ts";
import { SnippetFilters } from "../types/SnippetFilter.types.ts";

export type SharePermissions = { canRead: boolean; canEdit: boolean };

export type LintViolation = {
  message: string;
  line: number;
  column: number;
};

export type AnalyzeResult = {
  isValid: boolean;
  violations: LintViolation[];
};

export interface SnippetOperations {
  listSnippetDescriptors(
      page: number,
      pageSize: number,
      filters: SnippetFilters,
  ): Promise<PaginatedSnippets>;

  createSnippet(createSnippet: CreateSnippet): Promise<Snippet>;

  getSnippetById(id: string): Promise<Snippet | undefined>;

  updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet>;

  getUserFriends(
      email?: string,
      page?: number,
      pageSize?: number,
  ): Promise<PaginatedUsers>;

  shareSnippet(
      snippetId: string,
      userId: string,
      permissions?: SharePermissions,
  ): Promise<Snippet>;

  getTestCases(): Promise<TestCase[]>;

  // Updated signature - now takes snippetId and version
  formatSnippet(snippetId: string, version: string): Promise<string>;

  // New method for analyzing snippets
  analyzeSnippet(snippetId: string, version: string): Promise<AnalyzeResult>;

  postTestCase(testCase: Partial<TestCase>): Promise<TestCase>;

  removeTestCase(id: string): Promise<string>;

  deleteSnippet(id: string): Promise<string>;

  testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult>;

  getFileTypes(): Promise<FileType[]>;

  getFormatRules(): Promise<Rule[]>;

  getLintingRules(): Promise<Rule[]>;

  modifyFormatRule(newRules: Rule[]): Promise<Rule[]>;

  modifyLintingRule(newRules: Rule[]): Promise<Rule[]>;
}