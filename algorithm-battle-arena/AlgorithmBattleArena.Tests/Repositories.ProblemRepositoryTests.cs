using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Helpers;
using Dapper;

namespace AlgorithmBattleArena.Tests;

public class ProblemRepositoryTests
{
    [Fact]
    public async Task UpsertProblem_ReturnsId()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(123);
        var repo = new ProblemRepository(dapper.Object);
        var dto = new ProblemUpsertDto { Title = "Test", Description = "Desc", DifficultyLevel = "Easy", Category = "Array", TimeLimit = 1000, MemoryLimit = 256, CreatedBy = "user", Tags = "tag", TestCases = "cases", Solutions = "sol" };

        var result = await repo.UpsertProblem(dto);

        Assert.Equal(123, result);
    }

    [Fact]
    public async Task GetProblems_NoFilters_ReturnsPagedResult()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(5);
        dapper.Setup(d => d.LoadDataAsync<ProblemListDto>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(new List<ProblemListDto>());
        var repo = new ProblemRepository(dapper.Object);
        var filter = new ProblemFilterDto { Page = 1, PageSize = 10 };

        var result = await repo.GetProblems(filter);

        Assert.Equal(5, result.Total);
        Assert.NotNull(result.Items);
    }

    [Fact]
    public async Task GetProblems_WithFilters_BuildsWhereClause()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(0);
        dapper.Setup(d => d.LoadDataAsync<ProblemListDto>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(new List<ProblemListDto>());
        var repo = new ProblemRepository(dapper.Object);
        var filter = new ProblemFilterDto { Category = "Array", DifficultyLevel = "Easy", SearchTerm = "test" };

        await repo.GetProblems(filter);

        dapper.Verify(d => d.LoadDataSingleAsync<int>(It.Is<string>(s => s.Contains("WHERE")), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task GetProblem_Exists_ReturnsDto()
    {
        var problem = new Problem { ProblemId = 1, Title = "Test", Description = "Desc", DifficultyLevel = "Easy", Category = "Array", TimeLimit = 1000, MemoryLimit = 256, CreatedBy = "user", Tags = "tag" };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Problem>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(problem);
        dapper.Setup(d => d.LoadDataAsync<ProblemTestCase>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(new List<ProblemTestCase>());
        dapper.Setup(d => d.LoadDataAsync<ProblemSolution>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(new List<ProblemSolution>());
        var repo = new ProblemRepository(dapper.Object);

        var result = await repo.GetProblem(1);

        Assert.NotNull(result);
        Assert.Equal(1, result.ProblemId);
        Assert.Equal("Test", result.Title);
    }

    [Fact]
    public async Task GetProblem_NotExists_ReturnsNull()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleOrDefaultAsync<Problem>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync((Problem?)null);
        var repo = new ProblemRepository(dapper.Object);

        var result = await repo.GetProblem(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteProblem_ReturnsTrue()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(true);
        var repo = new ProblemRepository(dapper.Object);

        var result = await repo.DeleteProblem(1);

        Assert.True(result);
    }

    [Fact]
    public async Task GetCategories_ReturnsDistinctCategories()
    {
        var categories = new List<string> { "Array", "String", "Graph" };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<string>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(categories);
        var repo = new ProblemRepository(dapper.Object);

        var result = await repo.GetCategories();

        Assert.Equal(3, result.Count());
        Assert.Contains("Array", result);
    }

    [Fact]
    public async Task GetDifficultyLevels_ReturnsDistinctLevels()
    {
        var levels = new List<string> { "Easy", "Medium", "Hard" };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<string>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(levels);
        var repo = new ProblemRepository(dapper.Object);

        var result = await repo.GetDifficultyLevels();

        Assert.Equal(3, result.Count());
        Assert.Contains("Easy", result);
    }

    [Fact]
    public async Task GetRandomProblems_WithMixedDifficulty_ReturnsProblems()
    {
        var problems = new List<Problem> { new() { ProblemId = 1, Title = "Test", Description = "Desc", DifficultyLevel = "Easy", Category = "Array", TimeLimit = 1000, MemoryLimit = 256, CreatedBy = "user", Tags = "tag" } };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<Problem>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(problems);
        var repo = new ProblemRepository(dapper.Object);

        var result = await repo.GetRandomProblems("C#", "Mixed", 5);

        Assert.Single(result);
    }

    [Fact]
    public async Task GetRandomProblems_WithSpecificDifficulty_AddsWhereClause()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<Problem>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(new List<Problem>());
        var repo = new ProblemRepository(dapper.Object);

        await repo.GetRandomProblems("C#", "Easy", 5);

        dapper.Verify(d => d.LoadDataAsync<Problem>(It.Is<string>(s => s.Contains("DifficultyLevel")), It.IsAny<DynamicParameters>()), Times.Once);
    }
}