export type TestCase = {
  id: string | null;
  snippetId: number;
  name: string;
  inputs?: string[];
  expectedOutputs?: string[];
};