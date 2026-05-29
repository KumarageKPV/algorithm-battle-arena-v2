using Xunit;
using Moq;
using System.Threading.Tasks;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using Dapper;

namespace AlgorithmBattleArena.Tests;

public class SubmissionRepositoryTests
{
    [Fact]
    public async Task CreateSubmission_ReturnsSubmissionId()
    {
        var submission = new Submission
        {
            MatchId = 1,
            ProblemId = 2,
            ParticipantEmail = "test@example.com",
            Language = "C#",
            Code = "Console.WriteLine(\"Hello World\");",
            Status = "Pending"
        };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(123);
        var repo = new SubmissionRepository(dapper.Object);

        var result = await repo.CreateSubmission(submission);

        Assert.Equal(123, result);
        dapper.Verify(d => d.LoadDataSingleAsync<int>(It.Is<string>(s => s.Contains("INSERT")), It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task CreateSubmission_CallsCorrectSqlWithParameters()
    {
        var submission = new Submission
        {
            MatchId = 5,
            ProblemId = 10,
            ParticipantEmail = "user@test.com",
            Language = "Python",
            Code = "print('test')",
            Status = "Submitted"
        };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(456);
        var repo = new SubmissionRepository(dapper.Object);

        await repo.CreateSubmission(submission);

        dapper.Verify(d => d.LoadDataSingleAsync<int>(
            It.Is<string>(s => s.Contains("INSERT INTO AlgorithmBattleArinaSchema.Submissions") && s.Contains("SCOPE_IDENTITY")),
            It.IsAny<DynamicParameters>()), Times.Once);
    }

    [Fact]
    public async Task CreateSubmission_WithEmptyCode_StillExecutes()
    {
        var submission = new Submission
        {
            MatchId = 1,
            ProblemId = 1,
            ParticipantEmail = "empty@test.com",
            Language = "Java",
            Code = "",
            Status = "Draft"
        };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<DynamicParameters>())).ReturnsAsync(789);
        var repo = new SubmissionRepository(dapper.Object);

        var result = await repo.CreateSubmission(submission);

        Assert.Equal(789, result);
    }
}