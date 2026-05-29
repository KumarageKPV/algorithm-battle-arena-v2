using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Security.Claims;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Hubs;

namespace AlgorithmBattleArena.Tests
{
    public class ChatControllerTests
    {
        private readonly Mock<IChatRepository> _mockChatRepository;
        private readonly Mock<IFriendsRepository> _mockFriendsRepository;
        private readonly Mock<ITeacherRepository> _mockTeacherRepository;
        private readonly AuthHelper _authHelper;
        private readonly Mock<IHubContext<ChatHub>> _mockHubContext;
        private readonly ChatController _controller;

        public ChatControllerTests()
        {
            _mockChatRepository = new Mock<IChatRepository>();
            _mockFriendsRepository = new Mock<IFriendsRepository>();
            _mockTeacherRepository = new Mock<ITeacherRepository>();
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
                .Build();
            _authHelper = new AuthHelper(config);
            _mockHubContext = new Mock<IHubContext<ChatHub>>();

            // Setup SignalR hub context mocks
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            _mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);
            mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(mockClientProxy.Object);

            _controller = new ChatController(
                _mockChatRepository.Object,
                _mockFriendsRepository.Object,
                _mockTeacherRepository.Object,
                _authHelper,
                _mockHubContext.Object
            );

            // Setup controller context
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Email, "test@example.com")
            }));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetConversations_WithValidUser_ReturnsOk()
        {
            // Arrange
            var userEmail = "test@example.com";
            var conversations = new List<ConversationDto>
            {
                new ConversationDto { ConversationId = 1, Type = "Friend" }
            };

            _mockChatRepository.Setup(x => x.GetConversationsAsync(userEmail))
                              .ReturnsAsync(conversations);

            // Act
            var result = await _controller.GetConversations();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(conversations, okResult.Value);
        }

        [Fact]
        public async Task SendMessage_WithValidData_ReturnsOk()
        {
            // Arrange
            var userEmail = "test@example.com";
            var conversationId = 1;
            var messageContent = "Hello, World!";
            var messageId = 123;

            var request = new SendMessageDto { Content = messageContent };

            _mockChatRepository.Setup(x => x.IsParticipantAsync(conversationId, userEmail))
                              .ReturnsAsync(true);
            _mockChatRepository.Setup(x => x.SendMessageAsync(conversationId, userEmail, messageContent))
                              .ReturnsAsync(messageId);

            // Act
            var result = await _controller.SendMessage(conversationId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task SendMessage_WithEmptyContent_ReturnsBadRequest()
        {
            // Arrange
            // var userEmail = "test@example.com";
            var conversationId = 1;
            var request = new SendMessageDto { Content = "" };

            // Act
            var result = await _controller.SendMessage(conversationId, request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task SendMessage_WithUnauthorizedUser_ReturnsForbid()
        {
            // Arrange
            var userEmail = "test@example.com";
            var conversationId = 1;
            var request = new SendMessageDto { Content = "Hello" };

            _mockChatRepository.Setup(x => x.IsParticipantAsync(conversationId, userEmail))
                              .ReturnsAsync(false);

            // Act
            var result = await _controller.SendMessage(conversationId, request);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }
    }
}