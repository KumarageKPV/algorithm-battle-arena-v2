/**
 * Client-side JavaScript code executor — port of v1 codeExecutor.js.
 * Executes user code in an isolated context with console.log capture.
 * Used for "Run" (client-side); "Submit" uses server-side Judge0.
 */

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  executionTime: number;
  timedOut: boolean;
}

export interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error: string | null;
  executionTime: number;
  timedOut: boolean;
}

export interface TestRunResult {
  results: TestCaseResult[];
  passedCount: number;
  totalCount: number;
  score: number;
  allPassed: boolean;
}

class CodeExecutor {
  private timeoutMs = 5000;

  executeCode(code: string, input = "", timeoutMs = this.timeoutMs): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let output = "";
      let error: string | null = null;
      let timedOut = false;

      const originalConsole = console.log;
      const logs: string[] = [];

      console.log = (...args: any[]) => {
        logs.push(args.map((a) => String(a)).join(" "));
      };

      const timeoutId = setTimeout(() => { timedOut = true; }, timeoutMs);

      try {
        const wrappedCode = `
          const input = \`${input.replace(/`/g, "\\`")}\`;
          const inputLines = input.trim().split('\\n');
          let inputIndex = 0;
          const readLine = () => inputIndex < inputLines.length ? inputLines[inputIndex++] : '';
          const readline = readLine;
          ${code}
        `;
        const fn = new Function(wrappedCode);
        fn();
        if (timedOut) { error = "Time Limit Exceeded"; } else { output = logs.join("\n"); }
      } catch (err: any) {
        error = err.message;
      } finally {
        clearTimeout(timeoutId);
        console.log = originalConsole;
      }

      resolve({ success: !error && !timedOut, output: output.trim(), error, executionTime: Date.now() - startTime, timedOut });
    });
  }

  async runTestCases(code: string, testCases: Array<{ inputData: string; expectedOutput: string }>): Promise<TestRunResult> {
    const results: TestCaseResult[] = [];
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const result = await this.executeCode(code, tc.inputData);
      const passed = result.success && result.output.trim() === tc.expectedOutput.trim();
      results.push({ testCaseIndex: i, input: tc.inputData, expectedOutput: tc.expectedOutput, actualOutput: result.output, passed, error: result.error, executionTime: result.executionTime, timedOut: result.timedOut });
    }
    const passedCount = results.filter((r) => r.passed).length;
    const score = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;
    return { results, passedCount, totalCount: testCases.length, score, allPassed: passedCount === testCases.length };
  }

  async runSample(code: string, cases: Array<{ inputData: string; expectedOutput: string }>) { return this.runTestCases(code, cases); }
  async runSubmission(code: string, cases: Array<{ inputData: string; expectedOutput: string }>) { return this.runTestCases(code, cases); }
}

const codeExecutor = new CodeExecutor();
export default codeExecutor;

