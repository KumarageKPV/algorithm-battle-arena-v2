using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using AlgorithmBattleArena.Helpers;
using System;

namespace AlgorithmBattleArena.Tests;

public class ControllerHelperTests
{
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    private readonly Mock<ILogger> _mockLogger = new();

    [Theory]
    [InlineData("{}", true)]
    [InlineData("{\"name\":\"test\"}", true)]
    [InlineData("[]", true)]
    [InlineData("[{\"id\":1}]", true)]
    [InlineData("\"string\"", true)]
    [InlineData("123", true)]
    [InlineData("true", true)]
    [InlineData("null", true)]
    public void IsValidJson_ValidJson_ReturnsTrue(string json, bool expected)
    {
        var result = ControllerHelper.IsValidJson(json);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("", false)]
    [InlineData("{", false)]
    [InlineData("}", false)]
    [InlineData("{\"name\":}", false)]
    [InlineData("[{]", false)]
    [InlineData("invalid", false)]
    [InlineData("{\"name\":\"test\",}", false)]
    public void IsValidJson_InvalidJson_ReturnsFalse(string json, bool expected)
    {
        var result = ControllerHelper.IsValidJson(json);
        Assert.Equal(expected, result);
    }

    [Fact]
    public void ValidateJson_ValidArrayWithPredicate_ReturnsTrue()
    {
        var json = "[{\"id\":1},{\"id\":2}]";
        // amazonq-ignore-next-line
        var predicate = new Func<TestItem, bool>(item => item.Id > 0);

        var result = ControllerHelper.ValidateJson(json, predicate, _mockLogger.Object);

        Assert.True(result);
    }

    [Fact]
    public void ValidateJson_ValidArrayFailsPredicate_ReturnsFalse()
    {
        var json = "[{\"id\":1},{\"id\":-1}]";
        var predicate = new Func<TestItem, bool>(item => item.Id > 0);

        var result = ControllerHelper.ValidateJson(json, predicate, _mockLogger.Object);

        Assert.False(result);
    }

    [Fact]
    public void ValidateJson_InvalidJson_ReturnsFalse()
    {
        var json = "invalid json";
        var predicate = new Func<TestItem, bool>(item => true);

        var result = ControllerHelper.ValidateJson(json, predicate, _mockLogger.Object);

        Assert.False(result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("JSON validation failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void ValidateJson_NullArray_ReturnsFalse()
    {
        var json = "null";
        var predicate = new Func<TestItem, bool>(item => true);

        var result = ControllerHelper.ValidateJson(json, predicate, _mockLogger.Object);

        Assert.False(result);
    }

    [Fact]
    public void HandleError_LogsErrorAndReturns500()
    {
        var exception = new InvalidOperationException("Test error");
        var message = "Test message";

        var result = ControllerHelper.HandleError(exception, message, _mockLogger.Object);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
        
        var value = objectResult.Value;
        // amazonq-ignore-next-line
        var messageProperty = value!.GetType().GetProperty("message")!.GetValue(value);
        var detailsProperty = value.GetType().GetProperty("details")!.GetValue(value);
        
        Assert.Equal("An error occurred.", messageProperty);
        Assert.Equal("Test error", detailsProperty);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Test message")),
                exception,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void SafeExecute_ActionSucceeds_ReturnsActionResult()
    {
        var expectedResult = new OkObjectResult("success");
        var action = new Func<IActionResult>(() => expectedResult);

        var result = ControllerHelper.SafeExecute(action, "error message", _mockLogger.Object);

        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void SafeExecute_ActionThrows_ReturnsErrorResult()
    {
        var exception = new InvalidOperationException("Action failed");
        var action = new Func<IActionResult>(() => throw exception);

        var result = ControllerHelper.SafeExecute(action, "Operation failed", _mockLogger.Object);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Operation failed")),
                exception,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    private class TestItem
    {
        public int Id { get; set; }
    }
}