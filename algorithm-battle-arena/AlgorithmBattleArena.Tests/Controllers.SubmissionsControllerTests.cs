using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Tests;

public class SubmissionsControllerTests
{
    private readonly Mock<ISubmissionRepository> _mockSubmissionRepository;
    private readonly AuthHelper _authHelper;
    private readonly SubmissionsController _controller;

    public SubmissionsControllerTests()
    {
        _mockSubmissionRepository = new Mock<ISubmissionRepository>();
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        _authHelper = new AuthHelper(config);
        _controller = new SubmissionsController(_mockSubmissionRepository.Object, _authHelper);
    }

    private void SetupAuthenticatedUser(string userEmail)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, userEmail)
        }, "TestAuth");
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }

    private void SetupUnauthenticatedUser()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity())
            }
        };
    }

    [Fact]
    public async Task CreateSubmission_ValidRequest_ReturnsOkWithSubmissionId()
    {
        // Arrange
        var userEmail = "test@example.com";
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "C#",
            Code = "Console.WriteLine(\"Hello World\");"
        };
        var expectedSubmissionId = 123;

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(expectedSubmissionId);

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value;
        var submissionIdProperty = response?.GetType().GetProperty("SubmissionId");
        Assert.NotNull(submissionIdProperty);
        Assert.Equal(expectedSubmissionId, submissionIdProperty.GetValue(response));
    }

    [Fact]
    public async Task CreateSubmission_ValidRequest_CallsRepositoryWithCorrectData()
    {
        // Arrange
        var userEmail = "test@example.com";
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "Python",
            Code = "print('Hello World')",
            Status = "Submitted"
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(1);

        // Act
        await _controller.CreateSubmission(submissionDto);

        // Assert
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.Is<Submission>(s =>
            s.MatchId == submissionDto.MatchId &&
            s.ProblemId == submissionDto.ProblemId &&
            s.ParticipantEmail == userEmail &&
            s.Language == submissionDto.Language &&
            s.Code == submissionDto.Code &&
            s.Status == submissionDto.Status
        )), Times.Once);
    }

    [Fact]
    public async Task CreateSubmission_UnauthenticatedUser_ReturnsUnauthorized()
    {
        // Arrange
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "Java",
            Code = "System.out.println(\"Hello World\");"
        };

        SetupUnauthenticatedUser();

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.IsAny<Submission>()), Times.Never);
    }

    [Fact]
    public async Task CreateSubmission_EmptyEmail_ReturnsUnauthorized()
    {
        // Arrange
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "JavaScript",
            Code = "console.log('Hello World');"
        };

        SetupAuthenticatedUser("");

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.IsAny<Submission>()), Times.Never);
    }

    [Fact]
    public async Task CreateSubmission_NullEmail_ReturnsUnauthorized()
    {
        // Arrange
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "Go",
            Code = "fmt.Println(\"Hello World\")"
        };

        var identity = new ClaimsIdentity(new Claim[] { }, "TestAuth");
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.IsAny<Submission>()), Times.Never);
    }

    [Fact]
    public async Task CreateSubmission_RepositoryThrowsException_PropagatesException()
    {
        // Arrange
        var userEmail = "test@example.com";
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "Rust",
            Code = "println!(\"Hello World\");"
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _controller.CreateSubmission(submissionDto));
    }

    [Theory]
    [InlineData(0, 1, "C#", "code")]
    [InlineData(1, 0, "Python", "code")]
    [InlineData(-1, 1, "Java", "code")]
    [InlineData(1, -1, "JavaScript", "code")]
    public async Task CreateSubmission_InvalidIds_StillProcessesRequest(int matchId, int problemId, string language, string code)
    {
        // Arrange
        var userEmail = "test@example.com";
        var submissionDto = new SubmissionDto
        {
            MatchId = matchId,
            ProblemId = problemId,
            Language = language,
            Code = code
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.IsAny<Submission>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateSubmission_EmptyOrNullLanguage_StillProcessesRequest(string? language)
    {
        // Arrange
        var userEmail = "test@example.com";
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = language ?? string.Empty,
            Code = "some code"
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.IsAny<Submission>()), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateSubmission_EmptyOrNullCode_StillProcessesRequest(string? code)
    {
        // Arrange
        var userEmail = "test@example.com";
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "C#",
            Code = code ?? string.Empty
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.IsAny<Submission>()), Times.Once);
    }

    [Fact]
    public async Task CreateSubmission_LargeCodeSubmission_ProcessesSuccessfully()
    {
        // Arrange
        var userEmail = "test@example.com";
        var largeCode = new string('x', 10000); // 10KB of code
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "C#",
            Code = largeCode
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.Is<Submission>(s => s.Code == largeCode)), Times.Once);
    }

    [Fact]
    public async Task CreateSubmission_SpecialCharactersInCode_ProcessesSuccessfully()
    {
        // Arrange
        var userEmail = "test@example.com";
        var codeWithSpecialChars = "Console.WriteLine(\"Hello, 世界! 🌍 @#$%^&*()\");";
        var submissionDto = new SubmissionDto
        {
            MatchId = 1,
            ProblemId = 2,
            Language = "C#",
            Code = codeWithSpecialChars
        };

        SetupAuthenticatedUser(userEmail);
        _mockSubmissionRepository
            .Setup(r => r.CreateSubmission(It.IsAny<Submission>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.CreateSubmission(submissionDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockSubmissionRepository.Verify(r => r.CreateSubmission(It.Is<Submission>(s => s.Code == codeWithSpecialChars)), Times.Once);
    }
}