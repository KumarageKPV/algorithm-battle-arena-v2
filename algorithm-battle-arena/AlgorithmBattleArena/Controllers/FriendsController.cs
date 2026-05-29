using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Attributes;

namespace AlgorithmBattleArena.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FriendsController : ControllerBase
    {
        private readonly IFriendsRepository _friendsRepository;
        private readonly IChatRepository _chatRepository;
        private readonly AuthHelper _authHelper;

        public FriendsController(IFriendsRepository friendsRepository, IChatRepository chatRepository, AuthHelper authHelper)
        {
            _friendsRepository = friendsRepository;
            _chatRepository = chatRepository;
            _authHelper = authHelper;
        }

        [HttpGet]
        [StudentOnly]
        public async Task<ActionResult<IEnumerable<FriendDto>>> GetFriends()
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            var friends = await _friendsRepository.GetFriendsAsync(studentId.Value);
            return Ok(friends);
        }

        [HttpGet("search")]
        [StudentOnly]
        public async Task<ActionResult<IEnumerable<FriendDto>>> SearchStudents([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query cannot be empty");

            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            var students = await _friendsRepository.SearchStudentsAsync(query, studentId.Value);
            return Ok(students);
        }

        [HttpPost("request")]
        [StudentOnly]
        public async Task<ActionResult> SendFriendRequest([FromBody] SendFriendRequestDto request)
        {
            var senderId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (senderId == null) return Unauthorized();
            
            if (senderId.Value == request.ReceiverId)
                return BadRequest("Cannot send friend request to yourself");

            try
            {
                var requestId = await _friendsRepository.SendFriendRequestAsync(senderId.Value, request.ReceiverId);
                return Ok(new { RequestId = requestId, Message = "Friend request sent successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to send friend request: {ex.Message}");
            }
        }

        [HttpGet("requests/received")]
        [StudentOnly]
        public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetReceivedRequests()
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            var requests = await _friendsRepository.GetReceivedRequestsAsync(studentId.Value);
            return Ok(requests);
        }

        [HttpGet("requests/sent")]
        [StudentOnly]
        public async Task<ActionResult<IEnumerable<FriendRequestDto>>> GetSentRequests()
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            var requests = await _friendsRepository.GetSentRequestsAsync(studentId.Value);
            return Ok(requests);
        }

        [HttpPut("requests/{requestId}/accept")]
        [StudentOnly]
        public async Task<ActionResult> AcceptFriendRequest(int requestId)
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            
            try
            {
                var friendRequest = await _friendsRepository.GetFriendRequestAsync(requestId);
                if (friendRequest == null) return NotFound("Friend request not found");
                
                await _friendsRepository.AcceptFriendRequestAsync(requestId, studentId.Value);
                
                // Create friend chat conversation
                var userEmail = _authHelper.GetEmailFromClaims(User);
                var friendEmail = friendRequest.SenderEmail;
                if (!string.IsNullOrEmpty(userEmail) && !string.IsNullOrEmpty(friendEmail))
                {
                    var existingConv = await _chatRepository.GetFriendConversationAsync(userEmail, friendEmail);
                    if (existingConv == null)
                    {
                        await _chatRepository.CreateConversationAsync("Friend", null, new List<string> { userEmail, friendEmail });
                    }
                }
                
                return Ok(new { Message = "Friend request accepted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to accept friend request: {ex.Message}");
            }
        }

        [HttpPut("requests/{requestId}/reject")]
        [StudentOnly]
        public async Task<ActionResult> RejectFriendRequest(int requestId)
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            
            try
            {
                await _friendsRepository.RejectFriendRequestAsync(requestId, studentId.Value);
                return Ok(new { Message = "Friend request rejected successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to reject friend request: {ex.Message}");
            }
        }

        [HttpDelete("{friendId}")]
        [StudentOnly]
        public async Task<ActionResult> RemoveFriend(int friendId)
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null) return Unauthorized();
            
            try
            {
                await _friendsRepository.RemoveFriendAsync(studentId.Value, friendId);
                return Ok(new { Message = "Friend removed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to remove friend: {ex.Message}");
            }
        }
    }
}
