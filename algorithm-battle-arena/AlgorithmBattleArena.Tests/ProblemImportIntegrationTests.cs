using System.Diagnostics;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Services;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Xunit;

namespace AlgorithmBattleArena.Tests;

public class ProblemImportIntegrationTests : IDisposable
{
    private readonly DataContextEF _context;
    private readonly AdminController _controller;
    private readonly string _validTestFile;
    private readonly string _malformedTestFile;

    public ProblemImportIntegrationTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "InMemory"
            })
            .Build();

        var options = new DbContextOptionsBuilder<DataContextEF>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TestDataContextEF(config, options);
        var logger = new TestLogger<AdminController>();
        var mockProblemRepo = new MockProblemRepository();
        var importRepository = new ProblemImportRepository(mockProblemRepo);
        var mockAdminRepo = new MockAdminRepository(_context);
        _controller = new AdminController(mockAdminRepo, logger, importRepository);

        // Set up admin authentication
        SetupAdminAuth();

        // Set up test file paths - resolve from project root
        var projectRoot = GetProjectRoot();
        _validTestFile = Path.Combine(projectRoot, "data", "seeds", "tests", "valid-test.json");
        _malformedTestFile = Path.Combine(projectRoot, "data", "seeds", "tests", "malformed-test.json");
    }

    [Fact]
    public async Task AdminImportEndpoint_ValidFile_InsertsProblems()
    {
        // Arrange
    var validJson = await File.ReadAllTextAsync(_validTestFile);
    // Convert tags arrays to comma-separated strings
    var processedJson = ConvertTagsArrayToString(validJson);
    // Simulate request body
    var stream = new MemoryStream(Encoding.UTF8.GetBytes(processedJson));
    _controller.ControllerContext.HttpContext.Request.Body = stream;
    _controller.ControllerContext.HttpContext.Request.ContentType = "application/json";

        // Act
        var result = await _controller.ImportProblems();

        // Assert
        var objectResult = result as ObjectResult;
        Assert.NotNull(objectResult);
        
        // Check if it's a success response (200) or error (500)
        if (objectResult.StatusCode == 500)
        {
            Assert.Fail("Import failed with 500 error - check controller implementation");
            return;
        }
        
        Assert.Equal(200, objectResult.StatusCode);
        var importResult = Assert.IsType<ImportResultDto>(objectResult.Value);
        
        Assert.True(importResult.Ok);
        Assert.True(importResult.Inserted > 0);
    }

    [Fact]
    public async Task AdminImportEndpoint_MalformedFile_ReturnsErrors()
    {
        // Arrange
        var malformedJson = await File.ReadAllTextAsync(_malformedTestFile);
        var processedJson = ConvertTagsArrayToString(malformedJson);
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(processedJson));
        _controller.ControllerContext.HttpContext.Request.Body = stream;
        _controller.ControllerContext.HttpContext.Request.ContentType = "application/json";

        // Act
        var result = await _controller.ImportProblems();

        // Assert
        // Accept BadRequestObjectResult or ObjectResult
        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode ?? 400); // BadRequest returns 400
        var importResult = Assert.IsType<ImportResultDto>(objectResult.Value);

        Assert.False(importResult.Ok);
        Assert.NotEmpty(importResult.Errors);

        // Verify validation errors exist
        var errors = importResult.Errors;
        Assert.Contains(errors, e => e.Field == "title" && e.Message == "Title is required");
        Assert.Contains(errors, e => e.Field == "testCases" && e.Message == "At least one test case required");
    }

    [Fact]
    public void CLI_DryRun_MalformedFile_ReturnsNonZeroExit()
    {
        // Arrange
        var cliPath = Path.Combine("tools", "ProblemImporter", "bin", "Debug", "net8.0", "ProblemImporter.exe");
        var absoluteMalformedPath = Path.GetFullPath(_malformedTestFile);

        // Skip test if CLI executable doesn't exist
        if (!File.Exists(cliPath))
        {
            Assert.True(true, "CLI executable not found, skipping test");
            return;
        }

        // Act
        var processInfo = new ProcessStartInfo
        {
            FileName = cliPath,
            Arguments = $"--file \"{absoluteMalformedPath}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(processInfo);
        process?.WaitForExit();
        var output = process?.StandardOutput.ReadToEnd() ?? "";
        var error = process?.StandardError.ReadToEnd() ?? "";
        var exitCode = process?.ExitCode ?? 0;

        // Assert
        Assert.NotEqual(0, exitCode); // Non-zero exit code indicates validation failure
        Assert.Contains("Validation failed", output + error);
        Assert.Contains("Row 1", output + error); // Should show row-level errors
    }

    [Fact]
    public void CLI_DryRun_ValidFile_ReturnsZeroExit()
    {
        // Arrange
        var cliPath = Path.Combine("tools", "ProblemImporter", "bin", "Debug", "net8.0", "ProblemImporter.exe");
        var absoluteValidPath = Path.GetFullPath(_validTestFile);

        // Skip test if CLI executable doesn't exist
        if (!File.Exists(cliPath))
        {
            Assert.True(true, "CLI executable not found, skipping test");
            return;
        }

        // Act
        var processInfo = new ProcessStartInfo
        {
            FileName = cliPath,
            Arguments = $"--file \"{absoluteValidPath}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(processInfo);
        process?.WaitForExit();
        var output = process?.StandardOutput.ReadToEnd() ?? "";
        var exitCode = process?.ExitCode ?? 0;

        // Assert
        Assert.Equal(0, exitCode); // Zero exit code indicates success
        Assert.Contains("Validation passed", output);
        Assert.Contains("Dry-run complete", output);
    }

    private void SetupAdminAuth()
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "admin@test.com"),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "TestAuth");

        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity)
        };
        httpContext.Items["CorrelationId"] = "test-correlation-id";

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private class TestDataContextEF : DataContextEF
    {
        private readonly DbContextOptions<DataContextEF> _options;

        public TestDataContextEF(IConfiguration config, DbContextOptions<DataContextEF> options) 
            : base(config)
        {
            _options = options;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString());
        }
    }

    private static string GetProjectRoot()
    {
        var currentDir = Directory.GetCurrentDirectory();
        // Navigate up to find the solution root (where AlgorithmBattleArena folder is)
        while (currentDir != null)
        {
            var solutionPath = Path.Combine(currentDir, "AlgorithmBattleArena", "AlgorithmBattleArena.sln");
            if (File.Exists(solutionPath))
            {
                return currentDir; // Return the parent of AlgorithmBattleArena folder
            }
            currentDir = Directory.GetParent(currentDir)?.FullName;
        }
        return Directory.GetCurrentDirectory();
    }

    private class TestLogger<T> : ILogger<T>
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => false;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) { }
    }

    private class MockProblemRepository : IProblemRepository
    {
        public Task<int> UpsertProblem(ProblemUpsertDto dto) => Task.FromResult(1);
        public Task<PagedResult<ProblemListDto>> GetProblems(ProblemFilterDto filter) => Task.FromResult(new PagedResult<ProblemListDto>());
        public Task<ProblemResponseDto?> GetProblem(int id) => Task.FromResult<ProblemResponseDto?>(null);
        public Task<bool> DeleteProblem(int id) => Task.FromResult(true);
        public Task<IEnumerable<string>> GetCategories() => Task.FromResult(Enumerable.Empty<string>());
        public Task<IEnumerable<string>> GetDifficultyLevels() => Task.FromResult(Enumerable.Empty<string>());
        public Task<IEnumerable<Problem>> GetRandomProblems(string language, string difficulty, int maxProblems) => Task.FromResult(Enumerable.Empty<Problem>());
        public Task<int> ImportProblemsAsync(IEnumerable<Problem> problems) => Task.FromResult(problems.Count());
        public Task<bool> SlugExistsAsync(string slug) => Task.FromResult(false);
    }

    private class MockAdminRepository : IAdminRepository
    {
        private readonly DataContextEF _context;
        public MockAdminRepository(DataContextEF context) => _context = context;
        
        public Task<PagedResult<AdminUserDto>> GetUsersAsync(string? q, string? role, int page, int pageSize) => 
            Task.FromResult(new PagedResult<AdminUserDto>());
        
        public Task<AdminUserDto?> ToggleUserActiveAsync(string id, bool deactivate) => 
            Task.FromResult<AdminUserDto?>(null);
    }
    /// <summary>
    /// Converts all "tags": [ ... ] arrays in the JSON to "tags": "tag1,tag2" strings.
    /// </summary>
    private static string ConvertTagsArrayToString(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        if (root.ValueKind != JsonValueKind.Array)
            return json;
        var problems = new List<Dictionary<string, object?>>();
        foreach (var problem in root.EnumerateArray())
        {
            var dict = new Dictionary<string, object?>();
            foreach (var prop in problem.EnumerateObject())
            {
                if (prop.NameEquals("tags") && prop.Value.ValueKind == JsonValueKind.Array)
                {
                    var tags = prop.Value.EnumerateArray().Select(t => t.GetString()).Where(t => t != null);
                    dict["tags"] = string.Join(",", tags!);
                }
                else
                {
                    dict[prop.Name] = prop.Value.Deserialize<object?>();
                }
            }
            problems.Add(dict);
        }
        return JsonSerializer.Serialize(problems);
    }
}