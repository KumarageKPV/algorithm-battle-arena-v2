using Xunit;
using AlgorithmBattleArena.Helpers;
using System.Collections.Generic;
using System.Linq;

namespace AlgorithmBattleArena.Tests;

public class PagedResultTests
{
    [Fact]
    public void Constructor_DefaultValues_SetsEmptyItemsAndZeroTotal()
    {
        var result = new PagedResult<string>();

        Assert.NotNull(result.Items);
        Assert.Empty(result.Items);
        Assert.Equal(0, result.Total);
    }

    [Fact]
    public void Items_SetValue_ReturnsSetValue()
    {
        var items = new List<string> { "item1", "item2", "item3" };
        var result = new PagedResult<string> { Items = items };

        Assert.Equal(items, result.Items);
        Assert.Equal(3, result.Items.Count());
    }

    [Fact]
    public void Total_SetValue_ReturnsSetValue()
    {
        var result = new PagedResult<string> { Total = 100 };

        Assert.Equal(100, result.Total);
    }

    [Fact]
    public void PagedResult_WithIntegerType_WorksCorrectly()
    {
        var numbers = new List<int> { 1, 2, 3, 4, 5 };
        var result = new PagedResult<int>
        {
            Items = numbers,
            Total = 50
        };

        Assert.Equal(numbers, result.Items);
        Assert.Equal(50, result.Total);
        Assert.Equal(5, result.Items.Count());
    }

    [Fact]
    public void PagedResult_WithCustomObject_WorksCorrectly()
    {
        var testObjects = new List<TestObject>
        {
            new TestObject { Id = 1, Name = "Test1" },
            new TestObject { Id = 2, Name = "Test2" }
        };
        var result = new PagedResult<TestObject>
        {
            Items = testObjects,
            Total = 25
        };

        Assert.Equal(testObjects, result.Items);
        Assert.Equal(25, result.Total);
        Assert.Equal(2, result.Items.Count());
        Assert.Equal("Test1", result.Items.First().Name);
    }

    [Fact]
    public void Items_SetToNull_AcceptsNullValue()
    {
        var result = new PagedResult<string> { Items = null! };

        Assert.Null(result.Items);
    }

    [Fact]
    public void Total_SetNegativeValue_AcceptsNegativeValue()
    {
        var result = new PagedResult<string> { Total = -5 };

        Assert.Equal(-5, result.Total);
    }

    [Fact]
    public void PagedResult_EmptyItems_WithPositiveTotal_IsValid()
    {
        var result = new PagedResult<string>
        {
            Items = new List<string>(),
            Total = 100
        };

        Assert.Empty(result.Items);
        Assert.Equal(100, result.Total);
    }

    private class TestObject
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}