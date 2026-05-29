using AlgorithmBattleArena.Data;
using System.Security.Claims;
using System.Text.Json;
using Dapper;

namespace AlgorithmBattleArena.Middleware
{
    public class AuditLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AuditLoggingMiddleware> _logger;

        public AuditLoggingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory, ILogger<AuditLoggingMiddleware> logger)
        {
            _next = next;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Set correlation ID
            var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? Guid.NewGuid().ToString();
            context.Items["CorrelationId"] = correlationId;

            // Check if this request should be audited and not already logged by controller
            if (ShouldAudit(context) && !context.Items.ContainsKey("AuditControllerLogged"))
            {
                await LogAuditAsync(context, correlationId);
            }

            await _next(context);
        }

        private bool ShouldAudit(HttpContext context)
        {
            var method = context.Request.Method;
            var path = context.Request.Path.Value?.ToLower() ?? "";

            return (method == "PUT" || method == "POST" || method == "DELETE") &&
                   (path.Contains("/admin") || path.Contains("/users/"));
        }

        private async Task LogAuditAsync(HttpContext context, string correlationId)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dapper = scope.ServiceProvider.GetRequiredService<IDataContextDapper>();

                var user = context.User;
                var actorUserId = GetActorUserId(user);
                var actorEmail = user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value ?? "";

                var requestBody = await GetSanitizedRequestBodyAsync(context);
                var sourceIp = GetSourceIp(context);

                const string sql = @"
                    INSERT INTO AlgorithmBattleArinaSchema.AuditLog 
                    (UserId, Action, EntityType, EntityId, BeforeState, AfterState, CorrelationId)
                    VALUES (@UserId, @Action, @EntityType, @EntityId, @BeforeState, @AfterState, @CorrelationId)";

                await dapper.ExecuteSqlAsync(sql, new
                {
                    UserId = actorUserId,
                    Action = context.Request.Method,
                    EntityType = ExtractResourceType(context.Request.Path),
                    EntityId = ExtractResourceId(context.Request.Path),
                    BeforeState = "",
                    AfterState = requestBody,
                    CorrelationId = correlationId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write audit log for request {Method} {Path}", context.Request.Method, context.Request.Path);
            }
        }

        private string GetActorUserId(ClaimsPrincipal user)
        {
            var role = user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value ?? "";

            return role switch
            {
                "Student" => $"Student:{userId}",
                "Teacher" => $"Teacher:{userId}",
                "Admin" => $"Admin:{userId}",
                _ => userId
            };
        }

        private async Task<string> GetSanitizedRequestBodyAsync(HttpContext context)
        {
            try
            {
                context.Request.EnableBuffering();
                context.Request.Body.Position = 0;

                using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;

                if (string.IsNullOrEmpty(body)) return "{}";

                var jsonDoc = JsonDocument.Parse(body);
                var sanitized = SanitizeJson(jsonDoc.RootElement);
                return JsonSerializer.Serialize(sanitized);
            }
            catch
            {
                return "{}";
            }
        }

        private object? SanitizeJson(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.Object => element.EnumerateObject().ToDictionary(
                    prop => prop.Name,
                    prop => ShouldRedact(prop.Name) ? "[REDACTED]" : SanitizeJson(prop.Value)
                ),
                JsonValueKind.Array => element.EnumerateArray().Select(SanitizeJson).ToArray(),
                JsonValueKind.String => element.GetString() ?? "",
                JsonValueKind.Number => element.GetDecimal(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                _ => element.ToString() ?? ""
            };
        }

        private bool ShouldRedact(string propertyName)
        {
            var lower = propertyName.ToLower();
            return lower.Contains("password") || lower.Contains("pass") || lower.Contains("token") ||
                   lower.Contains("accesstoken") || lower.Contains("refreshtoken") || lower.Contains("secret");
        }

        private string GetSourceIp(HttpContext context)
        {
            return context.Request.Headers["X-Forwarded-For"].FirstOrDefault() ??
                   context.Connection.RemoteIpAddress?.ToString() ?? "";
        }

        private string ExtractResourceType(PathString path)
        {
            var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            return segments.Length > 1 ? segments[1] : "Unknown";
        }

        private string ExtractResourceId(PathString path)
        {
            var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            return segments.Length > 2 && int.TryParse(segments[2], out _) ? segments[2] : "";
        }
    }

    public static class AuditLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuditLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuditLoggingMiddleware>();
        }
    }
}
