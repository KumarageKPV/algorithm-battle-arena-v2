using Xunit;
using Microsoft.Extensions.Configuration;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using System.Collections.Generic;

namespace AlgorithmBattleArena.Tests;

public class CompilationTest
{
    [Fact]
    public void AllDtosCompile()
    {
        var filter = new ProblemFilterDto();
        var list = new ProblemListDto();
        var response = new ProblemResponseDto();
        var student = new StudentForRegistrationDto();
        var teacher = new TeacherForRegistrationDto();
        var login = new UserForLoginDto();

        Assert.NotNull(filter);
        Assert.NotNull(list);
        Assert.NotNull(response);
        Assert.NotNull(student);
        Assert.NotNull(teacher);
        Assert.NotNull(login);
    }

    [Fact]
    public void AllModelsCompile()
    {
        var auth = new Auth();
        var student = new Student();
        var teacher = new Teacher();
        var problem = new Problem();
        var testCase = new ProblemTestCase();
        var solution = new ProblemSolution();

        Assert.NotNull(auth);
        Assert.NotNull(student);
        Assert.NotNull(teacher);
        Assert.NotNull(problem);
        Assert.NotNull(testCase);
        Assert.NotNull(solution);
    }

    [Fact]
    public void AuthHelperCompiles()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: false, reloadOnChange: false)
            .Build();

        var helper = new AuthHelper(config);
        Assert.NotNull(helper);
    }
}