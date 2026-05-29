using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using AlgorithmBattleArena.Controllers;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Services;
using System.Collections.Generic;

namespace AlgorithmBattleArena.Tests;

public class ProblemsControllerTests
{
    private static ProblemsController CreateController(Mock<IProblemRepository> problemRepoMock)
    {
        var logger = new Mock<ILogger<ProblemsController>>();
        var microCourseService = new Mock<IMicroCourseService>();
        var controller = new ProblemsController(problemRepoMock.Object, logger.Object, microCourseService.Object);

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim(ClaimTypes.Role, "Teacher"),
            new Claim("teacherId", "1"),
        }, "TestAuth");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };

        return controller;
    }

    [Fact]
    public async Task GetProblems_ReturnsPagedList()
    {
        var problemRepo = new Mock<IProblemRepository>();
        var result = new PagedResult<ProblemListDto>
        {
            Items = new List<ProblemListDto> {
                new ProblemListDto { ProblemId=1, Title="A", Category="DP", DifficultyLevel="Easy", CreatedBy="t", CreatedAt=System.DateTime.UtcNow },
                new ProblemListDto { ProblemId=2, Title="B", Category="Graph", DifficultyLevel="Hard", CreatedBy="t", CreatedAt=System.DateTime.UtcNow }
            },
            Total = 2
        };
        problemRepo.Setup(r => r.GetProblems(It.IsAny<ProblemFilterDto>())).ReturnsAsync(result);

        var controller = CreateController(problemRepo);
        var filter = new ProblemFilterDto { Page = 1, PageSize = 10 };
        var actionResult = await controller.GetProblems(filter);

        var ok = Assert.IsType<OkObjectResult>(actionResult);
        var val = ok.Value!;
        int page = (int)val.GetType().GetProperty("page")!.GetValue(val)!;
        int pageSize = (int)val.GetType().GetProperty("pageSize")!.GetValue(val)!;
        int total = (int)val.GetType().GetProperty("total")!.GetValue(val)!;
        var problems = (IEnumerable<ProblemListDto>)val.GetType().GetProperty("problems")!.GetValue(val)!;

        Assert.Equal(1, page);
        Assert.Equal(10, pageSize);
        Assert.Equal(2, total);
        Assert.Collection(problems,
            p => Assert.Equal(1, p.ProblemId),
            p => Assert.Equal(2, p.ProblemId)
        );
    }

    [Fact]
    public async Task GetProblem_NotFound_Returns404()
    {
        var problemRepo = new Mock<IProblemRepository>();
        problemRepo.Setup(r => r.GetProblem(It.IsAny<int>())).ReturnsAsync((ProblemResponseDto)null!);
        var controller = CreateController(problemRepo);

        var result = await controller.GetProblem(123);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetProblem_ReturnsProblem()
    {
        var problemRepo = new Mock<IProblemRepository>();
        var problem = new ProblemResponseDto
        {
            ProblemId = 5,
            Title = "Two Sum",
            Description = "Find pair",
            DifficultyLevel = "Easy",
            Category = "Array"
        };
        problemRepo.Setup(r => r.GetProblem(5)).ReturnsAsync(problem);

        var controller = CreateController(problemRepo);

        var result = await controller.GetProblem(5);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<ProblemResponseDto>(ok.Value);
        Assert.Equal(5, dto.ProblemId);
    }

    [Fact]
    public async Task DeleteProblem_Succeeds_ReturnsOk()
    {
        var problemRepo = new Mock<IProblemRepository>();
        problemRepo.Setup(r => r.DeleteProblem(9)).ReturnsAsync(true);
        var controller = CreateController(problemRepo);

        var result = await controller.DeleteProblem(9);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task DeleteProblem_Fails_Returns500()
    {
        var problemRepo = new Mock<IProblemRepository>();
        problemRepo.Setup(r => r.DeleteProblem(9)).ReturnsAsync(false);
        var controller = CreateController(problemRepo);

        var result = await controller.DeleteProblem(9);

        var obj = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, obj.StatusCode);
    }


}