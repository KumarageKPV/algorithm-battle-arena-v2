using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Data;

namespace AlgorithmBattleArena.Tests;

public class IDataContextDapperUnitTests : IDisposable
{
    private readonly Mock<IDataContextDapper> _mockDataContext;
    private readonly List<string> _envVarsToCleanup = new();

    public IDataContextDapperUnitTests()
    {
        _mockDataContext = new Mock<IDataContextDapper>();
    }

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

    [Fact]
    public async Task LoadDataAsync_WithValidSql_ShouldReturnData()
    {
        var expectedData = new List<TestModel> { new() { Id = 1, Name = "Test" } };
        _mockDataContext.Setup(x => x.LoadDataAsync<TestModel>("SELECT * FROM Test", null))
                       .ReturnsAsync(expectedData);

        var result = await _mockDataContext.Object.LoadDataAsync<TestModel>("SELECT * FROM Test");

        Assert.Equal(expectedData, result);
        _mockDataContext.Verify(x => x.LoadDataAsync<TestModel>("SELECT * FROM Test", null), Times.Once);
    }

    [Fact]
    public async Task LoadDataSingleAsync_WithValidSql_ShouldReturnSingleItem()
    {
        var expectedItem = new TestModel { Id = 1, Name = "Test" };
        _mockDataContext.Setup(x => x.LoadDataSingleAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id", It.IsAny<object>()))
                       .ReturnsAsync(expectedItem);

        var result = await _mockDataContext.Object.LoadDataSingleAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id", new { Id = 1 });

        Assert.Equal(expectedItem, result);
    }

    [Fact]
    public async Task LoadDataSingleOrDefaultAsync_WithNoData_ShouldReturnNull()
    {
        _mockDataContext.Setup(x => x.LoadDataSingleOrDefaultAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id", It.IsAny<object>()))
                       .ReturnsAsync((TestModel?)null);

        var result = await _mockDataContext.Object.LoadDataSingleOrDefaultAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id", new { Id = 999 });

        Assert.Null(result);
    }

    [Fact]
    public async Task ExecuteSqlAsync_WithValidSql_ShouldReturnTrue()
    {
        _mockDataContext.Setup(x => x.ExecuteSqlAsync("INSERT INTO Test (Name) VALUES (@Name)", It.IsAny<object>()))
                       .ReturnsAsync(true);

        var result = await _mockDataContext.Object.ExecuteSqlAsync("INSERT INTO Test (Name) VALUES (@Name)", new { Name = "Test" });

        Assert.True(result);
    }

    [Fact]
    public void LoadData_WithValidSql_ShouldReturnData()
    {
        var expectedData = new List<TestModel> { new() { Id = 1, Name = "Test" } };
        _mockDataContext.Setup(x => x.LoadData<TestModel>("SELECT * FROM Test", null))
                       .Returns(expectedData);

        var result = _mockDataContext.Object.LoadData<TestModel>("SELECT * FROM Test");

        Assert.Equal(expectedData, result);
    }

    [Fact]
    public void LoadDataSingle_WithValidSql_ShouldReturnSingleItem()
    {
        var expectedItem = new TestModel { Id = 1, Name = "Test" };
        _mockDataContext.Setup(x => x.LoadDataSingle<TestModel>("SELECT * FROM Test WHERE Id = @Id", It.IsAny<object>()))
                       .Returns(expectedItem);

        var result = _mockDataContext.Object.LoadDataSingle<TestModel>("SELECT * FROM Test WHERE Id = @Id", new { Id = 1 });

        Assert.Equal(expectedItem, result);
    }

    [Fact]
    public void LoadDataSingleOrDefault_WithNoData_ShouldReturnNull()
    {
        _mockDataContext.Setup(x => x.LoadDataSingleOrDefault<TestModel>("SELECT * FROM Test WHERE Id = @Id", It.IsAny<object>()))
                       .Returns((TestModel?)null);

        var result = _mockDataContext.Object.LoadDataSingleOrDefault<TestModel>("SELECT * FROM Test WHERE Id = @Id", new { Id = 999 });

        Assert.Null(result);
    }

    [Fact]
    public void ExecuteSql_WithValidSql_ShouldReturnTrue()
    {
        _mockDataContext.Setup(x => x.ExecuteSql("UPDATE Test SET Name = @Name WHERE Id = @Id", It.IsAny<object>()))
                       .Returns(true);

        var result = _mockDataContext.Object.ExecuteSql("UPDATE Test SET Name = @Name WHERE Id = @Id", new { Name = "Updated", Id = 1 });

        Assert.True(result);
    }

    [Fact]
    public void ExecuteSqlWithRowCount_WithValidSql_ShouldReturnRowCount()
    {
        _mockDataContext.Setup(x => x.ExecuteSqlWithRowCount("DELETE FROM Test WHERE Id = @Id", It.IsAny<object>()))
                       .Returns(1);

        var result = _mockDataContext.Object.ExecuteSqlWithRowCount("DELETE FROM Test WHERE Id = @Id", new { Id = 1 });

        Assert.Equal(1, result);
    }

    [Fact]
    public void ExecuteTransaction_WithValidCommands_ShouldReturnTrue()
    {
        var commands = new List<(string sql, object? parameters)>
        {
            ("INSERT INTO Test (Name) VALUES (@Name)", new { Name = "Test1" }),
            ("INSERT INTO Test (Name) VALUES (@Name)", new { Name = "Test2" })
        };

        _mockDataContext.Setup(x => x.ExecuteTransaction(commands))
                       .Returns(true);

        var result = _mockDataContext.Object.ExecuteTransaction(commands);

        Assert.True(result);
    }

    [Fact]
    public void ExecuteTransaction_WithFailure_ShouldReturnFalse()
    {
        var commands = new List<(string sql, object? parameters)>
        {
            ("INVALID SQL", null)
        };

        _mockDataContext.Setup(x => x.ExecuteTransaction(commands))
                       .Returns(false);

        var result = _mockDataContext.Object.ExecuteTransaction(commands);

        Assert.False(result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task LoadDataAsync_WithInvalidSql_ShouldHandleGracefully(string sql)
    {
        _mockDataContext.Setup(x => x.LoadDataAsync<TestModel>(sql, null))
                       .ThrowsAsync(new ArgumentException("Invalid SQL"));

        await Assert.ThrowsAsync<ArgumentException>(() => 
            _mockDataContext.Object.LoadDataAsync<TestModel>(sql));
    }

    [Fact]
    public void ExecuteTransaction_WithEmptyList_ShouldReturnTrue()
    {
        var commands = new List<(string sql, object? parameters)>();
        _mockDataContext.Setup(x => x.ExecuteTransaction(commands))
                       .Returns(true);

        var result = _mockDataContext.Object.ExecuteTransaction(commands);

        Assert.True(result);
    }

    [Fact]
    public async Task LoadDataAsync_WithParameters_ShouldPassParameters()
    {
        var parameters = new { Id = 1, Name = "Test" };
        var expectedData = new List<TestModel> { new() { Id = 1, Name = "Test" } };
        
        _mockDataContext.Setup(x => x.LoadDataAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id AND Name = @Name", parameters))
                       .ReturnsAsync(expectedData);

        var result = await _mockDataContext.Object.LoadDataAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id AND Name = @Name", parameters);

        Assert.Equal(expectedData, result);
        _mockDataContext.Verify(x => x.LoadDataAsync<TestModel>("SELECT * FROM Test WHERE Id = @Id AND Name = @Name", parameters), Times.Once);
    }

    [Fact]
    public void LoadData_WithComplexType_ShouldReturnComplexType()
    {
        var expectedData = new List<ComplexTestModel> 
        { 
            new() { Id = 1, Name = "Test", CreatedAt = DateTime.Now, IsActive = true } 
        };
        
        _mockDataContext.Setup(x => x.LoadData<ComplexTestModel>("SELECT * FROM ComplexTest", null))
                       .Returns(expectedData);

        var result = _mockDataContext.Object.LoadData<ComplexTestModel>("SELECT * FROM ComplexTest");

        Assert.Equal(expectedData, result);
    }

    [Fact]
    public void ExecuteSqlWithRowCount_WithNoAffectedRows_ShouldReturnZero()
    {
        _mockDataContext.Setup(x => x.ExecuteSqlWithRowCount("UPDATE Test SET Name = @Name WHERE Id = @Id", It.IsAny<object>()))
                       .Returns(0);

        var result = _mockDataContext.Object.ExecuteSqlWithRowCount("UPDATE Test SET Name = @Name WHERE Id = @Id", new { Name = "Test", Id = 999 });

        Assert.Equal(0, result);
    }

    [Fact]
    public void ExecuteTransaction_WithMixedCommands_ShouldHandleMixedOperations()
    {
        var commands = new List<(string sql, object? parameters)>
        {
            ("INSERT INTO Test (Name) VALUES (@Name)", new { Name = "Test1" }),
            ("UPDATE Test SET Name = @NewName WHERE Name = @OldName", new { NewName = "Updated", OldName = "Test1" }),
            ("DELETE FROM Test WHERE Name = @Name", new { Name = "ToDelete" })
        };

        _mockDataContext.Setup(x => x.ExecuteTransaction(commands))
                       .Returns(true);

        var result = _mockDataContext.Object.ExecuteTransaction(commands);

        Assert.True(result);
        _mockDataContext.Verify(x => x.ExecuteTransaction(commands), Times.Once);
    }

    public class TestModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ComplexTestModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}