using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Security.Claims;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Tests;

public class AuthHelperTest : IDisposable
{
    private readonly List<string> _envVarsToCleanup = new();

    private void SetEnvironmentVariable(string key, string? value)
    {
        Environment.SetEnvironmentVariable(key, value);
        _envVarsToCleanup.Add(key);
    }

    public void Dispose()
    {
        foreach (var key in _envVarsToCleanup)
        {
            Environment.SetEnvironmentVariable(key, null);
        }
    }

    private IConfiguration CreateConfiguration()
    {
        return new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
    }

    [Fact]
    public void GetPasswordSalt_ShouldGenerateUniqueSalts()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var salt1 = auth.GetPasswordSalt();
        var salt2 = auth.GetPasswordSalt();

        Assert.NotEqual(salt1, salt2);
        Assert.Equal(16, salt1.Length);
    }

    [Fact]
    public void GetPasswordHash_WithValidConfig_ShouldGenerateHash()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var salt = auth.GetPasswordSalt();
        var hash = auth.GetPasswordHash("password123", salt);

        Assert.NotNull(hash);
        Assert.Equal(32, hash.Length);
    }

    [Fact]
    public void VerifyPasswordHash_WithMatchingPasswords_ShouldReturnTrue()
    {
        var config = CreateConfiguration();
        var auth = new AuthHelper(config);
        var salt = auth.GetPasswordSalt();
        var hash = auth.GetPasswordHash("password123", salt);

        var result = auth.VerifyPasswordHash("password123", hash, salt);

        Assert.True(result);
    }

    [Fact]
    public void VerifyPasswordHash_WithNonMatchingPasswords_ShouldReturnFalse()
    {
        var config = CreateConfiguration();
        var auth = new AuthHelper(config);
        var salt = auth.GetPasswordSalt();
        var hash = auth.GetPasswordHash("password123", salt);

        var result = auth.VerifyPasswordHash("wrongpassword", hash, salt);

        Assert.False(result);
    }

    [Fact]
    public void CreateToken_WithValidInputs_ShouldCreateValidToken()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var token = auth.CreateToken("test@test.com", "Student", 1);

        Assert.NotNull(token);
        var principal = auth.ValidateToken(token);
        Assert.NotNull(principal);
    }

    [Theory]
    [InlineData("Student", "studentId")]
    [InlineData("Teacher", "teacherId")]
    public void CreateToken_WithUserRole_ShouldIncludeCorrectClaims(string role, string expectedClaimType)
    {
        var auth = new AuthHelper(CreateConfiguration());
        var token = auth.CreateToken("test@test.com", role, 1);
        
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        
        var principal = auth.ValidateToken(token);
        Assert.NotNull(principal);
        
        var email = auth.GetEmailFromClaims(principal);
        var userRole = auth.GetRoleFromClaims(principal);
        var claimValue = principal.FindFirst(expectedClaimType)?.Value;
        
        Assert.Equal("test@test.com", email);
        Assert.Equal(role, userRole);
        Assert.Equal("1", claimValue);
    }

    [Fact]
    public void ValidateToken_WithInvalidToken_ShouldReturnNull()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var result = auth.ValidateToken("invalid-token");

        Assert.Null(result);
    }

    [Fact]
    public void GetClaimValue_WithExistingClaim_ShouldReturnValue()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var token = auth.CreateToken("test@test.com", "Student", 1);
        var principal = auth.ValidateToken(token);

        var email = auth.GetClaimValue(principal!, "email", ClaimTypes.Email);

        Assert.Equal("test@test.com", email);
    }

    [Fact]
    public void GetClaimValue_WithMissingClaim_ShouldReturnNull()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var token = auth.CreateToken("test@test.com", "Student", 1);
        var principal = auth.ValidateToken(token);

        var value = auth.GetClaimValue(principal!, "nonexistent-claim");

        Assert.Null(value);
    }

    [Fact]
    public void GetUserIdFromClaims_WithValidStudentRole_ShouldReturnId()
    {
        var auth = new AuthHelper(CreateConfiguration());
        var token = auth.CreateToken("test@test.com", "Student", 1);
        var principal = auth.ValidateToken(token);

        var userId = auth.GetUserIdFromClaims(principal!, "Student");

        Assert.Equal(1, userId);
    }

    [Fact]
    public void ValidateAdminCredentials_WithConfiguration_ShouldUseConfig()
    {
        var config = CreateConfiguration();
        var auth = new AuthHelper(config);
        var result = auth.ValidateAdminCredentials("test-admin@test.com", "TestAdmin123");

        Assert.True(result);
    }
}