import { ComplianceEnum } from "../utils/snippet";

export type BackendSnippet = {
  snippetId: number | string;
  name: string;
  description: string;
  content: string;
  language: string;
  version: string;
  author: string;
  compliance?: ComplianceEnum;
};

export type BackendPaginatedSnippets = {
  page?: number;
  pageSize?: number;
  count?: number;
  snippets: BackendSnippet[];
};
