using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        private readonly ISubmissionRepository _submissionRepository;
        private readonly AuthHelper _authHelper;

        public SubmissionsController(ISubmissionRepository submissionRepository, AuthHelper authHelper)
        {
            _submissionRepository = submissionRepository;
            _authHelper = authHelper;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubmission([FromBody] SubmissionDto dto)
        {
            var userEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized();
            }

            var submission = new Submission
            {
                MatchId = dto.MatchId,
                ProblemId = dto.ProblemId,
                ParticipantEmail = userEmail,
                Language = dto.Language,
                Code = dto.Code,
                Status = dto.Status,
                Score = dto.Score
            };

            var submissionId = await _submissionRepository.CreateSubmission(submission);

            return Ok(new { SubmissionId = submissionId });
        }

        [HttpGet("match/{matchId}/user")]
        public async Task<IActionResult> GetUserSubmissions(int matchId)
        {
            var userEmail = _authHelper.GetEmailFromClaims(User);
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized();
            }

            var submissions = await _submissionRepository.GetSubmissionsByMatchAndUser(matchId, userEmail);
            return Ok(submissions);
        }
    }
}
