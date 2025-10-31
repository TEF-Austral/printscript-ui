import { ComplianceEnum } from "../utils/snippet";

export type BackendSnippet = {
  snippetId: number | string;
  name: string;
  description: string;
  bucketKey: string;
  bucketContainer: string;
  language: string;
  version: string;
  author?: string;
  compliance?: ComplianceEnum;
};
