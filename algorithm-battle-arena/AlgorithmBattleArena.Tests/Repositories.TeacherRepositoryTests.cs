using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Tests;

public class TeacherRepositoryTests
{
    [Fact]
    public async Task GetTeachers_ReturnsTeachers()
    {
        var teachers = new List<Teacher>
        {
            new() { TeacherId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com", Active = true },
            new() { TeacherId = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@test.com", Active = true }
        };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<Teacher>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(teachers);
        var repo = new TeacherRepository(dapper.Object);

        var result = await repo.GetTeachers();

        Assert.Equal(2, result.Count());
        dapper.Verify(d => d.LoadDataAsync<Teacher>(It.Is<string>(s => s.Contains("Teachers")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetTeachers_EmptyResult_ReturnsEmpty()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<Teacher>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(new List<Teacher>());
        var repo = new TeacherRepository(dapper.Object);

        var result = await repo.GetTeachers();

        Assert.Empty(result);
    }
}