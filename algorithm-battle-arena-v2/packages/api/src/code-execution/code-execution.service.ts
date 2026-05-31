import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/** Judge0 language ID mapping. */
const LANGUAGE_IDS: Record<string, number> = {
  c: 50,
  gcc: 50,
  python: 71,
  python3: 71,
  java: 62,
  'c++': 54,
  cpp: 54,
};

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  executionTime: number;
  timedOut: boolean;
  memory: number | null;
  status: string;
}

/**
 * Server-side code execution via Judge0.
 * "Run" stays client-side (Web Worker). "Submit" uses this service for tamper-proof scoring.
 */
@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);
  private readonly judge0Url: string;
  private readonly judge0AuthToken?: string;
  private readonly maxPollAttempts: number;
  private readonly pollIntervalMs: number;

  constructor(private readonly configService: ConfigService) {
    this.judge0Url = (
      this.configService.get<string>('JUDGE0_URL')
      || this.configService.get<string>('JUDGE0_API_URL')
      || 'http://localhost:2358'
    ).replace(/\/$/, '');
    this.judge0AuthToken = this.configService.get<string>('JUDGE0_AUTH_TOKEN') || undefined;
    this.maxPollAttempts = Number(this.configService.get<string>('JUDGE0_MAX_POLL_ATTEMPTS') || 20);
    this.pollIntervalMs = Number(this.configService.get<string>('JUDGE0_POLL_INTERVAL_MS') || 500);
  }

  async executeCode(
    code: string, language: string, stdin: string, timeoutSec = 5,
  ): Promise<ExecutionResult> {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return {
        success: false,
        output: '',
        error: `Unsupported language: ${language}`,
        executionTime: 0,
        timedOut: false,
        memory: null,
        status: 'Unsupported Language',
      };
    }

    try {
      const submitResponse = await axios.post(`${this.judge0Url}/submissions`, {
        source_code: this.toBase64(code),
        language_id: languageId,
        stdin: this.toBase64(stdin),
        base64_encoded: true,
        cpu_time_limit: timeoutSec,
        wall_time_limit: Math.max(timeoutSec + 3, timeoutSec),
        memory_limit: 131072,
      }, {
        headers: this.judge0Headers(),
        timeout: timeoutSec * 1000 + 10000,
      });

      const token = submitResponse.data?.token;
      if (!token) {
        throw new Error('Judge0 did not return a submission token');
      }

      const result = await this.getResult(token, timeoutSec);
      const statusId = result.status?.id;
      const stdout = this.fromBase64(result.stdout).trim();
      const stderr = this.fromBase64(result.stderr);
      const compileOutput = this.fromBase64(result.compile_output);

      return {
        success: statusId === 3, // Accepted
        output: stdout,
        error: stderr || compileOutput || null,
        executionTime: parseFloat(result.time || '0') * 1000,
        timedOut: statusId === 5, // Time Limit Exceeded
        memory: result.memory ?? null,
        status: result.status?.description || 'Unknown',
      };
    } catch (error) {
      this.logger.error('Judge0 execution failed', error);
      return {
        success: false,
        output: '',
        error: `Execution service error: ${(error as Error).message}`,
        executionTime: 0,
        timedOut: false,
        memory: null,
        status: 'Execution Service Error',
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
        memory: execResult.memory,
        status: execResult.status,
        error: execResult.error,
      });
    }

    const score = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;
    return {
      score,
      passedCount,
      totalCount: testCases.length,
      allPassed: testCases.length > 0 && passedCount === testCases.length,
      testCaseResults: results,
    };
  }

  private async getResult(token: string, timeoutSec: number) {
    for (let i = 0; i < this.maxPollAttempts; i++) {
      const response = await axios.get(
        `${this.judge0Url}/submissions/${token}?base64_encoded=true`,
        {
          headers: this.judge0Headers(),
          timeout: timeoutSec * 1000 + 10000,
        },
      );
      const result = response.data;
      if (result.status?.id > 2) {
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
    throw new Error('Judge0 timed out');
  }

  private judge0Headers() {
    return this.judge0AuthToken ? { 'X-Auth-Token': this.judge0AuthToken } : undefined;
  }

  private toBase64(value: string) {
    return Buffer.from(value || '').toString('base64');
  }

  private fromBase64(value?: string | null) {
    return value ? Buffer.from(value, 'base64').toString() : '';
  }
}
