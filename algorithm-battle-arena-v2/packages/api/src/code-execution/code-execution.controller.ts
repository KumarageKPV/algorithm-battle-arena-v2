import {
  Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CodeExecutionService } from './code-execution.service';

/**
 * Exposes the Judge0-backed code execution service.
 * "Run" (single stdin) and "RunTestCases" (array of test cases with scoring).
 */
@Controller('api/CodeExecution')
@UseGuards(JwtAuthGuard)
export class CodeExecutionController {
  private readonly logger = new Logger(CodeExecutionController.name);

  constructor(private readonly codeExecService: CodeExecutionService) {}

  /**
   * Run code against a single stdin input.
   */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runCode(
    @Body() body: { code: string; language: string; stdin?: string; timeoutSec?: number },
  ) {
    if (!body.code || !body.language) {
      throw new BadRequestException('code and language are required');
    }

    return this.codeExecService.executeCode(
      body.code,
      body.language,
      body.stdin || '',
      body.timeoutSec ?? 5,
    );
  }

  /**
   * Run code against an array of test cases and return a score.
   * Used for server-side tamper-proof submission scoring.
   */
  @Post('run-tests')
  @HttpCode(HttpStatus.OK)
  async runTestCases(
    @Body() body: {
      code: string;
      language: string;
      testCases: Array<{ inputData: string; expectedOutput: string }>;
    },
  ) {
    if (!body.code || !body.language) {
      throw new BadRequestException('code and language are required');
    }
    if (!body.testCases || !Array.isArray(body.testCases) || body.testCases.length === 0) {
      throw new BadRequestException('testCases array is required and must not be empty');
    }

    return this.codeExecService.runTestCases(body.code, body.language, body.testCases);
  }
}

