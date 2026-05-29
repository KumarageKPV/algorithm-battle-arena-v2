using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace AlgorithmBattleArena.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set environment variables that Program.cs checks for
        Environment.SetEnvironmentVariable("TOKEN_KEY", "test-token-key-for-unit-tests-that-is-long-enough-to-meet-minimum-requirements-for-jwt-signing");
        Environment.SetEnvironmentVariable("DEFAULT_CONNECTION", "Server=test;Database=test;Integrated Security=true;");
        
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:TokenKey"] = "test-token-key-for-unit-tests-that-is-long-enough",
                ["ConnectionStrings:DefaultConnection"] = "Server=test;Database=test;Integrated Security=true;"
            });
        });
    }
    
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            Environment.SetEnvironmentVariable("TOKEN_KEY", null);
            Environment.SetEnvironmentVariable("DEFAULT_CONNECTION", null);
        }
        base.Dispose(disposing);
    }
}

public class ProgramTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ProgramTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public void Program_ServiceRegistration_RegistersAllRequiredServices()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        // Test that all required services are registered
        Assert.NotNull(services.GetService<IDataContextDapper>());
        Assert.NotNull(services.GetService<ILobbyRepository>());
        Assert.NotNull(services.GetService<IAuthRepository>());
        Assert.NotNull(services.GetService<IProblemRepository>());
        Assert.NotNull(services.GetService<ISubmissionRepository>());
        Assert.NotNull(services.GetService<IMatchRepository>());
        Assert.NotNull(services.GetService<AuthHelper>());
    }

    [Fact]
    public void Program_AuthenticationService_IsConfigured()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var authService = services.GetService<Microsoft.AspNetCore.Authentication.IAuthenticationService>();
        Assert.NotNull(authService);
    }

    [Fact]
    public void Program_JwtBearerOptions_AreConfigured()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var jwtOptions = services.GetService<Microsoft.Extensions.Options.IOptions<JwtBearerOptions>>();
        Assert.NotNull(jwtOptions);
    }

    [Fact]
    public async Task Program_Application_StartsSuccessfully()
    {
        // This test verifies that the application can start without throwing exceptions
        var response = await _client.GetAsync("/");
        
        // We expect a 404 since there's no root endpoint, but the app should start
        Assert.True(response.StatusCode == System.Net.HttpStatusCode.NotFound || 
                   response.StatusCode == System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public void Program_CorsPolicy_IsConfigured()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var corsService = services.GetService<Microsoft.AspNetCore.Cors.Infrastructure.ICorsService>();
        Assert.NotNull(corsService);
    }

    [Fact]
    public void Program_SignalRService_IsConfigured()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var signalRService = services.GetService<Microsoft.AspNetCore.SignalR.HubConnectionHandler<AlgorithmBattleArena.Hubs.MatchHub>>();
        Assert.NotNull(signalRService);
    }

    [Fact]
    public void Program_ControllerServices_AreConfigured()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var mvcService = services.GetService<Microsoft.AspNetCore.Mvc.Infrastructure.IActionDescriptorCollectionProvider>();
        Assert.NotNull(mvcService);
    }

    [Fact]
    public void Program_AuthHelper_IsSingleton()
    {
        using var scope1 = _factory.Services.CreateScope();
        using var scope2 = _factory.Services.CreateScope();

        var authHelper1 = scope1.ServiceProvider.GetService<AuthHelper>();
        var authHelper2 = scope2.ServiceProvider.GetService<AuthHelper>();

        // AuthHelper is registered as Singleton, so should be the same instance
        Assert.Same(authHelper1, authHelper2);
    }

    [Fact]
    public void Program_RepositoryServices_AreScoped()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var repo1 = services.GetService<ILobbyRepository>();
        var repo2 = services.GetService<ILobbyRepository>();

        // Scoped services should return the same instance within the same scope
        Assert.Same(repo1, repo2);
    }

    [Fact]
    public void Program_DataContextServices_AreScoped()
    {
        using var scope = _factory.Services.CreateScope();
        var services = scope.ServiceProvider;

        var context1 = services.GetService<IDataContextDapper>();
        var context2 = services.GetService<IDataContextDapper>();

        // Scoped services should return the same instance within the same scope
        Assert.Same(context1, context2);
    }
}