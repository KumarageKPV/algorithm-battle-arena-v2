using Xunit;
using Moq;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Tests;

public class FriendsRepositoryTests
{
    private readonly Mock<IDataContextDapper> _mockDapper;
    private readonly FriendsRepository _repository;

    public FriendsRepositoryTests()
    {
        _mockDapper = new Mock<IDataContextDapper>();
        _repository = new FriendsRepository(_mockDapper.Object);
    }

    [Fact]
    public async Task GetFriendsAsync_ReturnsFriendsList()
    {
        // Arrange
        var friends = new List<FriendDto>
        {
            new FriendDto { StudentId = 2, FullName = "Friend One", Email = "friend1@test.com" },
            new FriendDto { StudentId = 3, FullName = "Friend Two", Email = "friend2@test.com" }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<FriendDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(friends);

        // Act
        var result = await _repository.GetFriendsAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockDapper.Verify(d => d.LoadDataAsync<FriendDto>(
            It.Is<string>(s => s.Contains("Friends")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task SearchStudentsAsync_ReturnsFilteredStudents()
    {
        // Arrange
        var students = new List<FriendDto>
        {
            new FriendDto { StudentId = 2, FullName = "John Doe", Email = "john@test.com" }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<FriendDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(students);

        // Act
        var result = await _repository.SearchStudentsAsync("john", 1);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        _mockDapper.Verify(d => d.LoadDataAsync<FriendDto>(
            It.Is<string>(s => s.Contains("LIKE @Query")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task SearchStudentsAsync_ExcludesCurrentStudentAndFriends()
    {
        // Arrange
        var students = new List<FriendDto>();
        _mockDapper.Setup(d => d.LoadDataAsync<FriendDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(students);

        // Act
        var result = await _repository.SearchStudentsAsync("test", 1);

        // Assert
        Assert.NotNull(result);
        _mockDapper.Verify(d => d.LoadDataAsync<FriendDto>(
            It.Is<string>(s => s.Contains("StudentId != @CurrentStudentId") && s.Contains("NOT EXISTS")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task SendFriendRequestAsync_CreatesRequest_ReturnsId()
    {
        // Arrange
        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(123);

        // Act
        var result = await _repository.SendFriendRequestAsync(1, 2);

        // Assert
        Assert.Equal(123, result);
        _mockDapper.Verify(d => d.LoadDataSingleAsync<int>(
            It.Is<string>(s => s.Contains("INSERT INTO") && s.Contains("FriendRequests")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetReceivedRequestsAsync_ReturnsPendingRequests()
    {
        // Arrange
        var requests = new List<FriendRequestDto>
        {
            new FriendRequestDto { RequestId = 1, SenderId = 2, ReceiverId = 1, SenderName = "John Doe", Status = "Pending" }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<FriendRequestDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(requests);

        // Act
        var result = await _repository.GetReceivedRequestsAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        _mockDapper.Verify(d => d.LoadDataAsync<FriendRequestDto>(
            It.Is<string>(s => s.Contains("ReceiverId = @StudentId") && s.Contains("Status = 'Pending'")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetSentRequestsAsync_ReturnsUserSentRequests()
    {
        // Arrange
        var requests = new List<FriendRequestDto>
        {
            new FriendRequestDto { RequestId = 1, SenderId = 1, ReceiverId = 2, ReceiverName = "Jane Doe", Status = "Pending" }
        };
        _mockDapper.Setup(d => d.LoadDataAsync<FriendRequestDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(requests);

        // Act
        var result = await _repository.GetSentRequestsAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        _mockDapper.Verify(d => d.LoadDataAsync<FriendRequestDto>(
            It.Is<string>(s => s.Contains("SenderId = @StudentId")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetFriendRequestAsync_WithValidId_ReturnsRequest()
    {
        // Arrange
        var request = new FriendRequestDto { RequestId = 1, SenderId = 1, ReceiverId = 2, Status = "Pending" };
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<FriendRequestDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(request);

        // Act
        var result = await _repository.GetFriendRequestAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.RequestId);
    }

    [Fact]
    public async Task GetFriendRequestAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<FriendRequestDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync((FriendRequestDto?)null);

        // Act
        var result = await _repository.GetFriendRequestAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task AcceptFriendRequestAsync_UpdatesRequestAndCreatesFriendship()
    {
        // Arrange
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(true);

        // Act
        await _repository.AcceptFriendRequestAsync(1, 2);

        // Assert
        _mockDapper.Verify(d => d.ExecuteSqlAsync(
            It.Is<string>(s => s.Contains("UPDATE") && s.Contains("Status = 'Accepted'") && s.Contains("INSERT INTO") && s.Contains("Friends")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task RejectFriendRequestAsync_UpdatesRequestStatus()
    {
        // Arrange
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(true);

        // Act
        await _repository.RejectFriendRequestAsync(1, 2);

        // Assert
        _mockDapper.Verify(d => d.ExecuteSqlAsync(
            It.Is<string>(s => s.Contains("UPDATE") && s.Contains("Status = 'Rejected'")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task RemoveFriendAsync_DeletesFriendship()
    {
        // Arrange
        _mockDapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(true);

        // Act
        await _repository.RemoveFriendAsync(1, 2);

        // Assert
        _mockDapper.Verify(d => d.ExecuteSqlAsync(
            It.Is<string>(s => s.Contains("DELETE FROM") && s.Contains("Friends")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetFriendRequestEmailsAsync_WithValidRequest_ReturnsEmails()
    {
        // Arrange
        var exp = new System.Dynamic.ExpandoObject() as IDictionary<string, object?>;
        exp["SenderEmail"] = "sender@test.com";
        exp["ReceiverEmail"] = "receiver@test.com";
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<dynamic>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync((object)exp);

        // Act
        var result = await _repository.GetFriendRequestEmailsAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("sender@test.com", result.Value.senderEmail);
        Assert.Equal("receiver@test.com", result.Value.receiverEmail);
    }

    [Fact]
    public async Task GetFriendRequestEmailsAsync_WithInvalidRequest_ReturnsNull()
    {
        // Arrange
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<dynamic>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync((object?)null);

        // Act
        var result = await _repository.GetFriendRequestEmailsAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task SearchStudentsAsync_ExcludesPendingRequests()
    {
        // Arrange
        var students = new List<FriendDto>();
        _mockDapper.Setup(d => d.LoadDataAsync<FriendDto>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(students);

        // Act
        await _repository.SearchStudentsAsync("test", 1);

        // Assert
        _mockDapper.Verify(d => d.LoadDataAsync<FriendDto>(
            It.Is<string>(s => s.Contains("NOT EXISTS") && s.Contains("FriendRequests")), 
            It.IsAny<object>()), Times.Once);
    }
}
