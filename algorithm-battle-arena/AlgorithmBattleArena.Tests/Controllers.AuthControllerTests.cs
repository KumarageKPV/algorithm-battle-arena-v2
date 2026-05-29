using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Security.Claims;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Tests;

public class AuthControllerTests : IDisposable
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

    private static AuthHelper CreateAuthHelper()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        return new AuthHelper(config);
    }

    [Fact]
    public void RegisterStudent_PasswordMismatch_ReturnsBadRequest()
    {
        var repo = new Mock<IAuthRepository>();
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new StudentForRegistrationDto { Email="e@e.com", Password="a", PasswordConfirm="b" };

        var result = controller.RegisterStudent(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Passwords do not match", bad.Value);
    }

    [Fact]
    public void RegisterStudent_UserExists_ReturnsBadRequest()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.UserExists("e@e.com")).Returns(true);
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new StudentForRegistrationDto { Email="e@e.com", Password="x", PasswordConfirm="x" };

        var result = controller.RegisterStudent(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("User with this email already exists", bad.Value);
    }

    [Fact]
    public void RegisterStudent_Success_ReturnsOk()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.UserExists("e@e.com")).Returns(false);
        repo.Setup(r => r.RegisterStudent(It.IsAny<StudentForRegistrationDto>())).Returns(true);
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new StudentForRegistrationDto { Email="e@e.com", Password="x", PasswordConfirm="x" };

        var result = controller.RegisterStudent(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Contains("Student registered successfully", ok.Value!.ToString());
    }

    [Fact]
    public void RegisterStudent_RepositoryFailure_ReturnsBadRequest()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.UserExists("e@e.com")).Returns(false);
        repo.Setup(r => r.RegisterStudent(It.IsAny<StudentForRegistrationDto>())).Returns(false);
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new StudentForRegistrationDto { Email="e@e.com", Password="x", PasswordConfirm="x" };

        var result = controller.RegisterStudent(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Failed to register student", bad.Value);
    }

    [Fact]
    public void RegisterTeacher_UserExists_ReturnsBadRequest()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.UserExists("t@e.com")).Returns(true);
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new TeacherForRegistrationDto { Email="t@e.com", Password="x", PasswordConfirm="x" };

        var result = controller.RegisterTeacher(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("User with this email already exists", bad.Value);
    }

    [Fact]
    public void RegisterTeacher_Success_ReturnsOk()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.UserExists("t@e.com")).Returns(false);
        repo.Setup(r => r.RegisterTeacher(It.IsAny<TeacherForRegistrationDto>())).Returns(true);
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new TeacherForRegistrationDto { Email="t@e.com", Password="x", PasswordConfirm="x" };

        var result = controller.RegisterTeacher(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Contains("Teacher registered successfully", ok.Value!.ToString());
    }

    [Fact]
    public void RegisterTeacher_RepositoryFailure_ReturnsBadRequest()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.UserExists("t@e.com")).Returns(false);
        repo.Setup(r => r.RegisterTeacher(It.IsAny<TeacherForRegistrationDto>())).Returns(false);
        var controller = new AuthController(repo.Object, CreateAuthHelper());
        var dto = new TeacherForRegistrationDto { Email="t@e.com", Password="x", PasswordConfirm="x" };

        var result = controller.RegisterTeacher(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Failed to register teacher", bad.Value);
    }

    [Fact]
    public void Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetAuthByEmail("e@e.com")).Returns((Auth?)null);
        var controller = new AuthController(repo.Object, CreateAuthHelper());

        var result = controller.Login(new UserForLoginDto { Email="e@e.com", Password="x" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public void Login_WithConfiguration_ShouldWork()
    {
        var helper = CreateAuthHelper();
        var salt = helper.GetPasswordSalt();
        var hash = helper.GetPasswordHash("P@ssw0rd", salt);

        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetAuthByEmail("e@e.com")).Returns(new Auth {
            Email="e@e.com", PasswordSalt=salt, PasswordHash=hash
        });
        repo.Setup(r => r.GetUserRole("e@e.com")).Returns("Student");
        repo.Setup(r => r.GetStudentByEmail("e@e.com")).Returns(new Student { StudentId=1, Email="e@e.com", FirstName="A", LastName="B", Active=true });

        var controller = new AuthController(repo.Object, helper);

        var result = controller.Login(new UserForLoginDto { Email="e@e.com", Password="P@ssw0rd" });

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public void RefreshToken_Success_ReturnsToken()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetUserRole("e@e.com")).Returns("Student");
        repo.Setup(r => r.GetStudentByEmail("e@e.com")).Returns(new Student { StudentId=1, Email="e@e.com", FirstName="A", LastName="B", Active=true });
        var controller = new AuthController(repo.Object, CreateAuthHelper());

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "e@e.com"),
            new Claim(ClaimTypes.Role, "Student"),
            new Claim("studentId", "1"),
        }, "TestAuth");
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) } };

        var result = controller.RefreshToken();

        var ok = Assert.IsType<OkObjectResult>(result);
        var val = ok.Value!;
        string token = (string)val.GetType().GetProperty("token")!.GetValue(val)!;
        string role = (string)val.GetType().GetProperty("role")!.GetValue(val)!;
        string email = (string)val.GetType().GetProperty("email")!.GetValue(val)!;
        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal("Student", role);
        Assert.Equal("e@e.com", email);
    }

    [Fact]
    public void Profile_MissingClaims_ReturnsUnauthorized()
    {
        var controller = new AuthController(new Mock<IAuthRepository>().Object, CreateAuthHelper());
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) } };

        var result = controller.GetProfile();

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public void Profile_StudentSuccess_ReturnsOkPayload()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetStudentByEmail("e@e.com")).Returns(new Student { StudentId=7, FirstName="A", LastName="B", Email="e@e.com", TeacherId=2, Active=true });
        var controller = new AuthController(repo.Object, CreateAuthHelper());

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "e@e.com"),
            new Claim(ClaimTypes.Role, "Student"),
            new Claim("studentId", "7"),
        }, "TestAuth");
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) } };

        var result = controller.GetProfile();

        var ok = Assert.IsType<OkObjectResult>(result);
        var val = ok.Value!;
        int id = (int)val.GetType().GetProperty("id")!.GetValue(val)!;
        string firstName = (string)val.GetType().GetProperty("firstName")!.GetValue(val)!;
        string role = (string)val.GetType().GetProperty("role")!.GetValue(val)!;
        Assert.Equal(7, id);
        Assert.Equal("A", firstName);
        Assert.Equal("Student", role);
    }

    [Fact]
    public void Profile_StudentNotFound_Returns404()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetStudentByEmail("e@e.com")).Returns((Student?)null);
        var controller = new AuthController(repo.Object, CreateAuthHelper());

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "e@e.com"),
            new Claim(ClaimTypes.Role, "Student")
        }, "TestAuth");
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) } };

        var result = controller.GetProfile();

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public void Profile_TeacherSuccess_ReturnsOkPayload()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetTeacherByEmail("t@e.com")).Returns(new Teacher { TeacherId=11, FirstName="T", LastName="R", Email="t@e.com", Active=true });
        var controller = new AuthController(repo.Object, CreateAuthHelper());

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "t@e.com"),
            new Claim(ClaimTypes.Role, "Teacher"),
            new Claim("teacherId", "11"),
        }, "TestAuth");
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) } };

        var result = controller.GetProfile();

        var ok = Assert.IsType<OkObjectResult>(result);
        var val = ok.Value!;
        int id = (int)val.GetType().GetProperty("id")!.GetValue(val)!;
        string role = (string)val.GetType().GetProperty("role")!.GetValue(val)!;
        Assert.Equal(11, id);
        Assert.Equal("Teacher", role);
    }

    [Fact]
    public void Profile_TeacherNotFound_Returns404()
    {
        var repo = new Mock<IAuthRepository>();
        repo.Setup(r => r.GetTeacherByEmail("t@e.com")).Returns((Teacher?)null);
        var controller = new AuthController(repo.Object, CreateAuthHelper());

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "t@e.com"),
            new Claim(ClaimTypes.Role, "Teacher")
        }, "TestAuth");
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) } };

        var result = controller.GetProfile();

        Assert.IsType<NotFoundObjectResult>(result);
    }
}