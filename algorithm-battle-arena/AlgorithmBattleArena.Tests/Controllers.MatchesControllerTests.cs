using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Hubs;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Configuration;
using MatchModel = AlgorithmBattleArena.Models.Match;

namespace AlgorithmBattleArena.Tests;

public class MatchesControllerTests
{
    private readonly Mock<IHubContext<MatchHub>> _mockHubContext;
    private readonly Mock<ILobbyRepository> _mockLobbyRepository;
    private readonly Mock<IMatchRepository> _mockMatchRepository;
    private readonly Mock<IChatRepository> _mockChatRepository;
    private readonly AuthHelper _authHelper;
    private readonly Mock<IHubClients> _mockClients;
    private readonly Mock<IClientProxy> _mockClientProxy;

    public MatchesControllerTests()
    {
        _mockHubContext = new Mock<IHubContext<MatchHub>>();
        _mockLobbyRepository = new Mock<ILobbyRepository>();
        _mockMatchRepository = new Mock<IMatchRepository>();
        _mockChatRepository = new Mock<IChatRepository>();
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        _authHelper = new AuthHelper(config);
        _mockClients = new Mock<IHubClients>();
        _mockClientProxy = new Mock<IClientProxy>();

        _mockHubContext.Setup(h => h.Clients).Returns(_mockClients.Object);
        _mockClients.Setup(c => c.All).Returns(_mockClientProxy.Object);
        _mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(_mockClientProxy.Object);
    }

    private MatchesController CreateController(string email = "test@test.com")
    {
        var controller = new MatchesController(_mockHubContext.Object, _mockLobbyRepository.Object, _mockMatchRepository.Object, _mockChatRepository.Object, _authHelper);
        
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
    public async Task StartMatch_UnauthenticatedUser_ReturnsUnauthorized()
    {
        // AuthHelper will return null for unauthenticated user
        var controller = CreateController();
        var request = new StartMatchRequest
        {
            ProblemIds = new List<int> { 1, 2 },
            DurationSec = 300
        };

        var result = await controller.StartMatch(1, request);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task StartMatch_UserNotHost_ReturnsForbid()
    {
        // AuthHelper will extract email from claims directly
        _mockLobbyRepository.Setup(r => r.IsHost(1, "test@test.com")).ReturnsAsync(false);
        var controller = CreateController();
        var request = new StartMatchRequest
        {
            ProblemIds = new List<int> { 1, 2 },
            DurationSec = 300
        };

        var result = await controller.StartMatch(1, request);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task StartMatch_ValidHost_ReturnsOkWithMatchStartedDto()
    {
        var match = new MatchModel { MatchId = 123 };
        // AuthHelper will extract email from claims directly
        _mockLobbyRepository.Setup(r => r.IsHost(1, "test@test.com")).ReturnsAsync(true);
        _mockMatchRepository.Setup(r => r.CreateMatch(1, It.IsAny<IEnumerable<int>>())).ReturnsAsync(match);
        var controller = CreateController();
        var request = new StartMatchRequest
        {
            ProblemIds = new List<int> { 1, 2 },
            DurationSec = 300,
            PreparationBufferSec = 10
        };

        var result = await controller.StartMatch(1, request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<MatchStartedDto>(okResult.Value);
        
        Assert.Equal(123, dto.MatchId);
        Assert.Equal(request.ProblemIds, dto.ProblemIds);
        Assert.Equal(300, dto.DurationSec);
        Assert.True(dto.StartAtUtc > DateTime.UtcNow.AddSeconds(5));
        Assert.True(dto.SentAtUtc <= DateTime.UtcNow);
    }

    [Fact]
    public async Task StartMatch_BroadcastsToSignalR()
    {
        var match = new MatchModel { MatchId = 123 };
        // AuthHelper will extract email from claims directly
        _mockLobbyRepository.Setup(r => r.IsHost(1, "test@test.com")).ReturnsAsync(true);
        _mockMatchRepository.Setup(r => r.CreateMatch(1, It.IsAny<IEnumerable<int>>())).ReturnsAsync(match);
        var controller = CreateController();
        var request = new StartMatchRequest
        {
            ProblemIds = new List<int> { 1, 2 },
            DurationSec = 300
        };

        await controller.StartMatch(1, request);

        _mockClientProxy.Verify(
            c => c.SendCoreAsync(
                "MatchStarted",
                It.Is<object[]>(args => args.Length == 1 && args[0] is MatchStartedDto),
                default),
            Times.Once);
    }

    [Fact]
    public async Task StartMatch_UpdatesLobbyStatus()
    {
        var match = new MatchModel { MatchId = 123 };
        // AuthHelper will extract email from claims directly
        _mockLobbyRepository.Setup(r => r.IsHost(1, "test@test.com")).ReturnsAsync(true);
        _mockMatchRepository.Setup(r => r.CreateMatch(1, It.IsAny<IEnumerable<int>>())).ReturnsAsync(match);
        var controller = CreateController();
        var request = new StartMatchRequest
        {
            ProblemIds = new List<int> { 1, 2 },
            DurationSec = 300
        };

        await controller.StartMatch(1, request);

        _mockLobbyRepository.Verify(r => r.UpdateLobbyStatus(1, "InProgress"), Times.Once);
    }
}