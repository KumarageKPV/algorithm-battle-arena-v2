using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;

namespace AlgorithmBattleArena.Tests;

public class DataContextEFTests : IDisposable
{
    private readonly DataContextEF _context;
    private readonly IConfiguration _config;

    public DataContextEFTests()
    {
        var configBuilder = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=localhost;Database=TestDB;Trusted_Connection=True;"
            });
        _config = configBuilder.Build();

        var options = new DbContextOptionsBuilder<DataContextEF>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TestDataContextEF(_config, options);
    }

    [Fact]
    public void Constructor_SetsConfiguration()
    {
        var context = new DataContextEF(_config);
        
        Assert.NotNull(context);
    }

    [Fact]
    public void DbSets_AreInitialized()
    {
        Assert.NotNull(_context.Student);
        Assert.NotNull(_context.Teachers);
        Assert.NotNull(_context.Auth);
    }

    [Fact]
    public async Task CanAddAndRetrieveAuth()
    {
        var auth = new Auth
        {
            Email = "test@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        _context.Auth.Add(auth);
        await _context.SaveChangesAsync();

        var retrieved = await _context.Auth.FindAsync("test@example.com");
        
        Assert.NotNull(retrieved);
        Assert.Equal("test@example.com", retrieved.Email);
        Assert.Equal(new byte[] { 1, 2, 3 }, retrieved.PasswordHash);
        Assert.Equal(new byte[] { 4, 5, 6 }, retrieved.PasswordSalt);
    }

    [Fact]
    public async Task CanAddAndRetrieveStudent()
    {
        var auth = new Auth
        {
            Email = "student@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        var student = new Student
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "student@example.com",
            Active = true
        };

        _context.Auth.Add(auth);
        _context.Student.Add(student);
        await _context.SaveChangesAsync();

        var retrieved = await _context.Student
            .Include(s => s.Auth)
            .FirstOrDefaultAsync(s => s.Email == "student@example.com");
        
        Assert.NotNull(retrieved);
        Assert.Equal("John", retrieved.FirstName);
        Assert.Equal("Doe", retrieved.LastName);
        Assert.Equal("student@example.com", retrieved.Email);
        Assert.True(retrieved.Active);
        Assert.NotNull(retrieved.Auth);
        Assert.Equal("John Doe", retrieved.FullName);
    }

    [Fact]
    public async Task CanAddAndRetrieveTeacher()
    {
        var auth = new Auth
        {
            Email = "teacher@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        var teacher = new Teacher
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "teacher@example.com",
            Active = true
        };

        _context.Auth.Add(auth);
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        var retrieved = await _context.Teachers
            .Include(t => t.Auth)
            .FirstOrDefaultAsync(t => t.Email == "teacher@example.com");
        
        Assert.NotNull(retrieved);
        Assert.Equal("Jane", retrieved.FirstName);
        Assert.Equal("Smith", retrieved.LastName);
        Assert.Equal("teacher@example.com", retrieved.Email);
        Assert.True(retrieved.Active);
        Assert.NotNull(retrieved.Auth);
        Assert.Equal("Jane Smith", retrieved.FullName);
    }

    [Fact]
    public async Task StudentTeacherRelationship_WorksCorrectly()
    {
        var teacherAuth = new Auth
        {
            Email = "teacher@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        var studentAuth = new Auth
        {
            Email = "student@example.com",
            PasswordHash = new byte[] { 7, 8, 9 },
            PasswordSalt = new byte[] { 10, 11, 12 }
        };

        var teacher = new Teacher
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "teacher@example.com",
            Active = true
        };

        _context.Auth.AddRange(teacherAuth, studentAuth);
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        var student = new Student
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "student@example.com",
            TeacherId = teacher.TeacherId,
            Active = true
        };

        _context.Student.Add(student);
        await _context.SaveChangesAsync();

        var retrievedTeacher = await _context.Teachers
            .Include(t => t.Students)
            .FirstOrDefaultAsync(t => t.TeacherId == teacher.TeacherId);

        var retrievedStudent = await _context.Student
            .Include(s => s.Teacher)
            .FirstOrDefaultAsync(s => s.StudentId == student.StudentId);

        Assert.NotNull(retrievedTeacher);
        Assert.Single(retrievedTeacher.Students);
        Assert.Equal("John", retrievedTeacher.Students.First().FirstName);

        Assert.NotNull(retrievedStudent);
        Assert.NotNull(retrievedStudent.Teacher);
        Assert.Equal("Jane", retrievedStudent.Teacher.FirstName);
    }

    [Fact]
    public async Task DeleteTeacher_SetsStudentTeacherIdToNull()
    {
        var teacherAuth = new Auth
        {
            Email = "teacher@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        var studentAuth = new Auth
        {
            Email = "student@example.com",
            PasswordHash = new byte[] { 7, 8, 9 },
            PasswordSalt = new byte[] { 10, 11, 12 }
        };

        var teacher = new Teacher
        {
            FirstName = "Jane",
            LastName = "Smith",
            Email = "teacher@example.com",
            Active = true
        };

        _context.Auth.AddRange(teacherAuth, studentAuth);
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        var student = new Student
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "student@example.com",
            TeacherId = teacher.TeacherId,
            Active = true
        };

        _context.Student.Add(student);
        await _context.SaveChangesAsync();

        _context.Teachers.Remove(teacher);
        await _context.SaveChangesAsync();

        var retrievedStudent = await _context.Student.FindAsync(student.StudentId);
        Assert.NotNull(retrievedStudent);
        Assert.Null(retrievedStudent.TeacherId);
    }

    [Fact]
    public async Task CanUpdateStudent()
    {
        var auth = new Auth
        {
            Email = "student@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        var student = new Student
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "student@example.com",
            Active = true
        };

        _context.Auth.Add(auth);
        _context.Student.Add(student);
        await _context.SaveChangesAsync();

        student.FirstName = "Jane";
        student.Active = false;
        await _context.SaveChangesAsync();

        var retrieved = await _context.Student.FindAsync(student.StudentId);
        Assert.NotNull(retrieved);
        Assert.Equal("Jane", retrieved.FirstName);
        Assert.False(retrieved.Active);
    }

    [Fact]
    public async Task CanDeleteStudent()
    {
        var auth = new Auth
        {
            Email = "student@example.com",
            PasswordHash = new byte[] { 1, 2, 3 },
            PasswordSalt = new byte[] { 4, 5, 6 }
        };

        var student = new Student
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "student@example.com",
            Active = true
        };

        _context.Auth.Add(auth);
        _context.Student.Add(student);
        await _context.SaveChangesAsync();

        var studentId = student.StudentId;
        _context.Student.Remove(student);
        await _context.SaveChangesAsync();

        var retrieved = await _context.Student.FindAsync(studentId);
        Assert.Null(retrieved);
    }

    [Fact]
    public void ModelBuilder_ConfiguresCorrectSchema()
    {
        var model = _context.Model;
        var authEntity = model.FindEntityType(typeof(Auth));
        var studentEntity = model.FindEntityType(typeof(Student));
        var teacherEntity = model.FindEntityType(typeof(Teacher));

        Assert.Equal("AlgorithmBattleArinaSchema", authEntity?.GetSchema());
        Assert.Equal("AlgorithmBattleArinaSchema", studentEntity?.GetSchema());
        Assert.Equal("AlgorithmBattleArinaSchema", teacherEntity?.GetSchema());
    }

    [Fact]
    public void ModelBuilder_ConfiguresCorrectTableNames()
    {
        var model = _context.Model;
        var authEntity = model.FindEntityType(typeof(Auth));
        var studentEntity = model.FindEntityType(typeof(Student));
        var teacherEntity = model.FindEntityType(typeof(Teacher));

        Assert.Equal("Auth", authEntity?.GetTableName());
        Assert.Equal("Student", studentEntity?.GetTableName());
        Assert.Equal("Teachers", teacherEntity?.GetTableName());
    }

    [Fact]
    public void ModelBuilder_ConfiguresCorrectPrimaryKeys()
    {
        var model = _context.Model;
        var authEntity = model.FindEntityType(typeof(Auth));
        var studentEntity = model.FindEntityType(typeof(Student));
        var teacherEntity = model.FindEntityType(typeof(Teacher));

        Assert.Equal("Email", authEntity?.FindPrimaryKey()?.Properties.First().Name);
        Assert.Equal("StudentId", studentEntity?.FindPrimaryKey()?.Properties.First().Name);
        Assert.Equal("TeacherId", teacherEntity?.FindPrimaryKey()?.Properties.First().Name);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private class TestDataContextEF : DataContextEF
    {
        private readonly DbContextOptions<DataContextEF> _options;

        public TestDataContextEF(IConfiguration config, DbContextOptions<DataContextEF> options) 
            : base(config)
        {
            _options = options;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString());
        }
    }


}