class CodeExecutor {
  constructor() {
    this.timeoutMs = 5000; // 5 second timeout
  }

  // Execute code with input and capture output
  executeCode(code, input = '', timeoutMs = this.timeoutMs) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let output = '';
      let error = null;
      let timedOut = false;

      // Create isolated execution environment
      const originalConsole = console.log;
      const logs = [];
      
      // Override console.log to capture output
      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };

      // Create input simulation
      const inputLines = input.trim().split('\n');
      let inputIndex = 0;
      
      const readline = () => {
        if (inputIndex < inputLines.length) {
          return inputLines[inputIndex++];
        }
        return '';
      };

      // Setup timeout
      const timeoutId = setTimeout(() => {
        timedOut = true;
      }, timeoutMs);

      try {
        // Create function with input simulation
        const wrappedCode = `
          const readline = ${readline.toString()};
          const input = \`${input}\`;
          const inputLines = input.trim().split('\\n');
          let inputIndex = 0;
          
          const readLine = () => {
            if (inputIndex < inputLines.length) {
              return inputLines[inputIndex++];
            }
            return '';
          };
          
          // Execute user code
          ${code}
        `;

        // Execute with timeout check
        const executeWithTimeout = new Function(wrappedCode);
        executeWithTimeout();

        if (timedOut) {
          error = 'Time Limit Exceeded';
        } else {
          output = logs.join('\n');
        }
      } catch (err) {
        error = err.message;
      } finally {
        clearTimeout(timeoutId);
        console.log = originalConsole; // Restore console
      }

      const executionTime = Date.now() - startTime;

      resolve({
        success: !error && !timedOut,
        output: output.trim(),
        error,
        executionTime,
        timedOut
      });
    });
  }

  // Run code against test cases
  async runTestCases(code, testCases) {
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await this.executeCode(code, testCase.inputData);
      
      const passed = result.success && 
                    result.output.trim() === testCase.expectedOutput.trim();
      
      results.push({
        testCaseIndex: i,
        input: testCase.inputData,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        passed,
        error: result.error,
        executionTime: result.executionTime,
        timedOut: result.timedOut
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const score = Math.round((passedCount / testCases.length) * 100);

    return {
      results,
      passedCount,
      totalCount: testCases.length,
      score,
      allPassed: passedCount === testCases.length
    };
  }

  // Quick run with sample test cases only
  async runSample(code, sampleTestCases) {
    return this.runTestCases(code, sampleTestCases);
  }

  // Full submission run with all test cases
  async runSubmission(code, allTestCases) {
    return this.runTestCases(code, allTestCases);
  }
}

export default new CodeExecutor();