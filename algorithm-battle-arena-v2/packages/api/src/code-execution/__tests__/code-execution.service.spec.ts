import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CodeExecutionService } from '../code-execution.service';

// Mock axios at module level
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CodeExecutionService', () => {
  let service: CodeExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeExecutionService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'JUDGE0_API_URL') return 'http://localhost:2358';
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<CodeExecutionService>(CodeExecutionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeCode', () => {
    it('should return success for accepted submission', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          status: { id: 3, description: 'Accepted' },
          stdout: '42\n',
          stderr: null,
          time: '0.025',
        },
      });

      const result = await service.executeCode('console.log(42)', 'javascript', '');
      expect(result.success).toBe(true);
      expect(result.output).toBe('42');
      expect(result.error).toBeNull();
      expect(result.executionTime).toBe(25);
      expect(result.timedOut).toBe(false);
    });

    it('should return timedOut for TLE', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          status: { id: 5, description: 'Time Limit Exceeded' },
          stdout: null,
          stderr: null,
          time: '5.0',
        },
      });

      const result = await service.executeCode('while(true){}', 'javascript', '');
      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
    });

    it('should return compilation error', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          status: { id: 6, description: 'Compilation Error' },
          stdout: null,
          stderr: null,
          compile_output: 'SyntaxError: unexpected token',
          time: '0',
        },
      });

      const result = await service.executeCode('def foo(', 'python', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('SyntaxError: unexpected token');
    });

    it('should handle network error gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await service.executeCode('print(1)', 'python', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('ECONNREFUSED');
    });

    it('should send correct language ID for JavaScript', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { status: { id: 3 }, stdout: '', time: '0' },
      });

      await service.executeCode('code', 'javascript', 'input');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:2358/submissions?wait=true',
        expect.objectContaining({ language_id: 63, source_code: 'code', stdin: 'input' }),
        expect.any(Object),
      );
    });

    it('should send correct language ID for Python', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { status: { id: 3 }, stdout: '', time: '0' },
      });

      await service.executeCode('code', 'python', '');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ language_id: 71 }),
        expect.any(Object),
      );
    });
  });

  describe('runTestCases', () => {
    it('should score 100% when all test cases pass', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { status: { id: 3 }, stdout: '42\n', time: '0.01' },
      });

      const result = await service.runTestCases('code', 'javascript', [
        { inputData: '1', expectedOutput: '42' },
        { inputData: '2', expectedOutput: '42' },
      ]);

      expect(result.score).toBe(100);
      expect(result.passedCount).toBe(2);
      expect(result.totalCount).toBe(2);
    });

    it('should score 50% when half test cases pass', async () => {
      mockedAxios.post
        .mockResolvedValueOnce({ data: { status: { id: 3 }, stdout: '42\n', time: '0.01' } })
        .mockResolvedValueOnce({ data: { status: { id: 3 }, stdout: 'wrong\n', time: '0.01' } });

      const result = await service.runTestCases('code', 'javascript', [
        { inputData: '1', expectedOutput: '42' },
        { inputData: '2', expectedOutput: '99' },
      ]);

      expect(result.score).toBe(50);
      expect(result.passedCount).toBe(1);
      expect(result.totalCount).toBe(2);
    });

    it('should score 0% when no test cases pass', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { status: { id: 6 }, stdout: null, compile_output: 'error', time: '0' },
      });

      const result = await service.runTestCases('bad code', 'javascript', [
        { inputData: '1', expectedOutput: '42' },
      ]);

      expect(result.score).toBe(0);
      expect(result.passedCount).toBe(0);
    });

    it('should return 0 for empty test cases', async () => {
      const result = await service.runTestCases('code', 'javascript', []);
      expect(result.score).toBe(0);
      expect(result.totalCount).toBe(0);
    });
  });
});

