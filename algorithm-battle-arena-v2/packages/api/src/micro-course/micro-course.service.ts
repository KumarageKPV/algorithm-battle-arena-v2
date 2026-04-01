import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProblemRepoService } from '../problems/problem-repo.service';

/**
 * Port of C# IMicroCourseService + OpenAiMicroCourseService + LocalMicroCourseService.
 * Uses OpenAI gpt-4o-mini when API key is available; falls back to local hardcoded guide.
 */
@Injectable()
export class MicroCourseService {
  private readonly logger = new Logger(MicroCourseService.name);
  private readonly apiKey: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly problemRepo: ProblemRepoService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (this.apiKey) {
      this.logger.log('OpenAI API key configured — using GPT-4o-mini for micro-courses');
    } else {
      this.logger.warn('OpenAI API key not configured — using local fallback micro-courses');
    }
  }

  async generateMicroCourse(problemId: number, request: any, userId: string): Promise<any> {
    const problem = await this.problemRepo.getProblem(problemId);
    if (!problem) return null;

    if (!this.apiKey) {
      return this.getLocalFallback(problem.title);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          max_tokens: 800,
          messages: [
            {
              role: 'system',
              content: 'You are a concise tutor. Return ONLY valid JSON with fields: summary, steps, disclaimer. Steps is array of objects with: title, durationSec, content, example, resources. Keep content brief. Do NOT include solution code.',
            },
            {
              role: 'user',
              content: `Problem: "${problem.title}"\nDescription: ${problem.description}\nLanguage: ${request.language || 'JavaScript'}\nTime remaining: ${request.remainingSec || 'N/A'} seconds`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      // Strip markdown code fences if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      // Extract first JSON object
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return null;
    } catch (error) {
      this.logger.error('OpenAI micro-course generation failed, using fallback', error);
      return this.getLocalFallback(problem.title);
    }
  }

  private getLocalFallback(problemTitle: string): any {
    return {
      summary: `Learning guide for "${problemTitle}"`,
      steps: [
        {
          title: 'Understand the Core Idea',
          durationSec: 120,
          content: 'Read the problem statement carefully. Identify the input format, output format, and constraints.',
          example: 'Break down the problem into smaller sub-problems.',
          resources: ['https://www.geeksforgeeks.org/fundamentals-of-algorithms/'],
        },
        {
          title: 'Sketch Small Examples',
          durationSec: 120,
          content: 'Work through the sample test cases by hand. Draw diagrams if the problem involves data structures.',
          example: 'Try edge cases: empty input, single element, maximum size.',
          resources: [],
        },
        {
          title: 'Choose a Strategy',
          durationSec: 120,
          content: 'Decide on an approach: brute force, two pointers, sliding window, recursion, dynamic programming, etc.',
          example: 'Consider time complexity. Can you do better than O(n²)?',
          resources: [],
        },
      ],
      disclaimer: 'This guide provides learning direction without revealing the solution.',
    };
  }
}

