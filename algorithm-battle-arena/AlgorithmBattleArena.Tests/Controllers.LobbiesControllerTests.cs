using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Hubs;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace AlgorithmBattleArena.Tests;

public class LobbiesControllerTests
{
    private readonly Mock<ILobbyRepository> _mockLobbyRepository;
    private readonly Mock<IChatRepository> _mockChatRepository;
    private readonly AuthHelper _authHelper;
    private readonly Mock<IHubContext<MatchHub>> _mockHubContext;
    private readonly Mock<IHubClients> _mockClients;
    private readonly Mock<IClientProxy> _mockClientProxy;

    public LobbiesControllerTests()
    {
        _mockLobbyRepository = new Mock<ILobbyRepository>();
        _mockChatRepository = new Mock<IChatRepository>();
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        _authHelper = new AuthHelper(config);
        _mockHubContext = new Mock<IHubContext<MatchHub>>();
        _mockClients = new Mock<IHubClients>();
        _mockClientProxy = new Mock<IClientProxy>();

        _mockHubContext.Setup(h => h.Clients).Returns(_mockClients.Object);
        _mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(_mockClientProxy.Object);
    }

    private LobbiesController CreateController(string email = "test@test.com")
    {
        var controller = new LobbiesController(_mockLobbyRepository.Object, _mockChatRepository.Object, _authHelper, _mockHubContext.Object);
        
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, email)
        }, "TestAuth");
        
        controller.ControllerContext = new ControllerContext 
        { 
            HttpContext = new DefaultHttpContext 
            { 
                User = new ClaimsPrincipal(identity) 
            } 
        };
        
        return controller;
    }

    [Fact]
    public async Task GetOpenLobbies_ReturnsOkWithLobbies()
    {
        var lobbies = new List<Lobby>
        {
            new Lobby { LobbyId = 1, LobbyName = "Test Lobby", MaxPlayers = 10 }
        };
        _mockLobbyRepository.Setup(r => r.GetOpenLobbies()).ReturnsAsync(lobbies);
        var controller = CreateController();

        var result = await controller.GetOpenLobbies();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(lobbies, ok.Value!);
    }

    [Fact]
    public async Task GetLobby_ExistingLobby_ReturnsOkWithLobby()
    {
        var lobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(lobby);
        var controller = CreateController();

        var result = await controller.GetLobby(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(lobby, ok.Value!);
    }

    [Fact]
    public async Task GetLobby_NonExistentLobby_ReturnsNotFound()
    {
        _mockLobbyRepository.Setup(r => r.GetLobbyById(999)).ReturnsAsync((Lobby?)null);
        var controller = CreateController();

        var result = await controller.GetLobby(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task CreateLobby_ValidRequest_ReturnsCreatedAtAction()
    {
        var request = new LobbyCreateDto { Name = "New Lobby", MaxPlayers = 5, Mode = "1v1", Difficulty = "Easy" };
        var createdLobby = new Lobby { LobbyId = 1, LobbyName = "New Lobby", MaxPlayers = 5 };
        
        _mockLobbyRepository.Setup(r => r.CreateLobby("New Lobby", 5, "1v1", "Easy", "test@test.com", It.IsAny<string>())).ReturnsAsync(createdLobby);
        var controller = CreateController();

        var result = await controller.CreateLobby(request);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(LobbiesController.GetLobby), created.ActionName);
        Assert.Equal(1, created.RouteValues!["lobbyId"]);
        Assert.Equal(createdLobby, created.Value!);
    }

    [Fact]
    public async Task JoinLobby_Success_ReturnsOkWithLobby()
    {
        var lobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby", LobbyCode = "ABC123" };
        var updatedLobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby", LobbyCode = "ABC123" };
        
        _mockLobbyRepository.Setup(r => r.GetLobbyByCode("ABC123")).ReturnsAsync(lobby);
        _mockLobbyRepository.Setup(r => r.JoinLobby(1, "test@test.com")).ReturnsAsync(true);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(updatedLobby);
        var controller = CreateController();

        var result = await controller.JoinLobby("ABC123");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(updatedLobby, ok.Value!);
    }

    [Fact]
    public async Task JoinLobby_LobbyNotFound_ReturnsNotFound()
    {
        _mockLobbyRepository.Setup(r => r.GetLobbyByCode("INVALID")).ReturnsAsync((Lobby?)null);
        var controller = CreateController();

        var result = await controller.JoinLobby("INVALID");

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Lobby not found", notFound.Value!);
    }

    [Fact]
    public async Task LeaveLobby_Success_ReturnsOkWithMessage()
    {
        var updatedLobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };
        
        _mockLobbyRepository.Setup(r => r.LeaveLobby(1, "test@test.com")).ReturnsAsync(true);
        _mockLobbyRepository.Setup(r => r.GetLobbyById(1)).ReturnsAsync(updatedLobby);
        var controller = CreateController();

        var result = await controller.LeaveLobby(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var message = ok.Value?.GetType().GetProperty("message")?.GetValue(ok.Value);
        Assert.Equal("Left lobby successfully", message);
    }

    [Fact]
    public async Task DeleteLobby_Success_ReturnsOkWithMessage()
    {
        var updatedLobby = new Lobby { LobbyId = 1, LobbyName = "Test Lobby" };
        
        _mockLobbyRepository.Setup(r => r.IsHost(1, "test@test.com")).ReturnsAsync(true);
        _mockLobbyRepository.Setup(r => r.DeleteLobby(1)).ReturnsAsync(true);
        var controller = CreateController();

        var result = await controller.DeleteLobby(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var message = ok.Value?.GetType().GetProperty("message")?.GetValue(ok.Value);
        Assert.Equal("Lobby deleted successfully", message);
    }

    [Fact]
    public async Task DeleteLobby_NotHost_ReturnsForbid()
    {
        _mockLobbyRepository.Setup(r => r.IsHost(1, "test@test.com")).ReturnsAsync(false);
        var controller = CreateController();

        var result = await controller.DeleteLobby(1);

        Assert.IsType<ForbidResult>(result);
    }
}