using AlgorithmBattleArena.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatRepository _chatRepository;
        private readonly AuthHelper _authHelper;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(IChatRepository chatRepository, AuthHelper authHelper, ILogger<ChatHub> logger)
        {
            _chatRepository = chatRepository;
            _authHelper = authHelper;
            _logger = logger;
        }

        private string? GetUserEmail()
        {
            if (Context.User == null) return null;
            return _authHelper.GetEmailFromClaims(Context.User);
        }

        public async Task JoinConversation(string conversationId)
        {
            try
            {
                if (!int.TryParse(conversationId, out int convId))
                    throw new HubException("Invalid conversation ID");

                var userEmail = GetUserEmail();
                if (string.IsNullOrEmpty(userEmail))
                    throw new HubException("User not authenticated");

                if (!await _chatRepository.IsParticipantAsync(convId, userEmail))
                    throw new HubException("Not authorized to join this conversation");

                var groupName = $"conversation_{convId}";
                _logger.LogInformation("ChatHub: User {Email} joining group {Group} (convId={ConvId})", userEmail, groupName, convId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            }
            catch (Exception ex) when (!(ex is HubException))
            {
                throw new HubException($"Failed to join conversation: {ex.Message}");
            }
        }

        public async Task LeaveConversation(string conversationId)
        {
            try
            {
                var groupName = $"conversation_{conversationId}";
                _logger.LogInformation("ChatHub: Connection {ConnId} leaving group {Group}", Context.ConnectionId, groupName);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to leave conversation: {ex.Message}");
            }
        }

        public async Task SendMessage(string conversationId, string content)
        {
            if (!int.TryParse(conversationId, out int convId))
                throw new HubException("Invalid conversation ID");

            var userEmail = GetUserEmail();
            if (string.IsNullOrEmpty(userEmail))
                throw new HubException("User not authenticated");

            if (!await _chatRepository.IsParticipantAsync(convId, userEmail))
                throw new HubException("Not authorized to send messages in this conversation");

            try
            {
                if (string.IsNullOrWhiteSpace(content))
                    throw new HubException("Message content cannot be empty");

                var messageId = await _chatRepository.SendMessageAsync(convId, userEmail, content.Trim());
                
                // Get sender name for better display
                var senderName = GetSenderDisplayName(userEmail);
                
                // Create message object for broadcasting without additional DB query
                var message = new MessageDto
                {
                    MessageId = messageId,
                    ConversationId = convId,
                    SenderEmail = userEmail,
                    SenderName = senderName,
                    Content = content.Trim(),
                    SentAt = DateTime.UtcNow
                };
                var groupName = $"conversation_{convId}";
                _logger.LogInformation("ChatHub: Broadcasting NewMessage to group {Group} from {Email} (messageId={MessageId})", groupName, userEmail, messageId);
                await Clients.Group(groupName).SendAsync("NewMessage", message);
            }
            catch (Exception ex)
            {
                throw new HubException($"Failed to send message: {ex.Message}");
            }
        }

        private string GetSenderDisplayName(string email)
        {
            try
            {
                // For now, just return the email part before @ as display name
                // This can be enhanced later with proper database queries
                var atIndex = email.IndexOf('@');
                if (atIndex > 0)
                {
                    return email.Substring(0, atIndex);
                }
                return email;
            }
            catch
            {
                return email; // Fallback to email if anything fails
            }
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var httpContext = Context.GetHttpContext();
                var path = httpContext?.Request?.Path.Value ?? "";
                var query = httpContext?.Request?.QueryString.Value ?? "";
                var connectionId = Context.ConnectionId;

                var email = Context.User != null ? _authHelper.GetEmailFromClaims(Context.User) ?? "(no-email)" : "(no-user)";
                var role = Context.User != null ? _authHelper.GetRoleFromClaims(Context.User) ?? "(no-role)" : "(no-user)";

                _logger.LogInformation("SignalR ChatHub connected: ConnectionId={ConnectionId}, Path={Path}, Query={Query}, Email={Email}, Role={Role}",
                    connectionId, path, query, email, role);
            }
            catch (Exception ex)
            {
                // Don't block connection on logging failures
                Console.WriteLine($"ChatHub OnConnected logging failed: {ex.Message}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var connectionId = Context.ConnectionId;
                var email = Context.User != null ? _authHelper.GetEmailFromClaims(Context.User) ?? "(no-email)" : "(no-user)";
                _logger.LogInformation("SignalR ChatHub disconnected: ConnectionId={ConnectionId}, Email={Email}, Reason={Reason}",
                    connectionId, email, exception?.Message ?? "(none)");
            }
            catch
            {
                // swallow
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
