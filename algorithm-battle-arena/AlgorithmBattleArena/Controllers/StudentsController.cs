using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using System.Threading.Tasks;
using System.Security.Claims;

namespace AlgorithmBattleArena.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentRepository _studentRepository;
        private readonly AuthHelper _authHelper;

        public StudentsController(IStudentRepository studentRepository, AuthHelper authHelper)
        {
            _studentRepository = studentRepository;
            _authHelper = authHelper;
        }

        [HttpPost("request")]
        public async Task<IActionResult> RequestTeacher([FromBody] int teacherId)
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null)
            {
                return Unauthorized("User not found or not a student");
            }

            var requestId = await _studentRepository.CreateRequest(studentId.Value, teacherId);
            return Ok(new { RequestId = requestId });
        }

        [HttpPut("{requestId}/accept")]
        public async Task<IActionResult> AcceptRequest(int requestId)
        {
            var teacherId = _authHelper.GetUserIdFromClaims(User, "Teacher");
            if (teacherId == null)
            {
                return Unauthorized("User not found or not a teacher");
            }

            await _studentRepository.AcceptRequest(requestId, teacherId.Value);
            return Ok();
        }

        [HttpPut("{requestId}/reject")]
        public async Task<IActionResult> RejectRequest(int requestId)
        {
            var teacherId = _authHelper.GetUserIdFromClaims(User, "Teacher");
            if (teacherId == null)
            {
                return Unauthorized("User not found or not a teacher");
            }

            await _studentRepository.RejectRequest(requestId, teacherId.Value);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetStudents([FromQuery] string status)
        {
            var teacherId = _authHelper.GetUserIdFromClaims(User, "Teacher");
            if (teacherId == null)
            {
                return Unauthorized("User not found or not a teacher");
            }

            var students = await _studentRepository.GetStudentsByStatus(teacherId.Value, status);
            return Ok(students);
        }

        [HttpGet("teachers")]
        public async Task<IActionResult> GetAcceptedTeachers()
        {
            var studentId = _authHelper.GetUserIdFromClaims(User, "Student");
            if (studentId == null)
            {
                return Unauthorized("User not found or not a student");
            }

            var teachers = await _studentRepository.GetAcceptedTeachers(studentId.Value);
            return Ok(teachers);
        }

        [HttpGet("{studentId}/analytics")]
        public async Task<IActionResult> GetStudentAnalytics(int studentId)
        {
            var teacherId = _authHelper.GetUserIdFromClaims(User, "Teacher");
            if (teacherId == null)
            {
                return Unauthorized("User not found or not a teacher");
            }

            var analytics = await _studentRepository.GetStudentAnalytics(teacherId.Value, studentId);
            if (analytics == null)
            {
                return NotFound("Student not found or not assigned to this teacher");
            }

            return Ok(analytics);
        }

        [HttpGet("{studentId}/submissions")]
        public async Task<IActionResult> GetStudentSubmissionHistory(int studentId)
        {
            var teacherId = _authHelper.GetUserIdFromClaims(User, "Teacher");
            if (teacherId == null)
            {
                return Unauthorized("User not found or not a teacher");
            }

            var submissions = await _studentRepository.GetStudentSubmissionHistory(teacherId.Value, studentId);
            return Ok(submissions);
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetTeacherDashboardStats()
        {
            var teacherId = _authHelper.GetUserIdFromClaims(User, "Teacher");
            if (teacherId == null)
            {
                return Unauthorized("User not found or not a teacher");
            }

            var stats = await _studentRepository.GetTeacherDashboardStats(teacherId.Value);
            return Ok(stats);
        }
    }
}
