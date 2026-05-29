using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Tests;

public class TeachersControllerTests
{
    [Fact]
    public async Task GetTeachers_ReturnsOkWithTeachers()
    {
        var teachers = new List<Teacher>
        {
            new() { TeacherId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", Active = true },
            new() { TeacherId = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@test.com", Active = true }
        };
        var repo = new Mock<ITeacherRepository>();
        repo.Setup(r => r.GetTeachers()).ReturnsAsync(teachers);
        var controller = new TeachersController(repo.Object);

        var result = await controller.GetTeachers();

        var ok = Assert.IsType<OkObjectResult>(result);
        var returnedTeachers = Assert.IsAssignableFrom<IEnumerable<Teacher>>(ok.Value);
        Assert.Equal(2, returnedTeachers.Count());
    }

    [Fact]
    public async Task GetTeachers_EmptyList_ReturnsOkWithEmptyList()
    {
        var repo = new Mock<ITeacherRepository>();
        repo.Setup(r => r.GetTeachers()).ReturnsAsync(new List<Teacher>());
        var controller = new TeachersController(repo.Object);

        var result = await controller.GetTeachers();

        var ok = Assert.IsType<OkObjectResult>(result);
        var returnedTeachers = Assert.IsAssignableFrom<IEnumerable<Teacher>>(ok.Value);
        Assert.Empty(returnedTeachers);
    }

    [Fact]
    public async Task GetTeachers_CallsRepositoryOnce()
    {
        var repo = new Mock<ITeacherRepository>();
        repo.Setup(r => r.GetTeachers()).ReturnsAsync(new List<Teacher>());
        var controller = new TeachersController(repo.Object);

        await controller.GetTeachers();

        repo.Verify(r => r.GetTeachers(), Times.Once);
    }
}