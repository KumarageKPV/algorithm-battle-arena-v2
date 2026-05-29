using Xunit;
using Moq;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using AlgorithmBattleArena.Hubs;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Models;
using Microsoft.Extensions.Configuration;

namespace AlgorithmBattleArena.Tests;

public class MatchHubTests
{
    private readonly Mock<ILobbyRepository> _mockLobbyRepository;
    private readonly AuthHelper _authHelper;
    private readonly Mock<HubCallerContext> _mockContext;
    private readonly Mock<IHubCallerClients> _mockClients;
    private readonly Mock<IClientProxy> _mockClientProxy;
    private readonly Mock<IGroupManager> _mockGroups;
    private readonly MatchHub _hub;

    public MatchHubTests()
    {
        _mockLobbyRepository = new Mock<ILobbyRepository>();
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        _authHelper = new AuthHelper(config);
        _mockContext = new Mock<HubCallerContext>();
        _mockClients = new Mock<IHubCallerClients>();
        _mockClientProxy = new Mock<IClientProxy>();
        _mockGroups = new Mock<IGroupManager>();

        _hub = new MatchHub(_mockLobbyRepository.Object, _authHelper);
        _hub.Context = _mockContext.Object;
        _hub.Clients = _mockClients.Object;
        _hub.Groups = _mockGroups.Object;

        _mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(_mockClientProxy.Object);
    }

    private void SetupAuthenticatedUser(string userEmail, string connectionId = "conn123")
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, userEmail)
        }, "TestAuth");

        _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);
        _mockContext.Setup(c => c.User).Returns(new ClaimsPrincipal(identity));
    }

    private void SetupUnauthenticatedUser(string connectionId = "conn123")
    {
        _mockContext.Setup(c => c.ConnectionId).Returns(connectionId);
        _mockContext.Setup(c => c.User).Returns(new ClaimsPrincipal(new ClaimsIdentity()));
    }

    [Fact]
    public async Task OnConnectedAsync_CallsBaseMethod()
    {
        SetupAuthenticatedUser("test@example.com");
        await _hub.OnConnectedAsync();
    }

    [Fact]
    public async Task OnDisconnectedAsync_CallsBaseMethod()
    {
        SetupAuthenticatedUser("test@example.com");
        await _hub.OnDisconnectedAsync(null);
    }

    [Fact]
    public async Task JoinLobby_InvalidLobbyId_ThrowsHubException()
    {
        SetupAuthenticatedUser("test@example.com");

        var exception = await Assert.ThrowsAsync<HubException>(() => _hub.JoinLobby("invalid"));
        Assert.Equal("Invalid lobby ID.", exception.Message);
    }

    [Fact]
    public async Task JoinLobby_UnauthenticatedUser_ThrowsHubException()
    {
        SetupUnauthenticatedUser();

        var exception = await Assert.ThrowsAsync<HubException>(() => _hub.JoinLobby("1"));
        Assert.Equal("User not authenticated", exception.Message);
    }

    [Fact]
    public async Task JoinLobby_ValidUser_AddsToGroup()
    {
        var userEmail = "test@example.com";
        var lobbyId = "1";
        var connectionId = "conn123";
        var lobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };

        SetupAuthenticatedUser(userEmail, connectionId);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(lobby);

        await _hub.JoinLobby(lobbyId);

        _mockGroups.Verify(g => g.AddToGroupAsync(connectionId, lobbyId, default), Times.Once);
    }

    [Fact]
    public async Task JoinLobby_ValidUser_BroadcastsLobbyUpdate()
    {
        var userEmail = "test@example.com";
        var lobbyId = "1";
        var lobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };

        SetupAuthenticatedUser(userEmail);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(lobby);

        await _hub.JoinLobby(lobbyId);

        _mockClientProxy.Verify(c => c.SendCoreAsync("LobbyUpdated", It.Is<object[]>(args => args.Length == 1 && args[0] == lobby), default), Times.Once);
    }

    [Fact]
    public async Task LeaveLobby_InvalidLobbyId_ThrowsHubException()
    {
        SetupAuthenticatedUser("test@example.com");

        var exception = await Assert.ThrowsAsync<HubException>(() => _hub.LeaveLobby("invalid"));
        Assert.Equal("Invalid lobby ID.", exception.Message);
    }

    [Fact]
    public async Task LeaveLobby_ValidUser_RemovesFromGroup()
    {
        var userEmail = "test@example.com";
        var lobbyId = "1";
        var connectionId = "conn123";
        var lobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };

        SetupAuthenticatedUser(userEmail, connectionId);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(lobby);

        await _hub.LeaveLobby(lobbyId);

        _mockGroups.Verify(g => g.RemoveFromGroupAsync(connectionId, lobbyId, default), Times.Once);
    }

    [Fact]
    public async Task LeaveLobby_ValidUser_BroadcastsLobbyUpdate()
    {
        var userEmail = "test@example.com";
        var lobbyId = "1";
        var lobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };

        SetupAuthenticatedUser(userEmail);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(lobby);

        await _hub.LeaveLobby(lobbyId);

        _mockClientProxy.Verify(c => c.SendCoreAsync("LobbyUpdated", It.Is<object[]>(args => args.Length == 1 && args[0] == lobby), default), Times.Once);
    }

    [Fact]
    public async Task JoinLobby_NullLobby_DoesNotBroadcastUpdate()
    {
        var userEmail = "test@example.com";
        var lobbyId = "1";

        SetupAuthenticatedUser(userEmail);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync((Lobby?)null);

        await _hub.JoinLobby(lobbyId);

        _mockClientProxy.Verify(c => c.SendCoreAsync("LobbyUpdated", It.IsAny<object[]>(), default), Times.Never);
    }

    [Fact]
    public async Task LeaveLobby_NullLobby_DoesNotBroadcastUpdate()
    {
        var userEmail = "test@example.com";
        var lobbyId = "1";

        SetupAuthenticatedUser(userEmail);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync((Lobby?)null);

        await _hub.LeaveLobby(lobbyId);

        _mockClientProxy.Verify(c => c.SendCoreAsync("LobbyUpdated", It.IsAny<object[]>(), default), Times.Never);
    }
}