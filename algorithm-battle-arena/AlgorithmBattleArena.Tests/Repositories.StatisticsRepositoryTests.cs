using Xunit;
using Moq;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Tests;

public class StatisticsRepositoryTests
{
    private readonly Mock<IDataContextDapper> _mockDapper;
    private readonly StatisticsRepository _repository;

    public StatisticsRepositoryTests()
    {
        _mockDapper = new Mock<IDataContextDapper>();
        _repository = new StatisticsRepository(_mockDapper.Object);
    }

    [Fact]
    public async Task GetUserStatistics_WithValidUser_ReturnsStatistics()
    {
        // Arrange
        var stats = new UserStatisticsDto
        {
            Email = "user@test.com",
            FullName = "John Doe",
            Rank = 1,
            MatchesPlayed = 10,
            WinRate = 75.5m,
            ProblemsCompleted = 25,
            TotalScore = 1500,
            LastActivity = DateTime.UtcNow
        };
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<UserStatisticsDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(stats);

        // Act
        var result = await _repository.GetUserStatistics("user@test.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("user@test.com", result.Email);
        Assert.Equal("John Doe", result.FullName);
        Assert.Equal(1, result.Rank);
        Assert.Equal(10, result.MatchesPlayed);
    }

    [Fact]
    public async Task GetUserStatistics_WithNonExistentUser_ReturnsDefaultStatistics()
    {
        // Arrange
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<UserStatisticsDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync((UserStatisticsDto?)null);

        // Act
        var result = await _repository.GetUserStatistics("nonexistent@test.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("nonexistent@test.com", result.Email);
        Assert.Equal(999, result.Rank);
        Assert.Equal(0, result.MatchesPlayed);
        Assert.Equal(0, result.ProblemsCompleted);
    }

    [Fact]
    public async Task GetUserStatistics_CalculatesWinRateCorrectly()
    {
        // Arrange
        var stats = new UserStatisticsDto
        {
            Email = "user@test.com",
            FullName = "Jane Smith",
            Rank = 5,
            MatchesPlayed = 20,
            WinRate = 50.0m,
            ProblemsCompleted = 10,
            TotalScore = 500
        };
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<UserStatisticsDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(stats);

        // Act
        var result = await _repository.GetUserStatistics("user@test.com");

        // Assert
        Assert.Equal(50.0m, result.WinRate);
    }

    [Fact]
    public async Task GetLeaderboard_ReturnsRankedUsers()
    {
        // Arrange
        var leaderboard = new List<LeaderboardEntryDto>
        {
            new LeaderboardEntryDto
            {
                Rank = 1,
                ParticipantEmail = "first@test.com",
                TotalScore = 2000,
                ProblemsCompleted = 50,
                MatchesPlayed = 15,
                WinRate = 0.85m
            },
            new LeaderboardEntryDto
            {
                Rank = 2,
                ParticipantEmail = "second@test.com",
                TotalScore = 1500,
                ProblemsCompleted = 40,
                MatchesPlayed = 12,
                WinRate = 0.75m
            }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<LeaderboardEntryDto>(It.IsAny<string>(), It.IsAny<object?>()))
            .ReturnsAsync(leaderboard);

        // Act
        var result = await _repository.GetLeaderboard();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        Assert.Equal(1, result.First().Rank);
        Assert.Equal(2000, result.First().TotalScore);
    }

    [Fact]
    public async Task GetLeaderboard_OrdersByRank()
    {
        // Arrange
        var leaderboard = new List<LeaderboardEntryDto>
        {
            new LeaderboardEntryDto { Rank = 1, TotalScore = 2000 },
            new LeaderboardEntryDto { Rank = 2, TotalScore = 1500 },
            new LeaderboardEntryDto { Rank = 3, TotalScore = 1000 }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<LeaderboardEntryDto>(It.IsAny<string>(), It.IsAny<object?>()))
            .ReturnsAsync(leaderboard);

        // Act
        var result = await _repository.GetLeaderboard();

        // Assert
        Assert.True(result.ElementAt(0).Rank < result.ElementAt(1).Rank);
        Assert.True(result.ElementAt(1).Rank < result.ElementAt(2).Rank);
    }

    [Fact]
    public async Task GetLeaderboard_WithNoData_ReturnsEmptyList()
    {
        // Arrange
        _mockDapper.Setup(d => d.LoadDataAsync<LeaderboardEntryDto>(It.IsAny<string>(), It.IsAny<object?>()))
            .ReturnsAsync(new List<LeaderboardEntryDto>());

        // Act
        var result = await _repository.GetLeaderboard();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetUserStatistics_IncludesAllRequiredFields()
    {
        // Arrange
        var stats = new UserStatisticsDto
        {
            Email = "complete@test.com",
            FullName = "Complete User",
            Rank = 10,
            MatchesPlayed = 5,
            WinRate = 60.0m,
            ProblemsCompleted = 3,
            TotalScore = 300,
            LastActivity = DateTime.UtcNow.AddDays(-1)
        };
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<UserStatisticsDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(stats);

        // Act
        var result = await _repository.GetUserStatistics("complete@test.com");

        // Assert
        Assert.NotNull(result.Email);
        Assert.NotNull(result.FullName);
        Assert.True(result.Rank > 0);
        Assert.True(result.MatchesPlayed >= 0);
        Assert.True(result.WinRate >= 0);
        Assert.True(result.ProblemsCompleted >= 0);
        Assert.True(result.TotalScore >= 0);
    }

    [Fact]
    public async Task GetLeaderboard_IncludesOnlyActiveStudents()
    {
        // Arrange
        var leaderboard = new List<LeaderboardEntryDto>
        {
            new LeaderboardEntryDto { Rank = 1, ParticipantEmail = "active@test.com", TotalScore = 1000 }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<LeaderboardEntryDto>(It.IsAny<string>(), It.IsAny<object?>()))
            .ReturnsAsync(leaderboard);

        // Act
        await _repository.GetLeaderboard();

        // Assert
        _mockDapper.Verify(d => d.LoadDataAsync<LeaderboardEntryDto>(
            It.Is<string>(s => s.Contains("Active = 1")), It.IsAny<object?>()), Times.Once);
    }

    [Fact]
    public async Task GetUserStatistics_HandlesZeroMatches()
    {
        // Arrange
        var stats = new UserStatisticsDto
        {
            Email = "newuser@test.com",
            FullName = "New User",
            Rank = 999,
            MatchesPlayed = 0,
            WinRate = 0,
            ProblemsCompleted = 0,
            TotalScore = 0
        };
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<UserStatisticsDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(stats);

        // Act
        var result = await _repository.GetUserStatistics("newuser@test.com");

        // Assert
        Assert.Equal(0, result.MatchesPlayed);
        Assert.Equal(0, result.WinRate);
    }
}
