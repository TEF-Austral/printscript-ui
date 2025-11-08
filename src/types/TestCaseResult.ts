export type TestCaseResult = {
    testId: number;
    passed: boolean;
    outputs: string[];
    expectedOutputs: string[];
    errors: string[];
}