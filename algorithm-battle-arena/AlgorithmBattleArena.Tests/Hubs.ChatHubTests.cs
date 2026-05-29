using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Security.Claims;
using AlgorithmBattleArena.Hubs;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Tests
{
    public class ChatHubTests
    {
        private readonly Mock<IChatRepository> _mockChatRepository;
        private readonly AuthHelper _authHelper;
        private readonly Mock<ILogger<ChatHub>> _mockLogger;
        private readonly Mock<HubCallerContext> _mockContext;
        private readonly Mock<IGroupManager> _mockGroups;
        private readonly Mock<IHubCallerClients> _mockClients;
        private readonly ChatHub _hub;

        public ChatHubTests()
        {
            _mockChatRepository = new Mock<IChatRepository>();
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
                .Build();
            _authHelper = new AuthHelper(config);
            _mockLogger = new Mock<ILogger<ChatHub>>();
            _mockContext = new Mock<HubCallerContext>();
            _mockGroups = new Mock<IGroupManager>();
            _mockClients = new Mock<IHubCallerClients>();

            _hub = new ChatHub(_mockChatRepository.Object, _authHelper, _mockLogger.Object);

            // Setup hub context
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Email, "test@example.com")
            }));

            _mockContext.Setup(x => x.User).Returns(user);
            _mockContext.Setup(x => x.ConnectionId).Returns("test-connection-id");

            _hub.Context = _mockContext.Object;
            _hub.Groups = _mockGroups.Object;
            _hub.Clients = _mockClients.Object;
        }

        [Fact]
        public async Task JoinConversation_WithValidData_JoinsGroup()
        {
            // Arrange
            var conversationId = "1";
            var userEmail = "test@example.com";

            _mockChatRepository.Setup(x => x.IsParticipantAsync(1, userEmail))
                              .ReturnsAsync(true);

            // Act
            await _hub.JoinConversation(conversationId);

            // Assert
            _mockGroups.Verify(x => x.AddToGroupAsync("test-connection-id", "conversation_1", default), Times.Once);
        }

        [Fact]
        public async Task JoinConversation_WithInvalidId_ThrowsHubException()
        {
            // Arrange
            var conversationId = "invalid";

            // Act & Assert
            await Assert.ThrowsAsync<HubException>(() => _hub.JoinConversation(conversationId));
        }

        [Fact]
        public async Task JoinConversation_WithUnauthorizedUser_ThrowsHubException()
        {
            // Arrange
            var conversationId = "1";
            var userEmail = "test@example.com";

            _mockChatRepository.Setup(x => x.IsParticipantAsync(1, userEmail))
                              .ReturnsAsync(false);

            // Act & Assert
            await Assert.ThrowsAsync<HubException>(() => _hub.JoinConversation(conversationId));
        }

        [Fact]
        public async Task SendMessage_WithEmptyContent_ThrowsHubException()
        {
            // Arrange
            var conversationId = "1";
            var content = "";

            // Act & Assert
            await Assert.ThrowsAsync<HubException>(() => _hub.SendMessage(conversationId, content));
        }

        [Fact]
        public async Task LeaveConversation_WithValidId_LeavesGroup()
        {
            // Arrange
            var conversationId = "1";

            // Act
            await _hub.LeaveConversation(conversationId);

            // Assert
            _mockGroups.Verify(x => x.RemoveFromGroupAsync("test-connection-id", "conversation_1", default), Times.Once);
        }
    }
}