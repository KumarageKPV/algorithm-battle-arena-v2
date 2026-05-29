using Xunit;
using Moq;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using Dapper;

namespace AlgorithmBattleArena.Tests;

public class LobbyRepositoryTests
{
    private readonly Mock<IDataContextDapper> _mockDapper;
    private readonly LobbyRepository _repository;

    public LobbyRepositoryTests()
    {
        _mockDapper = new Mock<IDataContextDapper>();
        _repository = new LobbyRepository(_mockDapper.Object);
    }

    [Fact]
    public async Task CreateLobby_ValidData_ReturnsLobby()
    {
        // Arrange
        var lobbyName = "Test Lobby";
        var maxPlayers = 4;
        var mode = "Competitive";
        var difficulty = "Medium";
        var hostEmail = "host@test.com";
        var lobbyCode = "ABC123";
        var lobbyId = 1;

        var expectedLobby = new Lobby
        {
            LobbyId = lobbyId,
            LobbyName = lobbyName,
            MaxPlayers = maxPlayers,
            Mode = mode,
            Difficulty = difficulty,
            HostEmail = hostEmail,
            LobbyCode = lobbyCode,
            Status = "Open",
            Participants = new List<LobbyParticipant>
            {
                new LobbyParticipant { LobbyId = lobbyId, ParticipantEmail = hostEmail, Role = "Host" }
            }
        };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(lobbyId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedLobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedLobby.Participants);

        // Act
        var result = await _repository.CreateLobby(lobbyName, maxPlayers, mode, difficulty, hostEmail, lobbyCode);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(lobbyId, result.LobbyId);
        Assert.Equal(lobbyName, result.LobbyName);
        Assert.Equal(hostEmail, result.HostEmail);
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task JoinLobby_ValidLobby_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var participantEmail = "player@test.com";
        var lobby = new Lobby
        {
            LobbyId = lobbyId,
            Status = "Open",
            MaxPlayers = 4,
            Participants = new List<LobbyParticipant>
            {
                new LobbyParticipant { ParticipantEmail = "host@test.com", Role = "Host" }
            }
        };

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby.Participants);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.JoinLobby(lobbyId, participantEmail);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task JoinLobby_FullLobby_ReturnsFalse()
    {
        // Arrange
        var lobbyId = 1;
        var participantEmail = "player@test.com";
        var lobby = new Lobby
        {
            LobbyId = lobbyId,
            Status = "Open",
            MaxPlayers = 2,
            Participants = new List<LobbyParticipant>
            {
                new LobbyParticipant { ParticipantEmail = "host@test.com", Role = "Host" },
                new LobbyParticipant { ParticipantEmail = "player1@test.com", Role = "Player" }
            }
        };

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby.Participants);

        // Act
        var result = await _repository.JoinLobby(lobbyId, participantEmail);

