using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AlgorithmBattleArena.Tests
{
    public class Middleware_AuditLoggingMiddlewareTests
    {
        private static (AuditLoggingMiddleware sut, Mock<IDataContextDapper> dapperMock, DefaultHttpContext ctx) CreateSut()
        {
            var dapperMock = new Mock<IDataContextDapper>();

            var provider = new Mock<IServiceProvider>();
            provider.Setup(p => p.GetService(typeof(IDataContextDapper))).Returns(dapperMock.Object);

            var scope = new Mock<IServiceScope>();
            scope.Setup(s => s.ServiceProvider).Returns(provider.Object);

            var scopeFactory = new Mock<IServiceScopeFactory>();
            scopeFactory.Setup(f => f.CreateScope()).Returns(scope.Object);

            var logger = new Mock<ILogger<AuditLoggingMiddleware>>();

            RequestDelegate next = _ => Task.CompletedTask;

            var sut = new AuditLoggingMiddleware(next, scopeFactory.Object, logger.Object);
            var ctx = new DefaultHttpContext();
            return (sut, dapperMock, ctx);
        }

        [Fact]
        public async Task InvokeAsync_WritesAudit_ForAuditableRequest_AndRedactsSensitiveData()
        {
            // Arrange
            var (sut, dapper, ctx) = CreateSut();
            ctx.Request.Method = HttpMethods.Post;
            ctx.Request.Path = "/api/admin/123";
            ctx.Request.Headers["X-Correlation-Id"] = "corr-123";
            var body = "{\"password\":\"secret\",\"name\":\"bob\"}";
            ctx.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(body));

            string? capturedSql = null;
            object? capturedParams = null;
            dapper.Setup(d => d.ExecuteSqlAsync(It.Is<string>(s => s.Contains("AuditLog")), It.IsAny<object>()))
                  .Callback<string, object>((sql, p) => { capturedSql = sql; capturedParams = p; })
                  .ReturnsAsync(true);

            // Act
            await sut.InvokeAsync(ctx);

            // Assert
            dapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Once);
            Assert.NotNull(capturedSql);
            Assert.NotNull(capturedParams);

            var afterStateProp = capturedParams!.GetType().GetProperty("AfterState");
            var entityTypeProp = capturedParams!.GetType().GetProperty("EntityType");
            var correlationProp = capturedParams!.GetType().GetProperty("CorrelationId");
            Assert.NotNull(afterStateProp);
            Assert.NotNull(entityTypeProp);
            Assert.NotNull(correlationProp);

            var afterState = afterStateProp!.GetValue(capturedParams) as string;
            var entityType = entityTypeProp!.GetValue(capturedParams) as string;
            var corr = correlationProp!.GetValue(capturedParams) as string;

            Assert.False(string.IsNullOrWhiteSpace(afterState));
            Assert.Contains("[REDACTED]", afterState);
            Assert.DoesNotContain("secret", afterState);
            Assert.Equal("admin", entityType);
            Assert.Equal("corr-123", corr);

            // CorrelationId also set in HttpContext.Items
            Assert.True(ctx.Items.ContainsKey("CorrelationId"));
            Assert.Equal("corr-123", ctx.Items["CorrelationId"] as string);
        }

        [Fact]
        public async Task InvokeAsync_DoesNotWriteAudit_ForGetRequests()
        {
            // Arrange
            var (sut, dapper, ctx) = CreateSut();
            ctx.Request.Method = HttpMethods.Get;
            ctx.Request.Path = "/api/admin/123";

            // Act
            await sut.InvokeAsync(ctx);

            // Assert
            dapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Never);
        }

        [Fact]
        public async Task InvokeAsync_SkipsWhenControllerAlreadyLogged()
        {
            // Arrange
            var (sut, dapper, ctx) = CreateSut();
            ctx.Request.Method = HttpMethods.Post;
            ctx.Request.Path = "/api/admin/123";
            ctx.Items["AuditControllerLogged"] = true;

            // Act
            await sut.InvokeAsync(ctx);

            // Assert
            dapper.Verify(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Never);
        }

        [Fact]
        public async Task InvokeAsync_SetsGeneratedCorrelationId_WhenHeaderMissing()
        {
            // Arrange
            var (sut, dapper, ctx) = CreateSut();
            ctx.Request.Method = HttpMethods.Post;
            ctx.Request.Path = "/api/admin/123";

            dapper.Setup(d => d.ExecuteSqlAsync(It.IsAny<string>(), It.IsAny<object>())).ReturnsAsync(true);

            // Act
            await sut.InvokeAsync(ctx);

            // Assert
            Assert.True(ctx.Items.ContainsKey("CorrelationId"));
            var corr = ctx.Items["CorrelationId"] as string;
            Assert.False(string.IsNullOrWhiteSpace(corr));
        }
    }
}
