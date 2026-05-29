using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;
using Microsoft.Extensions.Configuration;

namespace AlgorithmBattleArena.Tests;

public class StatisticsControllerTests
{
    private readonly Mock<IStatisticsRepository> _statsRepoMock;
    private readonly AuthHelper _authHelper;

    public StatisticsControllerTests()
    {
        _statsRepoMock = new Mock<IStatisticsRepository>();
        
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        _authHelper = new AuthHelper(config);
    }

    private StatisticsController CreateControllerWithUser(ClaimsPrincipal? user)
    {
        var controller = new StatisticsController(_statsRepoMock.Object, _authHelper);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user ?? new ClaimsPrincipal() }
        };
        return controller;
    }

    private ClaimsPrincipal CreateUserPrincipal(string email)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, email)
        };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    [Fact]
    public async Task GetUserStatistics_ReturnsUnauthorized_WhenEmailMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.GetUserStatistics();

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetUserStatistics_ReturnsUnauthorized_WhenEmailEmpty()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Email, string.Empty) }, "TestAuth"));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetUserStatistics();

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task GetUserStatistics_ReturnsOk_WithStatistics()
    {
        // Arrange
        var email = "user@example.com";
        var user = CreateUserPrincipal(email);
        var statistics = new UserStatisticsDto
        {
            Email = email,
            FullName = "Test User",
            Rank = 5,
            MatchesPlayed = 10,
            WinRate = 0.75m,
            ProblemsCompleted = 20,
            TotalScore = 1500,
            LastActivity = DateTime.Now
        };

        _statsRepoMock.Setup(r => r.GetUserStatistics(email)).ReturnsAsync(statistics);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetUserStatistics();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedStats = Assert.IsType<UserStatisticsDto>(okResult.Value);
        Assert.Equal(email, returnedStats.Email);
        Assert.Equal(10, returnedStats.MatchesPlayed);
        Assert.Equal(0.75m, returnedStats.WinRate);
        _statsRepoMock.Verify(r => r.GetUserStatistics(email), Times.Once);
    }

    [Fact]
    public async Task GetUserStatistics_Returns500_OnRepositoryException()
    {
        // Arrange
        var email = "error@example.com";
        var user = CreateUserPrincipal(email);

        _statsRepoMock.Setup(r => r.GetUserStatistics(email))
            .ThrowsAsync(new Exception("Database error"));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetUserStatistics();

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
        var value = objectResult.Value as dynamic;
        Assert.NotNull(value);
    }

    [Fact]
    public async Task GetUserStatistics_Returns500_WithErrorMessage()
    {
        // Arrange
        var email = "error@example.com";
        var user = CreateUserPrincipal(email);
        var errorMessage = "Connection timeout";

        _statsRepoMock.Setup(r => r.GetUserStatistics(email))
            .ThrowsAsync(new Exception(errorMessage));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetUserStatistics();

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
        var errorResponse = objectResult.Value?.ToString();
        Assert.Contains("Failed to get user statistics", errorResponse);
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsOk_WithLeaderboardEntries()
    {
        // Arrange
        var leaderboard = new List<LeaderboardEntryDto>
        {
            new LeaderboardEntryDto
            {
                Rank = 1,
                ParticipantEmail = "user1@test.com",
                FullName = "User One",
                TotalScore = 2000,
                ProblemsCompleted = 30,
                MatchesPlayed = 15,
                WinRate = 0.8m,
                LastSubmission = DateTime.Now
            },
            new LeaderboardEntryDto
            {
                Rank = 2,
                ParticipantEmail = "user2@test.com",
                FullName = "User Two",
                TotalScore = 1800,
                ProblemsCompleted = 25,
                MatchesPlayed = 12,
                WinRate = 0.75m,
                LastSubmission = DateTime.Now.AddDays(-1)
            }
        };

        _statsRepoMock.Setup(r => r.GetLeaderboard()).ReturnsAsync(leaderboard);
        var controller = CreateControllerWithUser(CreateUserPrincipal("any@test.com"));

        // Act
        var result = await controller.GetLeaderboard();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryDto>>(okResult.Value);
        Assert.Equal(2, returnedLeaderboard.Count());
        _statsRepoMock.Verify(r => r.GetLeaderboard(), Times.Once);
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsOk_WithEmptyList()
    {
        // Arrange
        var emptyLeaderboard = new List<LeaderboardEntryDto>();

        _statsRepoMock.Setup(r => r.GetLeaderboard()).ReturnsAsync(emptyLeaderboard);
        var controller = CreateControllerWithUser(CreateUserPrincipal("any@test.com"));

        // Act
        var result = await controller.GetLeaderboard();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryDto>>(okResult.Value);
        Assert.Empty(returnedLeaderboard);
        _statsRepoMock.Verify(r => r.GetLeaderboard(), Times.Once);
    }

    [Fact]
    public async Task GetLeaderboard_Returns500_OnRepositoryException()
    {
        // Arrange
        _statsRepoMock.Setup(r => r.GetLeaderboard())
            .ThrowsAsync(new Exception("Database connection failed"));
        var controller = CreateControllerWithUser(CreateUserPrincipal("any@test.com"));

        // Act
        var result = await controller.GetLeaderboard();

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
    }

    [Fact]
    public async Task GetLeaderboard_Returns500_WithErrorMessage()
    {
        // Arrange
        var errorMessage = "Query timeout";
        _statsRepoMock.Setup(r => r.GetLeaderboard())
            .ThrowsAsync(new Exception(errorMessage));
        var controller = CreateControllerWithUser(CreateUserPrincipal("any@test.com"));

        // Act
        var result = await controller.GetLeaderboard();

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
        var errorResponse = objectResult.Value?.ToString();
        Assert.Contains("Failed to get leaderboard", errorResponse);
    }

    [Fact]
    public async Task GetLeaderboard_VerifiesCorrectOrdering()
    {
        // Arrange
        var leaderboard = new List<LeaderboardEntryDto>
        {
            new LeaderboardEntryDto { Rank = 1, ParticipantEmail = "first@test.com", TotalScore = 3000 },
            new LeaderboardEntryDto { Rank = 2, ParticipantEmail = "second@test.com", TotalScore = 2500 },
            new LeaderboardEntryDto { Rank = 3, ParticipantEmail = "third@test.com", TotalScore = 2000 }
        };

        _statsRepoMock.Setup(r => r.GetLeaderboard()).ReturnsAsync(leaderboard);
        var controller = CreateControllerWithUser(CreateUserPrincipal("any@test.com"));

        // Act
        var result = await controller.GetLeaderboard();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedLeaderboard = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryDto>>(okResult.Value).ToList();
        Assert.Equal(3, returnedLeaderboard.Count);
        Assert.Equal(1, returnedLeaderboard[0].Rank);
        Assert.Equal(3000, returnedLeaderboard[0].TotalScore);
        Assert.Equal(2, returnedLeaderboard[1].Rank);
        Assert.Equal(3, returnedLeaderboard[2].Rank);
    }
}
