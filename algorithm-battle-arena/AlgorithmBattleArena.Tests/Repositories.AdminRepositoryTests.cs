using Xunit;
using Moq;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Tests;

public class AdminRepositoryTests
{
    private readonly Mock<IDataContextDapper> _mockDapper;
    private readonly AdminRepository _repository;

    public AdminRepositoryTests()
    {
        _mockDapper = new Mock<IDataContextDapper>();
        _repository = new AdminRepository(_mockDapper.Object);
    }

    [Fact]
    public async Task GetUsersAsync_WithNoFilters_ReturnsAllUsers()
    {
        // Arrange
            var students = new List<dynamic>
            {
                CreateStudentDynamic(1, "John", "Doe", "john@test.com", true)
            };
            var teachers = new List<dynamic>
            {
                CreateTeacherDynamic(1, "Jane", "Smith", "jane@test.com", true)
            };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.Is<string>(s => s.Contains("COUNT(*)")), It.IsAny<object>()))
            .ReturnsAsync(1);
        _mockDapper.Setup(d => d.LoadDataAsync<dynamic>(It.Is<string>(s => s.Contains("Student")), It.IsAny<object>()))
            .ReturnsAsync(students);
        _mockDapper.Setup(d => d.LoadDataAsync<dynamic>(It.Is<string>(s => s.Contains("Teachers")), It.IsAny<object>()))
            .ReturnsAsync(teachers);

        // Act
        var result = await _repository.GetUsersAsync(null, null, 1, 10);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Total);
        Assert.Equal(2, result.Items.Count());
        Assert.Contains(result.Items, u => u.Role == "Student");
        Assert.Contains(result.Items, u => u.Role == "Teacher");
    }

    [Fact]
    public async Task GetUsersAsync_WithSearchQuery_FiltersResults()
    {
        // Arrange
            var students = new List<dynamic>
            {
                CreateStudentDynamic(1, "John", "Doe", "john@test.com", true)
            };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(1);
        _mockDapper.Setup(d => d.LoadDataAsync<dynamic>(It.Is<string>(s => s.Contains("Student")), It.IsAny<object>()))
            .ReturnsAsync(students);
        _mockDapper.Setup(d => d.LoadDataAsync<dynamic>(It.Is<string>(s => s.Contains("Teachers")), It.IsAny<object>()))
            .ReturnsAsync(new List<dynamic>());

        // Act
        var result = await _repository.GetUsersAsync("john", null, 1, 10);

        // Assert
        Assert.NotNull(result);
        _mockDapper.Verify(d => d.LoadDataAsync<dynamic>(
            It.Is<string>(s => s.Contains("LIKE @Search")), 
            It.IsAny<object>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task GetUsersAsync_WithRoleFilter_ReturnsOnlyStudents()
    {
        // Arrange
            var students = new List<dynamic>
            {
                CreateStudentDynamic(1, "John", "Doe", "john@test.com", true)
            };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(1);
        _mockDapper.Setup(d => d.LoadDataAsync<dynamic>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(students);

        // Act
        var result = await _repository.GetUsersAsync(null, "Student", 1, 10);

        // Assert
        Assert.NotNull(result);
        Assert.All(result.Items, u => Assert.Equal("Student", u.Role));
        _mockDapper.Verify(d => d.LoadDataAsync<dynamic>(
            It.Is<string>(s => s.Contains("Student") && !s.Contains("Teachers")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task ToggleUserActiveAsync_WithValidStudentId_UpdatesAndReturns()
    {
        // Arrange
            var studentData = CreateStudentDynamic(1, "John", "Doe", "john@test.com", false);

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<dynamic>(
            It.Is<string>(s => s.Contains("UPDATE") && s.Contains("Student")), 
            It.IsAny<object>()))
            .ReturnsAsync((object)studentData);

        // Act
        var result = await _repository.ToggleUserActiveAsync("Student:1", true);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Student:1", result.Id);
        Assert.Equal("John Doe", result.Name);
        Assert.False(result.IsActive);
        _mockDapper.Verify(d => d.LoadDataSingleOrDefaultAsync<dynamic>(
            It.Is<string>(s => s.Contains("UPDATE")), 
            It.IsAny<object>()), Times.Once);
    }

    [Fact]
    public async Task ToggleUserActiveAsync_WithValidTeacherId_UpdatesAndReturns()
    {
        // Arrange
            var teacherData = CreateTeacherDynamic(1, "Jane", "Smith", "jane@test.com", true);

        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<dynamic>(
            It.Is<string>(s => s.Contains("UPDATE") && s.Contains("Teachers")), 
            It.IsAny<object>()))
            .ReturnsAsync((object)teacherData);

        // Act
        var result = await _repository.ToggleUserActiveAsync("Teacher:1", false);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Teacher:1", result.Id);
        Assert.Equal("Jane Smith", result.Name);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task ToggleUserActiveAsync_WithInvalidId_ReturnsNull()
    {
        // Act
        var result = await _repository.ToggleUserActiveAsync("InvalidId", true);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task ToggleUserActiveAsync_WithNonExistentUser_ReturnsNull()
    {
        // Arrange
        _mockDapper.Setup(d => d.LoadDataSingleOrDefaultAsync<dynamic>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync((object?)null);

        // Act
        var result = await _repository.ToggleUserActiveAsync("Student:999", true);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetUsersAsync_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
            var students = new List<dynamic>
            {
                CreateStudentDynamic(1, "John", "Doe", "john@test.com", true)
            };

        _mockDapper.Setup(d => d.LoadDataSingleAsync<int>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(10);
        _mockDapper.Setup(d => d.LoadDataAsync<dynamic>(It.IsAny<string>(), It.IsAny<object>()))
            .ReturnsAsync(students);

        // Act
        var result = await _repository.GetUsersAsync(null, "Student", 2, 5);

        // Assert
        Assert.NotNull(result);
        _mockDapper.Verify(d => d.LoadDataAsync<dynamic>(
            It.Is<string>(s => s.Contains("OFFSET") && s.Contains("FETCH NEXT")), 
            It.Is<object>(p => p != null)), Times.Once);
    }

    private static dynamic CreateStudentDynamic(int id, string first, string last, string email, bool active)
        {
            var expando = new System.Dynamic.ExpandoObject() as IDictionary<string, object?>;
            expando["StudentId"] = id;
            expando["FirstName"] = first;
            expando["LastName"] = last;
            expando["Email"] = email;
            expando["Active"] = active;
            return (dynamic)expando;
        }

        private static dynamic CreateTeacherDynamic(int id, string first, string last, string email, bool active)
        {
            var expando = new System.Dynamic.ExpandoObject() as IDictionary<string, object?>;
            expando["TeacherId"] = id;
            expando["FirstName"] = first;
            expando["LastName"] = last;
            expando["Email"] = email;
            expando["Active"] = active;
            return (dynamic)expando;
        }
}
