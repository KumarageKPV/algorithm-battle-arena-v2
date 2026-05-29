using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;

namespace AlgorithmBattleArena.Tests;

public class StudentRepositoryTests
{
    [Fact]
    public async Task CreateRequest_ReturnsRequestId()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(123);
        var repo = new StudentRepository(dapper.Object);

        var result = await repo.CreateRequest(1, 2);

        Assert.Equal(123, result);
        dapper.Verify(d => d.LoadDataSingleAsync<int>(It.Is<string>(s => s.Contains("INSERT")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task AcceptRequest_ExecutesTransaction()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.ExecuteTransaction(It.IsAny<List<(string, object?)>>()));
        var repo = new StudentRepository(dapper.Object);

        await repo.AcceptRequest(123, 2);

        dapper.Verify(d => d.ExecuteTransaction(It.Is<List<(string, object?)>>(l => l.Count == 2)), Times.Once);
    }

    [Fact]
    public async Task RejectRequest_UpdatesStatus()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(true);
        var repo = new StudentRepository(dapper.Object);

        await repo.RejectRequest(123, 2);

        dapper.Verify(d => d.ExecuteSqlAsync(It.Is<string>(s => s.Contains("Rejected")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetStudentsByStatus_AcceptedStatus_QueriesStudentTable()
    {
        var students = new List<StudentRequestDto> { new() { StudentId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com" } };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<StudentRequestDto>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(students);
        var repo = new StudentRepository(dapper.Object);

        var result = await repo.GetStudentsByStatus(2, "accepted");

        Assert.Single(result);
        dapper.Verify(d => d.LoadDataAsync<StudentRequestDto>(It.Is<string>(s => s.Contains("Student s WHERE s.TeacherId")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetStudentsByStatus_PendingStatus_QueriesWithJoin()
    {
        var students = new List<StudentRequestDto> { new() { RequestId = 123, StudentId = 1, FirstName = "Jane", LastName = "Smith", Email = "jane@test.com" } };
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<StudentRequestDto>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(students);
        var repo = new StudentRepository(dapper.Object);

        var result = await repo.GetStudentsByStatus(2, "pending");

        Assert.Single(result);
        dapper.Verify(d => d.LoadDataAsync<StudentRequestDto>(It.Is<string>(s => s.Contains("JOIN")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetStudentsByStatus_AcceptedCaseInsensitive_QueriesStudentTable()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<StudentRequestDto>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(new List<StudentRequestDto>());
        var repo = new StudentRepository(dapper.Object);

        await repo.GetStudentsByStatus(2, "ACCEPTED");

        dapper.Verify(d => d.LoadDataAsync<StudentRequestDto>(It.Is<string>(s => s.Contains("Student s WHERE s.TeacherId")), It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task GetStudentsByStatus_RejectedStatus_QueriesWithJoin()
    {
        var dapper = new Mock<IDataContextDapper>();
        dapper.Setup(d => d.LoadDataAsync<StudentRequestDto>(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(new List<StudentRequestDto>());
        var repo = new StudentRepository(dapper.Object);

        await repo.GetStudentsByStatus(2, "rejected");

        dapper.Verify(d => d.LoadDataAsync<StudentRequestDto>(It.Is<string>(s => s.Contains("JOIN") && s.Contains("Status")), It.IsAny<object>()), Times.Once);
    }
}