using Xunit;
using Moq;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Tests;

public class MatchRepositoryTests
{
    private readonly Mock<IDataContextDapper> _mockDapper;
    private readonly MatchRepository _repository;

    public MatchRepositoryTests()
    {
        _mockDapper = new Mock<IDataContextDapper>();
        _repository = new MatchRepository(_mockDapper.Object);
    }

    [Fact]
    public async Task CreateMatch_WithProblems_ReturnsMatch()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int> { 1, 2, 3 };
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedMatchId, result.MatchId);
        Assert.Equal(lobbyId, result.LobbyId);
        Assert.True(result.StartedAt > DateTime.MinValue);
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()), Times.Once);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Exactly(3));
    }

    [Fact]
    public async Task CreateMatch_WithoutProblems_ReturnsMatch()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int>();
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedMatchId, result.MatchId);
        Assert.Equal(lobbyId, result.LobbyId);
        Assert.True(result.StartedAt > DateTime.MinValue);
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()), Times.Once);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Never);
    }

    [Fact]
    public async Task CreateMatch_WithSingleProblem_ReturnsMatch()
    {
        // Arrange
        var lobbyId = 2;
        var problemIds = new List<int> { 5 };
        var expectedMatchId = 456;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedMatchId, result.MatchId);
        Assert.Equal(lobbyId, result.LobbyId);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task CreateMatch_CallsCorrectSqlForMatch()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int>();
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);

        // Act
        await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(
            It.Is<string>(sql => sql.Contains("INSERT INTO AlgorithmBattleArinaSchema.Matches") && 
                                sql.Contains("LobbyId") && 
                                sql.Contains("SCOPE_IDENTITY")),
            It.Is<object>(param => param.GetType().GetProperty("LobbyId")!.GetValue(param)!.Equals(lobbyId))
        ), Times.Once);
    }

    [Fact]
    public async Task CreateMatch_CallsCorrectSqlForProblems()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int> { 10, 20 };
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        _mockDapper.Verify(d => d.ExecuteSqlAsync(
            It.Is<string>(sql => sql.Contains("INSERT INTO AlgorithmBattleArinaSchema.MatchProblems") && 
                                sql.Contains("MatchId") && 
                                sql.Contains("ProblemId")),
            It.IsAny<object>()
        ), Times.Exactly(2));
    }

    [Fact]
    public async Task CreateMatch_WithNullProblems_ReturnsMatch()
    {
        // Arrange
        var lobbyId = 1;
        IEnumerable<int>? problemIds = null;
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _repository.CreateMatch(lobbyId, problemIds!));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(int.MaxValue)]
    public async Task CreateMatch_WithEdgeCaseLobbyIds_ReturnsMatch(int lobbyId)
    {
        // Arrange
        var problemIds = new List<int> { 1 };
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedMatchId, result.MatchId);
        Assert.Equal(lobbyId, result.LobbyId);
    }

    [Theory]
    [InlineData(new int[] { 0 })]
    [InlineData(new int[] { -1 })]
    [InlineData(new int[] { int.MaxValue })]
    [InlineData(new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 })]
    public async Task CreateMatch_WithEdgeCaseProblemIds_ReturnsMatch(int[] problemIdArray)
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = problemIdArray.ToList();
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedMatchId, result.MatchId);
        Assert.Equal(lobbyId, result.LobbyId);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Exactly(problemIds.Count));
    }

    [Fact]
    public async Task CreateMatch_DatabaseThrowsException_PropagatesException()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int> { 1 };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _repository.CreateMatch(lobbyId, problemIds));
    }

    [Fact]
    public async Task CreateMatch_ProblemInsertFails_PropagatesException()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int> { 1, 2 };
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ThrowsAsync(new Exception("Problem insert failed"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _repository.CreateMatch(lobbyId, problemIds));
    }

    [Fact]
    public async Task CreateMatch_SetsStartedAtToCurrentTime()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int>();
        var expectedMatchId = 123;
        var beforeCall = DateTime.UtcNow;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);
        var afterCall = DateTime.UtcNow;

        // Assert
        Assert.True(result.StartedAt >= beforeCall);
        Assert.True(result.StartedAt <= afterCall);
        Assert.Null(result.EndedAt);
    }

    [Fact]
    public async Task CreateMatch_WithDuplicateProblemIds_ProcessesAll()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int> { 1, 1, 2, 2, 3 };
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        Assert.NotNull(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Exactly(5));
    }

    [Fact]
    public async Task CreateMatch_VerifiesCorrectParametersForProblems()
    {
        // Arrange
        var lobbyId = 1;
        var problemIds = new List<int> { 10, 20 };
        var expectedMatchId = 123;

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedMatchId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(true);

        // Act
        await _repository.CreateMatch(lobbyId, problemIds);

        // Assert
        _mockDapper.Verify(d => d.ExecuteSqlAsync(
            It.IsAny<string>(),
            It.Is<object>(param => 
                param.GetType().GetProperty("MatchId")!.GetValue(param)!.Equals(expectedMatchId) &&
                param.GetType().GetProperty("ProblemId")!.GetValue(param)!.Equals(10))
        ), Times.Once);

        _mockDapper.Verify(d => d.ExecuteSqlAsync(
            It.IsAny<string>(),
            It.Is<object>(param => 
                param.GetType().GetProperty("MatchId")!.GetValue(param)!.Equals(expectedMatchId) &&
                param.GetType().GetProperty("ProblemId")!.GetValue(param)!.Equals(20))
        ), Times.Once);
    }
}