import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProblemRepoService } from '../problems/problem-repo.service';
import { MicroCourseRequestDto, MicroCourseResponseDto, MicroCourseStepDto } from '../problems/dto/problems.dto';

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
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    if (this.apiKey) {
      this.logger.log('OpenAI API key configured — using GPT-4o-mini for micro-courses');
    } else {
      this.logger.warn('OpenAI API key not configured — using local fallback micro-courses');
    }
  }

  async generateMicroCourse(
    problemId: number,
    request: MicroCourseRequestDto,
    userId: string,
  ): Promise<MicroCourseResponseDto | null> {
    const problemRaw = await this.problemRepo.getProblem(problemId);
    if (!problemRaw) return null;

    // Convert BigInt fields to numbers for JSON serialization
    const problem = {
      ...problemRaw,
      problemId: Number(problemRaw.problemId),
      testCases: problemRaw.testCases?.map(tc => ({
        ...tc,
        testCaseId: Number(tc.testCaseId),
        problemId: Number(tc.problemId),
      })),
      solutions: problemRaw.solutions?.map(sol => ({
        ...sol,
        solutionId: Number(sol.solutionId),
        problemId: Number(sol.problemId),
      })),
    };

    if (!this.apiKey) {
      return this.getLocalFallback(problem.title, problem.category ?? undefined, problem.difficultyLevel ?? undefined);
    }

    try {
      const systemPrompt =
        'You are a concise algorithm tutor. Analyze the problem and identify its type (e.g., Array, String, Dynamic Programming, Graph, Tree, etc.). ' +
        'Return ONLY valid JSON with fields: problemType, summary, steps, disclaimer. ' +
        'Steps is array of objects with: title, durationSec, content, example, resources. ' +
        'Resources MUST be actual URLs from reputed academic and educational sources: ' +
        '1. Academic papers (arxiv.org, ACM Digital Library, IEEE Xplore, Google Scholar links) ' +
        '2. University course materials (MIT OpenCourseWare, Stanford, CMU, etc.) ' +
        '3. Authoritative algorithm resources (CLRS textbook references, Algorithm Design Manual) ' +
        '4. Research-backed educational platforms (GeeksforGeeks with citations, Wikipedia algorithm pages) ' +
        'Provide 3-5 high-quality, verifiable URLs per step. Prioritize academic sources over tutorials. ' +
        'Keep content brief and focused on the problem type. Do NOT include solution code.';

      const userPrompt =
        `Problem Title: ${problem.title}\n` +
        `Description: ${problem.description}\n` +
        `Category: ${problem.category || 'General'}\n` +
        `Difficulty: ${problem.difficultyLevel || 'Medium'}\n` +
        `Language: ${request.language || 'general'}\n` +
        `TimeLimitSeconds: ${request.timeLimitSeconds || 0}\n` +
        `RemainingSec: ${request.remainingSec || 0}\n` +
        'First, identify the problem type (e.g., Two Pointers, Sliding Window, BFS, DFS, DP, etc.). ' +
        'Then create 3-4 learning steps specific to that problem type with URLs to academic articles and reputed sources. ' +
        'Each step should have 3-5 real, verifiable URLs from: arxiv.org, ACM, IEEE, university courses, or research-backed platforms. ' +
        'Include the exact article title or paper name in the URL when possible. Return only JSON. Do not include the solution.';

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          max_tokens: 1200,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      if (!content) {
        this.logger.warn('OpenAI returned empty content');
        return this.getLocalFallback(problem.title, problem.category ?? undefined, problem.difficultyLevel ?? undefined);
      }

      this.logger.debug(`OpenAI response content: ${content}`);

      // Clean content - remove markdown code fences if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) cleanContent = cleanContent.substring(7);
      if (cleanContent.startsWith('```')) cleanContent = cleanContent.substring(3);
      if (cleanContent.endsWith('```')) cleanContent = cleanContent.substring(0, cleanContent.length - 3);
      cleanContent = cleanContent.trim();

      // Extract first JSON object
      const candidate = this.extractFirstJson(cleanContent);

      try {
        const parsed = JSON.parse(candidate);
        return parsed as MicroCourseResponseDto;
      } catch (jex) {
        this.logger.warn(
          `Failed to parse candidate JSON from OpenAI response. Candidate length: ${candidate?.length || 0}. ` +
            `Candidate preview: ${candidate?.substring(0, Math.min(200, candidate.length)) || ''}`,
        );
        return this.getLocalFallback(problem.title, problem.category ?? undefined, problem.difficultyLevel ?? undefined);
      }
    } catch (error) {
      this.logger.error('OpenAI micro-course generation failed, using fallback', error);
      return this.getLocalFallback(problem.title, problem.category ?? undefined, problem.difficultyLevel ?? undefined);
    }
  }

  private extractFirstJson(s: string): string {
    const objStart = s.indexOf('{');
    const arrStart = s.indexOf('[');
    let start = -1;
    let openChar = '';

    if (objStart >= 0 && (arrStart === -1 || objStart < arrStart)) {
      start = objStart;
      openChar = '{';
    } else if (arrStart >= 0) {
      start = arrStart;
      openChar = '[';
    }

    if (start === -1) return s;

    let depth = 0;
    for (let i = start; i < s.length; i++) {
      if (s[i] === openChar) depth++;
      else if (openChar === '{' && s[i] === '}') depth--;
      else if (openChar === '[' && s[i] === ']') depth--;

      if (depth === 0) {
        return s.substring(start, i + 1);
      }
    }

    return s;
  }

  private getLocalFallback(problemTitle: string, category?: string, difficulty?: string): MicroCourseResponseDto {
    // Determine problem type based on category
    const problemType = this.identifyProblemType(category, problemTitle);
    const resources = this.getResourcesByType(problemType);

    return {
      microCourseId: this.generateGuid(),
      problemType,
      summary: `This appears to be a ${problemType} problem. Here's a structured approach to solve it.`,
      disclaimer: 'This micro-course provides learning guidance and does not reveal the solution.',
      steps: [
        {
          title: 'Understand the Problem Type',
          durationSec: 90,
          content:
            `This is a ${problemType} problem. Identify the input format, output format, and constraints. ` +
            'Look for keywords that hint at the algorithm pattern needed.',
          example: `Common ${problemType} patterns: ${this.getPatternExamples(problemType)}`,
          resources: resources.understanding,
        },
        {
          title: 'Analyze with Small Examples',
          durationSec: 90,
          content:
            'Work through 1-2 tiny examples by hand to see patterns. Draw diagrams if helpful. ' +
            'Test edge cases: empty input, single element, maximum constraints.',
          example: 'Start with the simplest valid input, then gradually increase complexity',
          resources: resources.examples,
        },
        {
          title: 'Choose the Right Strategy',
          durationSec: 90,
          content:
            `For ${problemType} problems, consider: ${this.getStrategyHints(problemType)}. ` +
            'Think about time and space complexity. Can you optimize?',
          example: this.getStrategyExample(problemType),
          resources: resources.strategy,
        },
        {
          title: 'Implement and Test',
          durationSec: 120,
          content:
            'Start with a brute force solution if needed, then optimize. ' +
            'Test with provided examples first, then create your own edge cases.',
          example: 'Write pseudocode first, then translate to actual code',
          resources: resources.implementation,
        },
      ],
    };
  }

  private identifyProblemType(category?: string, title?: string): string {
    const cat = (category || '').toLowerCase();
    const titleLower = (title || '').toLowerCase();

    if (cat.includes('array') || titleLower.includes('array')) return 'Array Manipulation';
    if (cat.includes('string') || titleLower.includes('string')) return 'String Processing';
    if (cat.includes('tree') || titleLower.includes('tree')) return 'Tree Traversal';
    if (cat.includes('graph') || titleLower.includes('graph')) return 'Graph Algorithm';
    if (cat.includes('dynamic') || titleLower.includes('dynamic')) return 'Dynamic Programming';
    if (cat.includes('sort') || titleLower.includes('sort')) return 'Sorting Algorithm';
    if (cat.includes('search') || titleLower.includes('search')) return 'Search Algorithm';
    if (cat.includes('hash') || titleLower.includes('hash')) return 'Hash Table';
    if (cat.includes('stack') || titleLower.includes('stack')) return 'Stack';
    if (cat.includes('queue') || titleLower.includes('queue')) return 'Queue';
    if (cat.includes('linked') || titleLower.includes('linked')) return 'Linked List';
    if (cat.includes('recursion') || titleLower.includes('recursion')) return 'Recursion';
    if (cat.includes('greedy') || titleLower.includes('greedy')) return 'Greedy Algorithm';
    if (cat.includes('backtrack') || titleLower.includes('backtrack')) return 'Backtracking';
    if (cat.includes('bit') || titleLower.includes('bit')) return 'Bit Manipulation';
    if (cat.includes('math') || titleLower.includes('math')) return 'Mathematical';

    return 'Algorithm Problem';
  }

  private getResourcesByType(problemType: string): {
    understanding: string[];
    examples: string[];
    strategy: string[];
    implementation: string[];
  } {
    const baseResources = {
      understanding: [
        'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
        'https://en.wikipedia.org/wiki/Algorithm',
        'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
      ],
      examples: [
        'https://arxiv.org/list/cs.DS/recent',
        'https://www.geeksforgeeks.org/practice-for-cracking-any-coding-interview/',
        'https://en.wikipedia.org/wiki/List_of_algorithms',
      ],
      strategy: [
        'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/',
        'https://www.geeksforgeeks.org/top-algorithms-and-data-structures-for-competitive-programming/',
        'https://en.wikipedia.org/wiki/Algorithmic_efficiency',
      ],
      implementation: [
        'https://dl.acm.org/topic/ccs2012/10010147.10010257',
        'https://www.geeksforgeeks.org/competitive-programming-a-complete-guide/',
        'https://ieeexplore.ieee.org/browse/standards/collection/ieee',
      ],
    };

    const typeSpecific: Record<string, any> = {
      'Array Manipulation': {
        understanding: [
          'https://en.wikipedia.org/wiki/Array_data_structure',
          'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-2-models-of-computation-document-distance/',
          'https://www.geeksforgeeks.org/array-data-structure/',
        ],
        strategy: [
          'https://arxiv.org/abs/1509.05053',
          'https://www.geeksforgeeks.org/top-50-array-coding-problems-for-interviews/',
          'https://en.wikipedia.org/wiki/Two_pointers_technique',
        ],
      },
      'String Processing': {
        understanding: [
          'https://en.wikipedia.org/wiki/String_(computer_science)',
          'https://en.wikipedia.org/wiki/String-searching_algorithm',
          'https://www.geeksforgeeks.org/string-data-structure/',
        ],
        strategy: [
          'https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm',
          'https://arxiv.org/abs/1012.2547',
          'https://www.geeksforgeeks.org/top-50-string-coding-problems-for-interviews/',
        ],
      },
      'Dynamic Programming': {
        understanding: [
          'https://en.wikipedia.org/wiki/Dynamic_programming',
          'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-19-dynamic-programming-i-fibonacci-shortest-paths/',
          'https://www.geeksforgeeks.org/dynamic-programming/',
        ],
        strategy: [
          'https://arxiv.org/abs/1106.1528',
          'https://dl.acm.org/doi/10.1145/3186893',
          'https://www.geeksforgeeks.org/top-20-dynamic-programming-interview-questions/',
        ],
      },
      'Tree Traversal': {
        understanding: [
          'https://en.wikipedia.org/wiki/Tree_traversal',
          'https://en.wikipedia.org/wiki/Binary_tree',
          'https://www.geeksforgeeks.org/binary-tree-data-structure/',
        ],
        strategy: [
          'https://arxiv.org/abs/1602.06426',
          'https://en.wikipedia.org/wiki/Binary_search_tree',
          'https://www.geeksforgeeks.org/top-50-tree-coding-problems-for-interviews/',
        ],
      },
      'Graph Algorithm': {
        understanding: [
          'https://en.wikipedia.org/wiki/Graph_theory',
          'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/pages/readings/',
          'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
        ],
        strategy: [
          'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
          'https://arxiv.org/abs/1504.01917',
          'https://www.geeksforgeeks.org/top-50-graph-coding-problems-for-interviews/',
        ],
      },
    };

    const specific = typeSpecific[problemType];
    if (specific) {
      return {
        understanding: specific.understanding || baseResources.understanding,
        examples: baseResources.examples,
        strategy: specific.strategy || baseResources.strategy,
        implementation: baseResources.implementation,
      };
    }

    return baseResources;
  }

  private getPatternExamples(problemType: string): string {
    const patterns: Record<string, string> = {
      'Array Manipulation': 'Two Pointers, Sliding Window, Prefix Sum, Kadane\'s Algorithm',
      'String Processing': 'Two Pointers, Sliding Window, KMP, Rabin-Karp',
      'Dynamic Programming': 'Memoization, Tabulation, State Transition',
      'Tree Traversal': 'DFS (Preorder, Inorder, Postorder), BFS, Level Order',
      'Graph Algorithm': 'BFS, DFS, Dijkstra, Union-Find, Topological Sort',
      'Sorting Algorithm': 'Quick Sort, Merge Sort, Heap Sort, Counting Sort',
      'Search Algorithm': 'Binary Search, Linear Search, DFS, BFS',
      'Hash Table': 'Hash Map, Hash Set, Frequency Counter',
      'Stack': 'Monotonic Stack, Expression Evaluation, Backtracking',
      'Queue': 'BFS, Sliding Window, Priority Queue',
      'Linked List': 'Two Pointers, Fast & Slow Pointers, Reversal',
      'Recursion': 'Divide and Conquer, Backtracking, Tree Recursion',
      'Greedy Algorithm': 'Activity Selection, Huffman Coding, Interval Scheduling',
      'Backtracking': 'N-Queens, Sudoku, Permutations, Combinations',
      'Bit Manipulation': 'XOR, Bit Masking, Counting Bits',
    };
    return patterns[problemType] || 'Pattern Recognition, Problem Decomposition';
  }

  private getStrategyHints(problemType: string): string {
    const hints: Record<string, string> = {
      'Array Manipulation': 'two pointers for sorted arrays, sliding window for subarrays, hash map for lookups',
      'String Processing': 'two pointers, sliding window, or dynamic programming for subsequences',
      'Dynamic Programming': 'identify overlapping subproblems, define state and transitions',
      'Tree Traversal': 'recursion for DFS, queue for BFS, consider parent pointers',
      'Graph Algorithm': 'BFS for shortest path, DFS for connectivity, Union-Find for components',
      'Sorting Algorithm': 'compare-based vs non-compare-based, stability requirements',
      'Search Algorithm': 'binary search for sorted data, hash table for O(1) lookup',
      'Hash Table': 'frequency counting, fast lookups, handling collisions',
      'Stack': 'LIFO operations, matching pairs, monotonic stack for next greater',
      'Queue': 'FIFO operations, BFS traversal, sliding window maximum',
      'Linked List': 'two pointers (fast/slow), dummy nodes, in-place reversal',
      'Recursion': 'base case, recursive case, memoization for optimization',
      'Greedy Algorithm': 'local optimal choices, proof of correctness',
      'Backtracking': 'explore all possibilities, prune invalid branches',
      'Bit Manipulation': 'XOR properties, bit masks, power of 2 checks',
    };
    return hints[problemType] || 'break down the problem, identify patterns, consider edge cases';
  }

  private getStrategyExample(problemType: string): string {
    const examples: Record<string, string> = {
      'Array Manipulation': 'For finding pairs: use two pointers on sorted array O(n) vs nested loops O(n²)',
      'String Processing': 'For palindrome: two pointers from ends vs reverse and compare',
      'Dynamic Programming': 'Fibonacci: memoization O(n) vs naive recursion O(2ⁿ)',
      'Tree Traversal': 'Inorder traversal of BST gives sorted order',
      'Graph Algorithm': 'BFS finds shortest path in unweighted graph',
      'Sorting Algorithm': 'Quick Sort O(n log n) average, O(n²) worst case',
      'Search Algorithm': 'Binary Search O(log n) vs Linear Search O(n)',
      'Hash Table': 'Two Sum: hash map O(n) vs nested loops O(n²)',
      'Stack': 'Valid Parentheses: push opening, pop on closing',
      'Queue': 'Level Order Traversal: use queue for BFS',
      'Linked List': 'Detect Cycle: fast pointer moves 2x, slow moves 1x',
      'Recursion': 'Tree Height: max(left, right) + 1',
      'Greedy Algorithm': 'Activity Selection: sort by end time, pick non-overlapping',
      'Backtracking': 'Generate Permutations: swap and recurse',
      'Bit Manipulation': 'Check if power of 2: n & (n-1) == 0',
    };
    return examples[problemType] || 'Consider time-space tradeoffs and optimize iteratively';
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