        // Assert
        Assert.False(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Never);
    }

    [Fact]
    public async Task JoinLobby_ClosedLobby_ReturnsFalse()
    {
        // Arrange
        var lobbyId = 1;
        var participantEmail = "player@test.com";
        var lobby = new Lobby
        {
            LobbyId = lobbyId,
            Status = "Closed",
            MaxPlayers = 4,
            Participants = new List<LobbyParticipant>()
        };

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby.Participants);

        // Act
        var result = await _repository.JoinLobby(lobbyId, participantEmail);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task JoinLobby_NullLobby_ReturnsFalse()
    {
        // Arrange
        var lobbyId = 1;
        var participantEmail = "player@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync((Lobby?)null);

        // Act
        var result = await _repository.JoinLobby(lobbyId, participantEmail);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task LeaveLobby_ValidData_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var participantEmail = "player@test.com";

        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.LeaveLobby(lobbyId, participantEmail);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task KickParticipant_ValidHost_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var hostEmail = "host@test.com";
        var participantEmail = "player@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<int?>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(1);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.KickParticipant(lobbyId, hostEmail, participantEmail);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task KickParticipant_InvalidHost_ReturnsFalse()
    {
        // Arrange
        var lobbyId = 1;
        var hostEmail = "nothost@test.com";
        var participantEmail = "player@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<int?>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync((int?)null);

        // Act
        var result = await _repository.KickParticipant(lobbyId, hostEmail, participantEmail);

        // Assert
        Assert.False(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Never);
    }

    [Fact]
    public async Task CloseLobby_ValidHost_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var hostEmail = "host@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<int?>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(1);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.CloseLobby(lobbyId, hostEmail);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task CloseLobby_InvalidHost_ReturnsFalse()
    {
        // Arrange
        var lobbyId = 1;
        var hostEmail = "nothost@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<int?>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync((int?)null);

        // Act
        var result = await _repository.CloseLobby(lobbyId, hostEmail);

        // Assert
        Assert.False(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Never);
    }

    [Fact]
    public async Task UpdateLobbyStatus_ValidData_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var status = "InProgress";

        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.UpdateLobbyStatus(lobbyId, status);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task UpdateLobbyPrivacy_ValidData_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var isPublic = false;

        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.UpdateLobbyPrivacy(lobbyId, isPublic);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task UpdateLobbyDifficulty_ValidData_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var difficulty = "Hard";

        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.UpdateLobbyDifficulty(lobbyId, difficulty);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task DeleteLobby_ValidData_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;

        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);

        // Act
        var result = await _repository.DeleteLobby(lobbyId);

        // Assert
        Assert.True(result);
        _mockDapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task GetOpenLobbies_ReturnsLobbiesWithParticipants()
    {
        // Arrange
        var lobbies = new List<Lobby>
        {
            new Lobby { LobbyId = 1, LobbyName = "Lobby 1", Status = "Open", IsPublic = true },
            new Lobby { LobbyId = 2, LobbyName = "Lobby 2", Status = "Open", IsPublic = true }
        };

        var participants1 = new List<LobbyParticipant>
        {
            new LobbyParticipant { LobbyId = 1, ParticipantEmail = "host1@test.com", Role = "Host" }
        };

        var participants2 = new List<LobbyParticipant>
        {
            new LobbyParticipant { LobbyId = 2, ParticipantEmail = "host2@test.com", Role = "Host" }
        };

        _mockDapper.Setup(d => d.LoadDataAsync<Lobby>(It.IsAny<string>(), null))
                   .ReturnsAsync(lobbies);
        _mockDapper.SetupSequence(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(participants1)
                   .ReturnsAsync(participants2);

        // Act
        var result = await _repository.GetOpenLobbies();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.All(result, lobby => Assert.NotEmpty(lobby.Participants));
    }

    [Fact]
    public async Task GetLobbyById_ExistingLobby_ReturnsLobbyWithParticipants()
    {
        // Arrange
        var lobbyId = 1;
        var lobby = new Lobby { LobbyId = lobbyId, LobbyName = "Test Lobby" };
        var participants = new List<LobbyParticipant>
        {
            new LobbyParticipant { LobbyId = lobbyId, ParticipantEmail = "host@test.com", Role = "Host" }
        };

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(participants);

        // Act
        var result = await _repository.GetLobbyById(lobbyId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(lobbyId, result.LobbyId);
        Assert.Single(result.Participants);
    }

    [Fact]
    public async Task GetLobbyById_NonExistingLobby_ReturnsNull()
    {
        // Arrange
        var lobbyId = 999;

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync((Lobby?)null);

        // Act
        var result = await _repository.GetLobbyById(lobbyId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetLobbyByCode_ExistingCode_ReturnsLobbyWithParticipants()
    {
        // Arrange
        var lobbyCode = "ABC123";
        var lobby = new Lobby { LobbyId = 1, LobbyCode = lobbyCode, LobbyName = "Test Lobby" };
        var participants = new List<LobbyParticipant>
        {
            new LobbyParticipant { LobbyId = 1, ParticipantEmail = "host@test.com", Role = "Host" }
        };

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(lobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(participants);

        // Act
        var result = await _repository.GetLobbyByCode(lobbyCode);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(lobbyCode, result.LobbyCode);
        Assert.Single(result.Participants);
    }

    [Fact]
    public async Task GetLobbyByCode_NonExistingCode_ReturnsNull()
    {
        // Arrange
        var lobbyCode = "INVALID";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync((Lobby?)null);

        // Act
        var result = await _repository.GetLobbyByCode(lobbyCode);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task IsHost_ValidHost_ReturnsTrue()
    {
        // Arrange
        var lobbyId = 1;
        var email = "host@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<int?>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(1);

        // Act
        var result = await _repository.IsHost(lobbyId, email);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsHost_InvalidHost_ReturnsFalse()
    {
        // Arrange
        var lobbyId = 1;
        var email = "nothost@test.com";

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<int?>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync((int?)null);

        // Act
        var result = await _repository.IsHost(lobbyId, email);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateLobby_InvalidLobbyName_StillProcesses(string? lobbyName)
    {
        // Arrange
        var maxPlayers = 4;
        var mode = "Competitive";
        var difficulty = "Medium";
        var hostEmail = "host@test.com";
        var lobbyCode = "ABC123";
        var lobbyId = 1;

        var expectedLobby = new Lobby { LobbyId = lobbyId };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(lobbyId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedLobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(new List<LobbyParticipant>());

        // Act
        var result = await _repository.CreateLobby(lobbyName ?? string.Empty, maxPlayers, mode, difficulty, hostEmail, lobbyCode);

        // Assert
        Assert.NotNull(result);
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(100)]
    public async Task CreateLobby_EdgeCaseMaxPlayers_StillProcesses(int maxPlayers)
    {
        // Arrange
        var lobbyName = "Test Lobby";
        var mode = "Competitive";
        var difficulty = "Medium";
        var hostEmail = "host@test.com";
        var lobbyCode = "ABC123";
        var lobbyId = 1;

        var expectedLobby = new Lobby { LobbyId = lobbyId };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(lobbyId);
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<DynamicParameters>()))
                   .ReturnsAsync(true);
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Lobby>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(expectedLobby);
        _mockDapper.Setup(d => d.LoadDataAsync<LobbyParticipant>(It.IsAny<string>(), It.IsAny<object>()))
                   .ReturnsAsync(new List<LobbyParticipant>());

        // Act
        var result = await _repository.CreateLobby(lobbyName, maxPlayers, mode, difficulty, hostEmail, lobbyCode);

        // Assert
        Assert.NotNull(result);
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>()), Times.Once);
    }
}