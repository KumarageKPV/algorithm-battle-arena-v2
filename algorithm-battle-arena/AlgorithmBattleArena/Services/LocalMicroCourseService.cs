using System;
using System.Threading.Tasks;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Repositories;

namespace AlgorithmBattleArena.Services
{
    // Local fallback implementation that returns a small, safe micro-course
    public class LocalMicroCourseService : IMicroCourseService
    {
        private readonly IProblemRepository _problemRepository;

        public LocalMicroCourseService(IProblemRepository problemRepository)
        {
            _problemRepository = problemRepository;
        }

        public async Task<object?> GenerateMicroCourseAsync(int problemId, MicroCourseRequestDto request, string userId)
        {
            var problem = await _problemRepository.GetProblem(problemId);
            if (problem == null)
                return null;

            return new
            {
                microCourseId = Guid.NewGuid().ToString(),
                summary = "Quick concept overview to help approach this problem.",
                disclaimer = "This micro-course provides learning guidance and does not reveal the solution.",
                steps = new object[]
                {
                    new
                    {
                        title = "Understand the core idea",
                        durationSec = 90,
                        content = "Identify input-output relationship and constraints. Think about small examples and what the expected transformation is.",
                        example = "For array problems: input [1,2,3] → what should output be?",
                        resources = new[] { "Algorithm patterns guide", "Problem-solving framework" }
                    },
                    new
                    {
                        title = "Sketch small examples",
                        durationSec = 90,
                        content = "Work through 1-2 tiny examples by hand to see patterns. Avoid trying to solve entire test cases yet.",
                        example = "Try with smallest valid input first, then slightly larger",
                        resources = new[] { "Example-driven development", "Pattern recognition techniques" }
                    },
                    new
                    {
                        title = "Choose a strategy",
                        durationSec = 90,
                        content = "Map the problem to a known pattern (e.g., two pointers, prefix sums, recursion). If unsure, try the simplest approach and refine.",
                        example = "Array traversal → for loop, Search → binary search, etc.",
                        resources = new[] { "Common algorithm patterns", "Data structure cheat sheet" }
                    }
                }
            };
        }
    }
}
