using Xunit;
using Moq;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Tests;

public class AuthRepositoryTests : IDisposable
{
    private readonly List<string> _envVarsToCleanup = new();

    private void SetEnvironmentVariable(string key, string value)
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

    private static AuthHelper CreateAuthHelper()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        return new AuthHelper(config);
    }

    [Fact]
    public void UserExists_ReturnsTrue_WhenCountGreaterThanZero()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingle<int>(It.IsAny<string>(), It.IsAny<object>())).Returns(1);
        var repo = new AuthRepository(dapper.Object, CreateAuthHelper());

        var exists = repo.UserExists("e@e.com");

        Assert.True(exists);
        dapper.Verify(d => d.LoadDataSingle<int>(It.Is<string>(s => s.Contains("COUNT(*)")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public void GetAuthByEmail_ReturnsRecord_WhenFound()
    {
        var expected = new Auth { Email = "e@e.com", PasswordHash = new byte[32], PasswordSalt = new byte[16] };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleOrDefault<Auth>(It.IsAny<string>(), It.IsAny<object>())).Returns(expected);
        var repo = new AuthRepository(dapper.Object, CreateAuthHelper());

        var auth = repo.GetAuthByEmail("e@e.com");

        Assert.NotNull(auth);
        Assert.Equal("e@e.com", auth!.Email);
    }

    [Fact]
    public void RegisterStudent_UsesTransaction_ReturnsTrue_OnSuccess()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.ExecuteTransaction(It.IsAny<List<(string sql, object? parameters)>>())).Returns(true);
        var repo = new AuthRepository(dapper.Object, CreateAuthHelper());

        var ok = repo.RegisterStudent(new StudentForRegistrationDto { Email = "e@e.com", FirstName="A", LastName="B", Password = "x", PasswordConfirm = "x", TeacherId = 2 });

        Assert.True(ok);
        dapper.Verify(d => d.ExecuteTransaction(It.Is<List<(string sql, object? parameters)>>(l => l.Count == 2)), Times.Once);
    }

    [Fact]
    public void RegisterTeacher_UsesTransaction_ReturnsTrue_OnSuccess()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.ExecuteTransaction(It.IsAny<List<(string sql, object? parameters)>>())).Returns(true);
        var repo = new AuthRepository(dapper.Object, CreateAuthHelper());

        var ok = repo.RegisterTeacher(new TeacherForRegistrationDto { Email = "t@e.com", FirstName="T", LastName="R", Password = "x", PasswordConfirm = "x" });

        Assert.True(ok);
        dapper.Verify(d => d.ExecuteTransaction(It.Is<List<(string sql, object? parameters)>>(l => l.Count == 2)), Times.Once);
    }

    [Fact]
    public void GetUserRole_ReturnsStudent_WhenStudentFound()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleOrDefault<Student>(It.Is<string>(s => s.Contains("FROM AlgorithmBattleArinaSchema.Student")), It.IsAny<object>()))
              .Returns(new Student { StudentId = 1, Email = "e@e.com" });
        var repo = new AuthRepository(dapper.Object, CreateAuthHelper());

        var role = repo.GetUserRole("e@e.com");

        Assert.Equal("Student", role);
    }

    [Fact]
    public void RegisterStudent_WithConfiguration_ShouldWork()
    {
        var authHelper = CreateAuthHelper();
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.ExecuteTransaction(It.IsAny<List<(string sql, object? parameters)>>())).Returns(true);
        var repo = new AuthRepository(dapper.Object, authHelper);

        var ok = repo.RegisterStudent(new StudentForRegistrationDto { Email = "e@e.com", FirstName="A", LastName="B", Password = "x", PasswordConfirm = "x", TeacherId = 2 });

        Assert.True(ok);
        dapper.Verify(d => d.ExecuteTransaction(It.Is<List<(string sql, object? parameters)>>(l => l.Count == 2)), Times.Once);
    }
}