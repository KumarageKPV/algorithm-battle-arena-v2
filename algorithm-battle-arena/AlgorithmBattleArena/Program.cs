using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Repositories;
using AlgorithmBattleArena.Helpers;
using AlgorithmBattleArena.Hubs;
using AlgorithmBattleArena.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using DotNetEnv;

// Load environment variables from .env file
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// Register DbContexts, repositories, and helpers
var connectionString = Environment.GetEnvironmentVariable("DEFAULT_CONNECTION") ??
                       builder.Configuration.GetConnectionString("DefaultConnection");

// EF Core removed - using Dapper only
builder.Services.AddScoped<IDataContextDapper, DataContextDapper>();
builder.Services.AddScoped<ILobbyRepository, LobbyRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IProblemRepository, ProblemRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<ITeacherRepository, TeacherRepository>();
builder.Services.AddScoped<IStatisticsRepository, StatisticsRepository>();
builder.Services.AddScoped<IFriendsRepository, FriendsRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IProblemImportRepository, ProblemImportRepository>();
builder.Services.AddSingleton<AuthHelper>();

// Micro-course AI service
builder.Services.AddHttpClient();
builder.Services.AddScoped<AlgorithmBattleArena.Services.IMicroCourseService, AlgorithmBattleArena.Services.OpenAiMicroCourseService>();

// JWT Authentication configuration
var tokenKey = Environment.GetEnvironmentVariable("TOKEN_KEY") ??
               builder.Configuration.GetValue<string>("AppSettings:TokenKey");

if (string.IsNullOrEmpty(tokenKey))
{
    throw new Exception("JWT TokenKey is missing in configuration!");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        // Allow SignalR to receive token via "access_token" query param
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"].ToString();
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/lobbyHub", StringComparison.OrdinalIgnoreCase) ||
                     path.StartsWithSegments("/matchhub", StringComparison.OrdinalIgnoreCase) ||
                     path.StartsWithSegments("/chathub", StringComparison.OrdinalIgnoreCase)))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

// ===================== CORS CONFIGURATION =====================
builder.Services.AddCors(options =>
{
    // Local development CORS
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:4200",
                "http://localhost:3000",
                "http://localhost:8000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });

    // Production CORS for Azure Frontend
    options.AddPolicy("ProdCors", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
                origin == "https://lemon-mud-0cd08c100.2.azurestaticapps.net" ||
                origin == "https://lemon-mud-0cd08c100.2.azurestaticapps.net/")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});
// ===============================================================

var app = builder.Build();

// ===================== MIDDLEWARE ORDER MATTERS =====================

// CORS FIRST (before authentication)
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevCors");
}
else
{
    app.UseCors("ProdCors");
}

// Swagger / HTTPS
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// Authentication & Custom Middleware
app.UseAuthentication();
app.UseAuditLogging();
app.UseAuthorization();

// Controllers & Hubs
app.MapControllers();
app.MapHub<MatchHub>("/lobbyHub");
app.MapHub<ChatHub>("/chathub");

// Resolve micro-course service once at startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        var svc = scope.ServiceProvider.GetService<AlgorithmBattleArena.Services.IMicroCourseService>();
        // Constructor will log key presence
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetService<ILogger<Program>>();
        logger?.LogWarning(ex, "Failed to resolve IMicroCourseService at startup");
    }
}

app.Run();

public partial class Program { }
