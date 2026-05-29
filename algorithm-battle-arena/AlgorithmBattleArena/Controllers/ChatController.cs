using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Attributes;
using Microsoft.AspNetCore.SignalR;
using AlgorithmBattleArena.Hubs;

namespace AlgorithmBattleArena.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatRepository _chatRepository;
        private readonly IFriendsRepository _friendsRepository;
        private readonly ITeacherRepository _teacherRepository;
        private readonly AuthHelper _authHelper;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IChatRepository chatRepository, IFriendsRepository friendsRepository,
            ITeacherRepository teacherRepository, AuthHelper authHelper, IHubContext<ChatHub> hubContext)
        {
            _chatRepository = chatRepository;
            _friendsRepository = friendsRepository;
            _teacherRepository = teacherRepository;
            _authHelper = authHelper;
            _hubContext = hubContext;
        }

        [HttpGet("conversations")]
        public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
        {
            try
            {
                var userEmail = _authHelper.GetEmailFromClaims(User);
                if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

                var conversations = await _chatRepository.GetConversationsAsync(userEmail);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting conversations: {ex.Message}");
            }
        }



        [HttpGet("conversations/{conversationId:int}/messages")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(int conversationId, 
            [FromQuery] int pageSize = 50, [FromQuery] int offset = 0)
        {
            try
            {
                var userEmail = _authHelper.GetEmailFromClaims(User);
                if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

                if (!await _chatRepository.IsParticipantAsync(conversationId, userEmail))
                    return Forbid("Not a participant in this conversation");

                var messages = await _chatRepository.GetMessagesAsync(conversationId, pageSize, offset);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting messages: {ex.Message}");
            }
        }

        [HttpPost("conversations/{conversationId:int}/messages")]
        public async Task<ActionResult> SendMessage(int conversationId, [FromBody] SendMessageDto request)
        {
            try
            {
                var userEmail = _authHelper.GetEmailFromClaims(User);
                if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

                if (string.IsNullOrWhiteSpace(request?.Content))
                    return BadRequest("Message content cannot be empty");

                if (!await _chatRepository.IsParticipantAsync(conversationId, userEmail))
                    return Forbid("Not a participant in this conversation");

                var messageId = await _chatRepository.SendMessageAsync(conversationId, userEmail, request.Content.Trim());
                
                // Create message object for broadcasting without additional DB query
                var senderName = GetSenderDisplayName(userEmail);
                var message = new MessageDto
                {
                    MessageId = messageId,
                    ConversationId = conversationId,
                    SenderEmail = userEmail,
                    SenderName = senderName,
                    Content = request.Content.Trim(),
                    SentAt = DateTime.UtcNow
                };
                
                if (message != null)
                {
                    await _hubContext.Clients.Group($"conversation_{conversationId}")
                        .SendAsync("NewMessage", message);
                }

                return Ok(new { MessageId = messageId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to send message: {ex.Message}");
            }
        }

        [HttpPost("conversations/friend")]
        public async Task<ActionResult> CreateFriendConversation([FromBody] CreateFriendConversationDto request)
        {
            try
            {
                var userEmail = _authHelper.GetEmailFromClaims(User);
                if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

                if (request == null || string.IsNullOrWhiteSpace(request.FriendEmail))
                    return BadRequest("Invalid friend information");

                // Handle role-based conversation creation
                var role = _authHelper.GetRoleFromClaims(User);
                if (role == "Student")
                {
                    var userId = _authHelper.GetUserIdFromClaims(User, "Student");
                    if (userId == null) return Unauthorized();

                    var isTeacher = false;
                    if (request.FriendId > 0)
                    {
                        isTeacher = await _teacherRepository.ExistsAsync(request.FriendId);
                    }

                    if (!isTeacher)
                    {
                        var friends = await _friendsRepository.GetFriendsAsync(userId.Value);
                        if (!friends.Any(f => f.StudentId == request.FriendId))
                            return BadRequest("You can only chat with friends");
                    }
                }
                else if (role == "Teacher")
                {
                    // Teachers can chat with any student - no additional validation needed
                    // The student-teacher relationship is managed through the student request system
                }

                // Check if conversation already exists
                var existingConversation = await _chatRepository.GetFriendConversationAsync(userEmail, request.FriendEmail);
                if (existingConversation != null)
                    return Ok(existingConversation);

                // Create new conversation
                var participantEmails = new List<string> { userEmail, request.FriendEmail };
                var conversationId = await _chatRepository.CreateConversationAsync("Friend", null, participantEmails);
                
                var conversation = await _chatRepository.GetConversationAsync(conversationId);
                return Ok(conversation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to create conversation: {ex.Message}");
            }
        }

        private string GetSenderDisplayName(string email)
        {
            try
            {
                var atIndex = email.IndexOf('@');
                if (atIndex > 0)
                {
                    return email.Substring(0, atIndex);
                }
                return email;
            }
            catch
            {
                return email;
            }
        }
    }
}
