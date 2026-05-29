using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Tests;

public class StudentsControllerTests
{
    private static AuthHelper CreateAuthHelper()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();
        return new AuthHelper(config);
    }

    private static StudentsController CreateController(Mock<IStudentRepository> repo, ClaimsPrincipal? user = null)
    {
        var controller = new StudentsController(repo.Object, CreateAuthHelper());
        if (user != null)
        {
            controller.ControllerContext = new ControllerContext 
            { 
                HttpContext = new DefaultHttpContext { User = user } 
            };
        }
        return controller;
    }

    private static ClaimsPrincipal CreateStudentUser(int studentId = 1)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "student@test.com"),
            new Claim(ClaimTypes.Role, "Student"),
            new Claim("studentId", studentId.ToString()),
        }, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    private static ClaimsPrincipal CreateTeacherUser(int teacherId = 1)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "teacher@test.com"),
            new Claim(ClaimTypes.Role, "Teacher"),
            new Claim("teacherId", teacherId.ToString()),
        }, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task RequestTeacher_ValidStudent_ReturnsOkWithRequestId()
    {
        var repo = new Mock<IStudentRepository>();
        repo.Setup(r => r.CreateRequest(1, 2)).ReturnsAsync(123);
        var controller = CreateController(repo, CreateStudentUser(1));

        var result = await controller.RequestTeacher(2);

        var ok = Assert.IsType<OkObjectResult>(result);
        var value = ok.Value;
        Assert.NotNull(value);
        var requestId = (int)value.GetType().GetProperty("RequestId")!.GetValue(value)!;
        Assert.Equal(123, requestId);
    }

    [Fact]
    public async Task RequestTeacher_NoStudentClaims_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, new ClaimsPrincipal(new ClaimsIdentity()));

        var result = await controller.RequestTeacher(2);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a student", unauthorized.Value);
    }

    [Fact]
    public async Task RequestTeacher_TeacherUser_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, CreateTeacherUser(1));

        var result = await controller.RequestTeacher(2);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a student", unauthorized.Value);
    }

    [Fact]
    public async Task AcceptRequest_ValidTeacher_ReturnsOk()
    {
        var repo = new Mock<IStudentRepository>();
        repo.Setup(r => r.AcceptRequest(123, 1)).Returns(Task.CompletedTask);
        var controller = CreateController(repo, CreateTeacherUser(1));

        var result = await controller.AcceptRequest(123);

        Assert.IsType<OkResult>(result);
        repo.Verify(r => r.AcceptRequest(123, 1), Times.Once);
    }

    [Fact]
    public async Task AcceptRequest_NoTeacherClaims_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, new ClaimsPrincipal(new ClaimsIdentity()));

        var result = await controller.AcceptRequest(123);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a teacher", unauthorized.Value);
    }

    [Fact]
    public async Task AcceptRequest_StudentUser_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, CreateStudentUser(1));

        var result = await controller.AcceptRequest(123);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a teacher", unauthorized.Value);
    }

    [Fact]
    public async Task RejectRequest_ValidTeacher_ReturnsOk()
    {
        var repo = new Mock<IStudentRepository>();
        repo.Setup(r => r.RejectRequest(123, 1)).Returns(Task.CompletedTask);
        var controller = CreateController(repo, CreateTeacherUser(1));

        var result = await controller.RejectRequest(123);

        Assert.IsType<OkResult>(result);
        repo.Verify(r => r.RejectRequest(123, 1), Times.Once);
    }

    [Fact]
    public async Task RejectRequest_NoTeacherClaims_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, new ClaimsPrincipal(new ClaimsIdentity()));

        var result = await controller.RejectRequest(123);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a teacher", unauthorized.Value);
    }

    [Fact]
    public async Task RejectRequest_StudentUser_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, CreateStudentUser(1));

        var result = await controller.RejectRequest(123);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a teacher", unauthorized.Value);
    }

    [Fact]
    public async Task GetStudents_ValidTeacher_ReturnsOkWithStudents()
    {
        var students = new List<StudentRequestDto>
        {
            new() { RequestId = 1, StudentId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", Username = "john" },
            new() { RequestId = 2, StudentId = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@test.com", Username = "jane" }
        };
        var repo = new Mock<IStudentRepository>();
        repo.Setup(r => r.GetStudentsByStatus(1, "pending")).ReturnsAsync(students);
        var controller = CreateController(repo, CreateTeacherUser(1));

        var result = await controller.GetStudents("pending");

        var ok = Assert.IsType<OkObjectResult>(result);
        var returnedStudents = Assert.IsAssignableFrom<IEnumerable<StudentRequestDto>>(ok.Value);
        Assert.Equal(2, returnedStudents.Count());
    }

    [Fact]
    public async Task GetStudents_NoTeacherClaims_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, new ClaimsPrincipal(new ClaimsIdentity()));

        var result = await controller.GetStudents("pending");

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a teacher", unauthorized.Value);
    }

    [Fact]
    public async Task GetStudents_StudentUser_ReturnsUnauthorized()
    {
        var repo = new Mock<IStudentRepository>();
        var controller = CreateController(repo, CreateStudentUser(1));

        var result = await controller.GetStudents("pending");

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("User not found or not a teacher", unauthorized.Value);
    }

    [Fact]
    public async Task GetStudents_EmptyStatus_CallsRepositoryWithEmptyStatus()
    {
        var repo = new Mock<IStudentRepository>();
        repo.Setup(r => r.GetStudentsByStatus(1, "")).ReturnsAsync(new List<StudentRequestDto>());
        var controller = CreateController(repo, CreateTeacherUser(1));

        var result = await controller.GetStudents("");

        Assert.IsType<OkObjectResult>(result);
        repo.Verify(r => r.GetStudentsByStatus(1, ""), Times.Once);
    }

    [Fact]
    public async Task GetStudents_NullStatus_CallsRepositoryWithNullStatus()
    {
        var repo = new Mock<IStudentRepository>();
        repo.Setup(r => r.GetStudentsByStatus(1, null!)).ReturnsAsync(new List<StudentRequestDto>());
        var controller = CreateController(repo, CreateTeacherUser(1));

        var result = await controller.GetStudents(null!);

        Assert.IsType<OkObjectResult>(result);
        repo.Verify(r => r.GetStudentsByStatus(1, null!), Times.Once);
    }
}