using Microsoft.AspNetCore.Mvc;
using AlgorithmBattleArena.Attributes;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;

using AlgorithmBattleArena.Exceptions;
using AlgorithmBattleArena.Repositories;
using System.Security.Claims;
using System.Text.Json;
using System.Globalization;
using CsvHelper;

namespace AlgorithmBattleArena.Controllers
{
    [AdminOnly]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminRepository _adminRepository;
        private readonly ILogger<AdminController> _logger;
        private readonly IProblemImportRepository _importRepository;

        public AdminController(IAdminRepository adminRepository, ILogger<AdminController> logger, IProblemImportRepository importRepository)
        {
            _adminRepository = adminRepository;
            _logger = logger;
            _importRepository = importRepository;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? q, [FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        {
            try
            {
                var result = await _adminRepository.GetUsersAsync(q, role, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("users/{id}/deactivate")]
        public async Task<IActionResult> ToggleUserActive(string id, [FromBody] UserToggleDto request)
        {
            try
            {
                var user = await _adminRepository.ToggleUserActiveAsync(id, request.Deactivate);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling user active state for ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }



        [HttpPost("problems/import")]
        public async Task<IActionResult> ImportProblems()
        {
            try
            {
                var correlationId = HttpContext.Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? Guid.NewGuid().ToString();
                HttpContext.Items["CorrelationId"] = correlationId;

                List<ImportedProblemDto> problems;

                if (Request.HasFormContentType && Request.Form.Files.Count > 0)
                {
                    var file = Request.Form.Files[0];
                    if (file.Length > 10 * 1024 * 1024) // 10MB limit
                        return StatusCode(413, "File too large");

                    problems = await ParseFileAsync(file);
                }
                else
                {
                    using var reader = new StreamReader(Request.Body);
                    var json = await reader.ReadToEndAsync();
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    problems = JsonSerializer.Deserialize<List<ImportedProblemDto>>(json, options) ?? new List<ImportedProblemDto>();
                }

                if (problems.Count > 1000)
                    return StatusCode(413, "Too many rows. Maximum 1000 allowed.");

                // Validation is now handled inside the import repository
                var result = await _importRepository.ImportProblemsAsync(problems);
                _logger.LogInformation("Imported {Count} problems. CorrelationId: {CorrelationId}", result.Inserted, correlationId);
                return Ok(result);
            }
            catch (ImportException ex)
            {
                var correlationId = HttpContext.Items["CorrelationId"]?.ToString() ?? "unknown";
                _logger.LogWarning("Import validation failed. CorrelationId: {CorrelationId}", correlationId);
                return BadRequest(new ImportResultDto { Ok = false, Errors = ex.Errors.ToArray() });
            }
            catch (Exception ex)
            {
                var correlationId = HttpContext.Items["CorrelationId"]?.ToString() ?? "unknown";
                _logger.LogError(ex, "Error importing problems. CorrelationId: {CorrelationId}", correlationId);
                return StatusCode(500, "Internal server error");
            }
        }

        private async Task<List<ImportedProblemDto>> ParseFileAsync(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();
            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync();

            return extension switch
            {
                ".json" => ParseJson(content),
                ".csv" => ParseCsv(content),
                _ => throw new ArgumentException($"Unsupported file format: {extension}")
            };
        }

        private List<ImportedProblemDto> ParseJson(string content)
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<List<ImportedProblemDto>>(content, options) ?? new List<ImportedProblemDto>();
        }

        private List<ImportedProblemDto> ParseCsv(string content)
        {
            using var reader = new StringReader(content);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            return csv.GetRecords<ImportedProblemDto>().ToList();
        }

        private string GetActorUserId(ClaimsPrincipal user)
        {
            var role = user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value ?? "";

            return role switch
            {
                "Student" => $"Student:{userId}",
                "Teacher" => $"Teacher:{userId}",
                "Admin" => $"Admin:{userId}",
                _ => userId
            };
        }
    }
}
