import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/** Judge0 language ID mapping. */
const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  'c++': 54,
  'c#': 51,
};

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  executionTime: number;
  timedOut: boolean;
}

/**
 * Server-side code execution via Judge0.
 * "Run" stays client-side (Web Worker). "Submit" uses this service for tamper-proof scoring.
 */
@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);
  private readonly judge0Url: string;

  constructor(private readonly configService: ConfigService) {
    this.judge0Url = this.configService.get<string>('JUDGE0_API_URL') || 'http://localhost:2358';
  }

  async executeCode(
    code: string, language: string, stdin: string, timeoutSec = 5,
  ): Promise<ExecutionResult> {
    const languageId = LANGUAGE_IDS[language.toLowerCase()] || 63;

    try {
      // Submit code to Judge0
      const submitResponse = await axios.post(`${this.judge0Url}/submissions?wait=true`, {
        source_code: code,
        language_id: languageId,
        stdin,
        cpu_time_limit: timeoutSec,
      }, { timeout: timeoutSec * 1000 + 10000 });

      const result = submitResponse.data;

      return {
        success: result.status?.id === 3, // Accepted
        output: (result.stdout || '').trim(),
        error: result.stderr || result.compile_output || null,
        executionTime: parseFloat(result.time || '0') * 1000,
        timedOut: result.status?.id === 5, // Time Limit Exceeded
      };
    } catch (error) {
      this.logger.error('Judge0 execution failed', error);
      return {
        success: false,
        output: '',
        error: `Execution service error: ${(error as Error).message}`,
        executionTime: 0,
        timedOut: false,
      };
    }
  }

  async runTestCases(
    code: string, language: string,
    testCases: Array<{ inputData: string; expectedOutput: string }>,
  ) {
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execResult = await this.executeCode(code, language, tc.inputData);
      const passed = execResult.success && execResult.output.trim() === (tc.expectedOutput || '').trim();
      if (passed) passedCount++;

      results.push({
        testCaseIndex: i,
        passed,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.output,
        executionTime: execResult.executionTime,
        error: execResult.error,
      });
    }

    const score = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;
    return { score, passedCount, totalCount: testCases.length, testCaseResults: results };
  }
}

