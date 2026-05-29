using System;
using System.Collections;
using System.Linq;
using System.Threading.Tasks;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Services;
using Moq;
using Xunit;

namespace AlgorithmBattleArena.Tests
{
    public class Services_LocalMicroCourseServiceTests
    {
        private static ProblemResponseDto CreateProblem()
        {
            return new ProblemResponseDto
            {
                ProblemId = 1,
                Title = "Two Sum",
                Description = "Find two numbers...",
                DifficultyLevel = "Easy",
                Category = "Arrays",
                TimeLimit = 1,
                MemoryLimit = 256,
                CreatedBy = "tester",
                Tags = "array,sum"
            };
        }

        [Fact]
        public async Task GenerateMicroCourseAsync_ReturnsNull_WhenProblemNotFound()
        {
            // Arrange
            var repo = new Mock<IProblemRepository>(MockBehavior.Strict);
            repo.Setup(r => r.GetProblem(123)).ReturnsAsync((ProblemResponseDto?)null);

            var sut = new LocalMicroCourseService(repo.Object);

            // Act
            var result = await sut.GenerateMicroCourseAsync(123, new MicroCourseRequestDto(), "user-1");

            // Assert
            Assert.Null(result);
            repo.Verify(r => r.GetProblem(123), Times.Once);
        }

        [Fact]
        public async Task GenerateMicroCourseAsync_ReturnsStructuredObject_WhenProblemExists()
        {
            // Arrange
            var repo = new Mock<IProblemRepository>(MockBehavior.Strict);
            repo.Setup(r => r.GetProblem(1)).ReturnsAsync(CreateProblem());

            var sut = new LocalMicroCourseService(repo.Object);

            // Act
            var result = await sut.GenerateMicroCourseAsync(1, new MicroCourseRequestDto
            {
                Language = "csharp",
                TimeLimitSeconds = 300,
                RemainingSec = 120
            }, "user-1");

            // Assert
            Assert.NotNull(result);

            // Use reflection to assert on anonymous object properties
            var type = result!.GetType();
            var microCourseIdProp = type.GetProperty("microCourseId");
            var summaryProp = type.GetProperty("summary");
            var stepsProp = type.GetProperty("steps");

            Assert.NotNull(microCourseIdProp);
            Assert.NotNull(summaryProp);
            Assert.NotNull(stepsProp);

            var microCourseId = microCourseIdProp!.GetValue(result)?.ToString();
            Assert.False(string.IsNullOrWhiteSpace(microCourseId));

            var stepsObj = stepsProp!.GetValue(result);
            Assert.NotNull(stepsObj);

            // steps is an array of objects
            var stepsEnumerable = (stepsObj as IEnumerable)!;
            var stepsCount = stepsEnumerable.Cast<object>().Count();
            Assert.True(stepsCount >= 3);

            repo.Verify(r => r.GetProblem(1), Times.Once);
        }
    }
}
