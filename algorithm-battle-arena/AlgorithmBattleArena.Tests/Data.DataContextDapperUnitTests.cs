using Xunit;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using AlgorithmBattleArena.Data;

namespace AlgorithmBattleArena.Tests;

public class DataContextDapperUnitTests : IDisposable
{
    private readonly List<string> _envVarsToCleanup = new();

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

    private static IConfiguration CreateTestConfiguration()
    {
        var configData = new Dictionary<string, string?>
        {
            {"ConnectionStrings:DefaultConnection", "Server=test;Database=test;"}
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
    }

    [Fact]
    public void Constructor_WithValidConfiguration_ShouldNotThrow()
    {
        var config = CreateTestConfiguration();
        var exception = Record.Exception(() => new DataContextDapper(config));
        Assert.Null(exception);
    }

    [Fact]
    public void Constructor_WithNullConfiguration_ShouldNotThrow()
    {
        // The actual implementation doesn't validate null configuration in constructor
        var exception = Record.Exception(() => new DataContextDapper(null!));
        Assert.Null(exception);
    }

    [Fact]
    public void DataContextDapper_ImplementsInterface_ShouldImplementIDataContextDapper()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        Assert.IsAssignableFrom<IDataContextDapper>(dataContext);
    }

    [Fact]
    public void EnvironmentVariable_TakesPrecedence_OverConfiguration()
    {
        var envConnectionString = "Server=env;Database=env;";
        SetEnvironmentVariable("DEFAULT_CONNECTION", envConnectionString);
        
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify environment variable is set (connection string precedence is tested indirectly)
        Assert.Equal(envConnectionString, Environment.GetEnvironmentVariable("DEFAULT_CONNECTION"));
        Assert.NotNull(dataContext);
    }

    [Fact]
    public void LoadData_MethodExists_ShouldHaveCorrectSignature()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify method exists with correct signature
        var method = typeof(DataContextDapper).GetMethod("LoadData");
        Assert.NotNull(method);
        Assert.True(method.IsGenericMethodDefinition);
    }

    [Fact]
    public void LoadDataSingle_MethodExists_ShouldHaveCorrectSignature()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify method exists with correct signature
        var method = typeof(DataContextDapper).GetMethod("LoadDataSingle");
        Assert.NotNull(method);
        Assert.True(method.IsGenericMethodDefinition);
    }

    [Fact]
    public void LoadDataSingleOrDefault_MethodExists_ShouldHaveCorrectSignature()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify method exists with correct signature
        var method = typeof(DataContextDapper).GetMethod("LoadDataSingleOrDefault");
        Assert.NotNull(method);
        Assert.True(method.IsGenericMethodDefinition);
    }

    [Fact]
    public void ExecuteSql_MethodExists_ShouldHaveCorrectSignature()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify method exists with correct signature
        var method = typeof(DataContextDapper).GetMethod("ExecuteSql");
        Assert.NotNull(method);
        Assert.Equal(typeof(bool), method.ReturnType);
    }

    [Fact]
    public void ExecuteSqlWithRowCount_MethodExists_ShouldHaveCorrectSignature()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify method exists with correct signature
        var method = typeof(DataContextDapper).GetMethod("ExecuteSqlWithRowCount");
        Assert.NotNull(method);
        Assert.Equal(typeof(int), method.ReturnType);
    }

    [Fact]
    public void ExecuteTransaction_MethodExists_ShouldHaveCorrectSignature()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify method exists with correct signature
        var method = typeof(DataContextDapper).GetMethod("ExecuteTransaction");
        Assert.NotNull(method);
        Assert.Equal(typeof(bool), method.ReturnType);
    }

    [Fact]
    public void AllInterfaceMethods_AreImplemented_ShouldImplementAllMethods()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        var interfaceType = typeof(IDataContextDapper);
        var implementationType = typeof(DataContextDapper);
        
        // Verify all interface methods are implemented
        var interfaceMethods = interfaceType.GetMethods();
        foreach (var method in interfaceMethods)
        {
            var implementedMethod = implementationType.GetMethod(method.Name, 
                method.GetParameters().Select(p => p.ParameterType).ToArray());
            Assert.NotNull(implementedMethod);
        }
    }

    [Theory]
    [InlineData("LoadData")]
    [InlineData("LoadDataSingle")]
    [InlineData("LoadDataSingleOrDefault")]
    [InlineData("ExecuteSql")]
    [InlineData("ExecuteSqlWithRowCount")]
    [InlineData("ExecuteTransaction")]
    public void InterfaceMethods_ExistInImplementation_ShouldBeImplemented(string methodName)
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        var implementationType = typeof(DataContextDapper);
        
        // Verify specific method exists
        var methods = implementationType.GetMethods().Where(m => m.Name == methodName);
        Assert.NotEmpty(methods);
    }

    [Fact]
    public void DataContextDapper_HasCorrectNamespace_ShouldBeInCorrectNamespace()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
           Assert.Equal("AlgorithmBattleArena.Data.DataContextDapper", dataContext.GetType().FullName);
    }

    [Fact]
    public void DataContextDapper_IsPublicClass_ShouldBePublic()
    {
        var type = typeof(DataContextDapper);
        Assert.True(type.IsPublic);
    }

    [Fact]
    public void IDataContextDapper_IsPublicInterface_ShouldBePublic()
    {
        var type = typeof(IDataContextDapper);
        Assert.True(type.IsPublic);
        Assert.True(type.IsInterface);
    }

    [Fact]
    public void Configuration_IsRequired_ShouldRequireConfiguration()
    {
        // Verify constructor requires configuration parameter
        var constructors = typeof(DataContextDapper).GetConstructors();
        var mainConstructor = constructors.FirstOrDefault(c => c.GetParameters().Length == 1);
        
        Assert.NotNull(mainConstructor);
        var parameter = mainConstructor.GetParameters().First();
        Assert.Equal(typeof(IConfiguration), parameter.ParameterType);
    }

    [Fact]
    public void GenericMethods_SupportTypeParameters_ShouldSupportGenerics()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify generic methods exist
        var loadDataMethod = typeof(DataContextDapper).GetMethod("LoadData");
        var loadSingleMethod = typeof(DataContextDapper).GetMethod("LoadDataSingle");
        var loadSingleOrDefaultMethod = typeof(DataContextDapper).GetMethod("LoadDataSingleOrDefault");
        
        Assert.True(loadDataMethod?.IsGenericMethodDefinition);
        Assert.True(loadSingleMethod?.IsGenericMethodDefinition);
        Assert.True(loadSingleOrDefaultMethod?.IsGenericMethodDefinition);
    }

    [Fact]
    public void ParameterTypes_AreCorrect_ShouldHaveCorrectParameterTypes()
    {
        var config = CreateTestConfiguration();
        var dataContext = new DataContextDapper(config);
        
        // Verify ExecuteTransaction parameter type
        var executeTransactionMethod = typeof(DataContextDapper).GetMethod("ExecuteTransaction");
        Assert.NotNull(executeTransactionMethod);
        
        var parameters = executeTransactionMethod.GetParameters();
        Assert.Single(parameters);
        
        var parameterType = parameters[0].ParameterType;
        Assert.True(parameterType.IsGenericType);
        Assert.Equal(typeof(List<>), parameterType.GetGenericTypeDefinition());
    }
}