using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc.Abstractions;
using System.Security.Claims;
using AlgorithmBattleArena.Attributes;

namespace AlgorithmBattleArena.Tests;

public class AdminOnlyAttributeTests
{
    private static AuthorizationFilterContext CreateContext(ClaimsPrincipal user)
    {
        var httpContext = new DefaultHttpContext { User = user };
        var routeData = new RouteData();
        var actionDescriptor = new ActionDescriptor();
        var actionContext = new ActionContext(httpContext, routeData, actionDescriptor);
        return new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
    }

    [Fact]
    public void OnAuthorization_UnauthenticatedUser_ReturnsUnauthorized()
    {
        var attribute = new AdminOnlyAttribute();
        var user = new ClaimsPrincipal(new ClaimsIdentity());
        var context = CreateContext(user);

        attribute.OnAuthorization(context);

        Assert.IsType<UnauthorizedResult>(context.Result);
    }

    [Fact]
    public void OnAuthorization_AdminUser_AllowsAccess()
    {
        var attribute = new AdminOnlyAttribute();
        var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Admin") }, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        var context = CreateContext(user);

        attribute.OnAuthorization(context);

        Assert.Null(context.Result);
    }

    [Fact]
    public void OnAuthorization_NonAdminUser_ReturnsForbidden()
    {
        var attribute = new AdminOnlyAttribute();
        var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Student") }, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        var context = CreateContext(user);

        attribute.OnAuthorization(context);

        Assert.IsType<ForbidResult>(context.Result);
    }

    [Fact]
    public void OnAuthorization_AdminWithRoleClaim_AllowsAccess()
    {
        var attribute = new AdminOnlyAttribute();
        var identity = new ClaimsIdentity(new[] { new Claim("role", "Admin") }, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        var context = CreateContext(user);

        attribute.OnAuthorization(context);

        Assert.Null(context.Result);
    }

    [Fact]
    public void OnAuthorization_NoRoleClaim_ReturnsForbidden()
    {
        var attribute = new AdminOnlyAttribute();
        var identity = new ClaimsIdentity(new[] { new Claim("email", "test@test.com") }, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        var context = CreateContext(user);

        attribute.OnAuthorization(context);

        Assert.IsType<ForbidResult>(context.Result);
    }
}