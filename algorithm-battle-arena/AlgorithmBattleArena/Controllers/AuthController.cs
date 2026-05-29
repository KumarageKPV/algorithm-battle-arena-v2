using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using System.Security.Claims;

namespace AlgorithmBattleArena.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly AuthHelper _authHelper;

        public AuthController(IAuthRepository authRepository, AuthHelper authHelper)
        {
            _authRepository = authRepository;
            _authHelper = authHelper;
        }

        [AllowAnonymous]
        [HttpPost("register/student")]
        public IActionResult RegisterStudent([FromBody] StudentForRegistrationDto studentDto)
        {
            try
            {
                if (studentDto.Password != studentDto.PasswordConfirm)
                    return BadRequest("Passwords do not match");

                if (_authRepository.UserExists(studentDto.Email))
                    return BadRequest("User with this email already exists");

                bool success = _authRepository.RegisterStudent(studentDto);
                return success
                    ? Ok(new { message = "Student registered successfully" })
                    : BadRequest("Failed to register student");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpPost("register/teacher")]
        public IActionResult RegisterTeacher([FromBody] TeacherForRegistrationDto teacherDto)
        {
            try
            {
                if (teacherDto.Password != teacherDto.PasswordConfirm)
                    return BadRequest("Passwords do not match");

                if (_authRepository.UserExists(teacherDto.Email))
                    return BadRequest("User with this email already exists");

                bool success = _authRepository.RegisterTeacher(teacherDto);
                return success
                    ? Ok(new { message = "Teacher registered successfully" })
                    : BadRequest("Failed to register teacher");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserForLoginDto loginDto)
        {
            try
            {
                // Check for admin credentials first
                if (_authHelper.ValidateAdminCredentials(loginDto.Email, loginDto.Password))
                {
                    string adminToken = _authHelper.CreateToken(loginDto.Email, "Admin");
                    return Ok(new { token = adminToken, role = "Admin", email = loginDto.Email });
                }

                var authData = _authRepository.GetAuthByEmail(loginDto.Email);
                if (authData == null || !_authHelper.VerifyPasswordHash(loginDto.Password, authData.PasswordHash, authData.PasswordSalt))
                    return Unauthorized("Invalid credentials");

                string userRole = _authRepository.GetUserRole(loginDto.Email);
                int? userId = null;
                bool isActive = false;

                if (userRole == "Student")
                {
                    var student = _authRepository.GetStudentByEmail(loginDto.Email);
                    userId = student?.StudentId;
                    isActive = student?.Active ?? false;
                }
                else if (userRole == "Teacher")
                {
                    var teacher = _authRepository.GetTeacherByEmail(loginDto.Email);
                    userId = teacher?.TeacherId;
                    isActive = teacher?.Active ?? false;
                }

                if (userId == null)
                    return Unauthorized("User not found");

                if (!isActive)
                    return Unauthorized("Account has been deactivated");

                string userToken = _authHelper.CreateToken(loginDto.Email, userRole, userId);
                return Ok(new { token = userToken, role = userRole, email = loginDto.Email });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("refresh/token")]
        public IActionResult RefreshToken()
        {
            try
            {
                string? email = _authHelper.GetEmailFromClaims(User);
                string? role = _authHelper.GetRoleFromClaims(User);

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
                    return Unauthorized("Invalid token - missing required claims");

                int? userId = _authHelper.GetUserIdFromClaims(User, role);
                if (userId == null) return Unauthorized("User not found");

                string newToken = _authHelper.CreateToken(email, role, userId);
                return Ok(new { token = newToken, role, email });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            try
            {
                string? email = _authHelper.GetEmailFromClaims(User);
                string? role = _authHelper.GetRoleFromClaims(User);

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
                    return Unauthorized("Invalid token");

                if (role == "Student")
                {
                    var student = _authRepository.GetStudentByEmail(email);
                    if (student == null) return NotFound("Student not found");

                    return Ok(new
                    {
                        id = student.StudentId,
                        firstName = student.FirstName,
                        lastName = student.LastName,
                        fullName = student.FullName,
                        email = student.Email,
                        teacherId = student.TeacherId,
                        role = "Student",
                        active = student.Active
                    });
                }
                else if (role == "Teacher")
                {
                    var teacher = _authRepository.GetTeacherByEmail(email);
                    if (teacher == null) return NotFound("Teacher not found");

                    return Ok(new
                    {
                        id = teacher.TeacherId,
                        firstName = teacher.FirstName,
                        lastName = teacher.LastName,
                        fullName = teacher.FullName,
                        email = teacher.Email,
                        role = "Teacher",
                        active = teacher.Active
                    });
                }

                return BadRequest("Invalid user role");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


    }
}
