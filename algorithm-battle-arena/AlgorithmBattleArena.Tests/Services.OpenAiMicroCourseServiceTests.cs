using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AlgorithmBattleArena.Tests
{
    public class Services_OpenAiMicroCourseServiceTests
    {
        private static ProblemResponseDto CreateProblem()
        {
            return new ProblemResponseDto
            {
                ProblemId = 42,
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

        private sealed class FuncHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, HttpResponseMessage> _handler;
            public FuncHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
            {
                _handler = handler;
            }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                return Task.FromResult(_handler(request));
            }
        }

        [Fact]
        public async Task GenerateMicroCourseAsync_Throws_WhenApiKeyMissing()
        {
            // Arrange
            var original = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            try
            {
                Environment.SetEnvironmentVariable("OPENAI_API_KEY", string.Empty);

                var repo = new Mock<IProblemRepository>();
                repo.Setup(r => r.GetProblem(1)).ReturnsAsync(CreateProblem());

                var httpClient = new HttpClient(new FuncHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)));
                var factory = new Mock<IHttpClientFactory>();
                factory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

                var logger = new Mock<ILogger<OpenAiMicroCourseService>>();

                var sut = new OpenAiMicroCourseService(repo.Object, factory.Object, logger.Object);

                // Act + Assert
                await Assert.ThrowsAsync<InvalidOperationException>(() =>
                    sut.GenerateMicroCourseAsync(1, new MicroCourseRequestDto(), "user-1"));
            }
            finally
            {
                Environment.SetEnvironmentVariable("OPENAI_API_KEY", original);
            }
        }

        [Fact]
        public async Task GenerateMicroCourseAsync_ReturnsNull_WhenApiReturnsNonSuccess()
        {
            // Arrange
            var original = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            try
            {
                Environment.SetEnvironmentVariable("OPENAI_API_KEY", "test-key");

                var repo = new Mock<IProblemRepository>();
                repo.Setup(r => r.GetProblem(1)).ReturnsAsync(CreateProblem());

                var httpClient = new HttpClient(new FuncHandler(_ =>
                {
                    return new HttpResponseMessage(HttpStatusCode.BadRequest)
                    {
                        Content = new StringContent("{\"error\":\"bad request\"}", Encoding.UTF8, "application/json")
                    };
                }));

                var factory = new Mock<IHttpClientFactory>();
                factory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);
                var logger = new Mock<ILogger<OpenAiMicroCourseService>>();

                var sut = new OpenAiMicroCourseService(repo.Object, factory.Object, logger.Object);

                // Act
                var result = await sut.GenerateMicroCourseAsync(1, new MicroCourseRequestDto(), "user-1");

                // Assert
                Assert.Null(result);
            }
            finally
            {
                Environment.SetEnvironmentVariable("OPENAI_API_KEY", original);
            }
        }

        [Fact]
        public async Task GenerateMicroCourseAsync_ParsesJsonContent_WhenApiRespondsOk()
        {
            // Arrange
            var original = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            try
            {
                Environment.SetEnvironmentVariable("OPENAI_API_KEY", "test-key");

                var repo = new Mock<IProblemRepository>();
                repo.Setup(r => r.GetProblem(1)).ReturnsAsync(CreateProblem());

                var innerJson = JsonSerializer.Serialize(new
                {
                    summary = "Short summary",
                    steps = new object[]
                    {
                        new { title = "A", durationSec = 60, content = "c", example = "e", resources = new[] { "r1" } }
                    },
                    disclaimer = "No solutions here"
                });

                var openAiResponse = JsonSerializer.Serialize(new
                {
                    choices = new[]
                    {
                        new { message = new { content = $"```json\n{innerJson}\n```" } }
                    }
                });

                var httpClient = new HttpClient(new FuncHandler(_ =>
                {
                    return new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StringContent(openAiResponse, Encoding.UTF8, "application/json")
                    };
                }));

                var factory = new Mock<IHttpClientFactory>();
                factory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);
                var logger = new Mock<ILogger<OpenAiMicroCourseService>>();

                var sut = new OpenAiMicroCourseService(repo.Object, factory.Object, logger.Object);

                // Act
                var result = await sut.GenerateMicroCourseAsync(1, new MicroCourseRequestDto(), "user-1");

                // Assert
                Assert.NotNull(result);

                // Re-serialize to inspect content without relying on dynamic
                var serialized = JsonSerializer.Serialize(result);
                Assert.Contains("summary", serialized);
                Assert.Contains("steps", serialized);
                Assert.Contains("disclaimer", serialized);
            }
            finally
            {
                Environment.SetEnvironmentVariable("OPENAI_API_KEY", original);
            }
        }
    }
}
