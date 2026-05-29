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

public class FriendsControllerTests
{
    private readonly Mock<IFriendsRepository> _friendsRepoMock;
    private readonly Mock<IChatRepository> _chatRepoMock;
    private readonly AuthHelper _authHelper;

    public FriendsControllerTests()
    {
        _friendsRepoMock = new Mock<IFriendsRepository>();
        _chatRepoMock = new Mock<IChatRepository>();
        
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        _authHelper = new AuthHelper(config);
    }

    private FriendsController CreateControllerWithUser(ClaimsPrincipal? user)
    {
        var controller = new FriendsController(_friendsRepoMock.Object, _chatRepoMock.Object, _authHelper);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user ?? new ClaimsPrincipal() }
        };
        return controller;
    }

    private ClaimsPrincipal CreateStudentPrincipal(int studentId)
    {
        var claims = new List<Claim>
        {
            new Claim("studentId", studentId.ToString()),
            new Claim(ClaimTypes.Email, $"student{studentId}@test.com")
        };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    [Fact]
    public async Task GetFriends_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.GetFriends();

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetFriends_ReturnsOk_WithFriendsList()
    {
        // Arrange
        var studentId = 42;
        var user = CreateStudentPrincipal(studentId);
        var friends = new List<FriendDto>
        {
            new FriendDto { StudentId = 1, FullName = "John Doe", Email = "john@test.com", IsOnline = true, FriendsSince = DateTime.Now }
        };

        _friendsRepoMock.Setup(r => r.GetFriendsAsync(studentId)).ReturnsAsync(friends);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetFriends();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedFriends = Assert.IsAssignableFrom<IEnumerable<FriendDto>>(okResult.Value);
        Assert.Single(returnedFriends);
        _friendsRepoMock.Verify(r => r.GetFriendsAsync(studentId), Times.Once);
    }

    [Fact]
    public async Task SearchStudents_ReturnsBadRequest_WhenQueryEmpty()
    {
        // Arrange
        var controller = CreateControllerWithUser(CreateStudentPrincipal(1));

        // Act
        var result = await controller.SearchStudents(string.Empty);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Search query cannot be empty", badRequest.Value);
    }

    [Fact]
    public async Task SearchStudents_ReturnsBadRequest_WhenQueryWhitespace()
    {
        // Arrange
        var controller = CreateControllerWithUser(CreateStudentPrincipal(1));

        // Act
        var result = await controller.SearchStudents("   ");

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Search query cannot be empty", badRequest.Value);
    }

    [Fact]
    public async Task SearchStudents_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.SearchStudents("test");

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task SearchStudents_ReturnsOk_WithResults()
    {
        // Arrange
        var studentId = 7;
        var query = "john";
        var user = CreateStudentPrincipal(studentId);
        var searchResults = new List<FriendDto>
        {
            new FriendDto { StudentId = 2, FullName = "John Smith", Email = "john.smith@test.com" }
        };

        _friendsRepoMock.Setup(r => r.SearchStudentsAsync(query, studentId)).ReturnsAsync(searchResults);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.SearchStudents(query);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedStudents = Assert.IsAssignableFrom<IEnumerable<FriendDto>>(okResult.Value);
        Assert.Single(returnedStudents);
        _friendsRepoMock.Verify(r => r.SearchStudentsAsync(query, studentId), Times.Once);
    }

    [Fact]
    public async Task SendFriendRequest_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());
        var request = new SendFriendRequestDto { ReceiverId = 5 };

        // Act
        var result = await controller.SendFriendRequest(request);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task SendFriendRequest_ReturnsBadRequest_WhenSendingToSelf()
    {
        // Arrange
        var studentId = 10;
        var user = CreateStudentPrincipal(studentId);
        var controller = CreateControllerWithUser(user);
        var request = new SendFriendRequestDto { ReceiverId = studentId };

        // Act
        var result = await controller.SendFriendRequest(request);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Cannot send friend request to yourself", badRequest.Value);
    }

    [Fact]
    public async Task SendFriendRequest_ReturnsOk_OnSuccess()
    {
        // Arrange
        var senderId = 10;
        var receiverId = 20;
        var requestId = 123;
        var user = CreateStudentPrincipal(senderId);
        var request = new SendFriendRequestDto { ReceiverId = receiverId };

        _friendsRepoMock.Setup(r => r.SendFriendRequestAsync(senderId, receiverId)).ReturnsAsync(requestId);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.SendFriendRequest(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        _friendsRepoMock.Verify(r => r.SendFriendRequestAsync(senderId, receiverId), Times.Once);
    }

    [Fact]
    public async Task SendFriendRequest_ReturnsBadRequest_OnException()
    {
        // Arrange
        var senderId = 10;
        var receiverId = 20;
        var user = CreateStudentPrincipal(senderId);
        var request = new SendFriendRequestDto { ReceiverId = receiverId };

        _friendsRepoMock.Setup(r => r.SendFriendRequestAsync(senderId, receiverId))
            .ThrowsAsync(new Exception("Database error"));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.SendFriendRequest(request);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Failed to send friend request", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task GetReceivedRequests_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.GetReceivedRequests();

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetReceivedRequests_ReturnsOk_WithRequests()
    {
        // Arrange
        var studentId = 5;
        var user = CreateStudentPrincipal(studentId);
        var requests = new List<FriendRequestDto>
        {
            new FriendRequestDto { RequestId = 1, SenderId = 2, ReceiverId = studentId, SenderName = "Jane", Status = "Pending" }
        };

        _friendsRepoMock.Setup(r => r.GetReceivedRequestsAsync(studentId)).ReturnsAsync(requests);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetReceivedRequests();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedRequests = Assert.IsAssignableFrom<IEnumerable<FriendRequestDto>>(okResult.Value);
        Assert.Single(returnedRequests);
        _friendsRepoMock.Verify(r => r.GetReceivedRequestsAsync(studentId), Times.Once);
    }

    [Fact]
    public async Task GetSentRequests_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.GetSentRequests();

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetSentRequests_ReturnsOk_WithRequests()
    {
        // Arrange
        var studentId = 6;
        var user = CreateStudentPrincipal(studentId);
        var requests = new List<FriendRequestDto>
        {
            new FriendRequestDto { RequestId = 10, SenderId = studentId, ReceiverId = 3, ReceiverName = "Bob", Status = "Pending" }
        };

        _friendsRepoMock.Setup(r => r.GetSentRequestsAsync(studentId)).ReturnsAsync(requests);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.GetSentRequests();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedRequests = Assert.IsAssignableFrom<IEnumerable<FriendRequestDto>>(okResult.Value);
        Assert.Single(returnedRequests);
        _friendsRepoMock.Verify(r => r.GetSentRequestsAsync(studentId), Times.Once);
    }

    [Fact]
    public async Task AcceptFriendRequest_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.AcceptFriendRequest(1);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task AcceptFriendRequest_ReturnsNotFound_WhenRequestNotFound()
    {
        // Arrange
        var studentId = 5;
        var requestId = 999;
        var user = CreateStudentPrincipal(studentId);

        _friendsRepoMock.Setup(r => r.GetFriendRequestAsync(requestId)).ReturnsAsync((FriendRequestDto?)null);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.AcceptFriendRequest(requestId);

        // Assert
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Friend request not found", notFound.Value);
    }

    [Fact]
    public async Task AcceptFriendRequest_ReturnsOk_AndCreatesConversation()
    {
        // Arrange
        var studentId = 5;
        var requestId = 123;
        var user = CreateStudentPrincipal(studentId);
        var friendRequest = new FriendRequestDto
        {
            RequestId = requestId,
            SenderId = 10,
            ReceiverId = studentId,
            SenderEmail = "sender@test.com"
        };

        _friendsRepoMock.Setup(r => r.GetFriendRequestAsync(requestId)).ReturnsAsync(friendRequest);
        _friendsRepoMock.Setup(r => r.AcceptFriendRequestAsync(requestId, studentId)).Returns(Task.CompletedTask);
        _chatRepoMock.Setup(r => r.GetFriendConversationAsync(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync((ConversationDto?)null);
        _chatRepoMock.Setup(r => r.CreateConversationAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<List<string>>())).ReturnsAsync(1);
        
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.AcceptFriendRequest(requestId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        _friendsRepoMock.Verify(r => r.AcceptFriendRequestAsync(requestId, studentId), Times.Once);
    }

    [Fact]
    public async Task AcceptFriendRequest_ReturnsBadRequest_OnException()
    {
        // Arrange
        var studentId = 5;
        var requestId = 123;
        var user = CreateStudentPrincipal(studentId);

        _friendsRepoMock.Setup(r => r.GetFriendRequestAsync(requestId))
            .ThrowsAsync(new Exception("Database error"));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.AcceptFriendRequest(requestId);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Failed to accept friend request", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task RejectFriendRequest_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.RejectFriendRequest(1);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task RejectFriendRequest_ReturnsOk_OnSuccess()
    {
        // Arrange
        var studentId = 5;
        var requestId = 123;
        var user = CreateStudentPrincipal(studentId);

        _friendsRepoMock.Setup(r => r.RejectFriendRequestAsync(requestId, studentId)).Returns(Task.CompletedTask);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.RejectFriendRequest(requestId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        _friendsRepoMock.Verify(r => r.RejectFriendRequestAsync(requestId, studentId), Times.Once);
    }

    [Fact]
    public async Task RejectFriendRequest_ReturnsBadRequest_OnException()
    {
        // Arrange
        var studentId = 5;
        var requestId = 123;
        var user = CreateStudentPrincipal(studentId);

        _friendsRepoMock.Setup(r => r.RejectFriendRequestAsync(requestId, studentId))
            .ThrowsAsync(new Exception("Database error"));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.RejectFriendRequest(requestId);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Failed to reject friend request", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task RemoveFriend_ReturnsUnauthorized_WhenStudentIdMissing()
    {
        // Arrange
        var controller = CreateControllerWithUser(new ClaimsPrincipal());

        // Act
        var result = await controller.RemoveFriend(1);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task RemoveFriend_ReturnsOk_OnSuccess()
    {
        // Arrange
        var studentId = 5;
        var friendId = 10;
        var user = CreateStudentPrincipal(studentId);

        _friendsRepoMock.Setup(r => r.RemoveFriendAsync(studentId, friendId)).Returns(Task.CompletedTask);
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.RemoveFriend(friendId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        _friendsRepoMock.Verify(r => r.RemoveFriendAsync(studentId, friendId), Times.Once);
    }

    [Fact]
    public async Task RemoveFriend_ReturnsBadRequest_OnException()
    {
        // Arrange
        var studentId = 5;
        var friendId = 10;
        var user = CreateStudentPrincipal(studentId);

        _friendsRepoMock.Setup(r => r.RemoveFriendAsync(studentId, friendId))
            .ThrowsAsync(new Exception("Database error"));
        var controller = CreateControllerWithUser(user);

        // Act
        var result = await controller.RemoveFriend(friendId);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Failed to remove friend", badRequest.Value?.ToString());
    }
}
