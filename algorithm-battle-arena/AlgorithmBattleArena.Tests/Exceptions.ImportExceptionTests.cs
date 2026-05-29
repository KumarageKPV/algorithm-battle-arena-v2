using System;
using AlgorithmBattleArena.Exceptions;
using AlgorithmBattleArena.Dtos;
using Xunit;

namespace AlgorithmBattleArena.Tests
{
    public class Exceptions_ImportExceptionTests
    {
        [Fact]
        public void Ctor_WithMessage_SetsMessage_AndErrors()
        {
            var errors = new List<ImportErrorDto>
            {
                new ImportErrorDto { Row = 1, Field = "Title", Message = "Missing" }
            };
            var ex = new ImportException("boom", errors);
            Assert.Equal("boom", ex.Message);
            Assert.Same(errors, ex.Errors);
        }

        [Fact]
        public void Ctor_DefaultMessage_SetsDefaultMessage_AndErrors()
        {
            var errors = new List<ImportErrorDto>
            {
                new ImportErrorDto { Row = 2, Field = "Description", Message = "Too short" }
            };
            var ex = new ImportException(errors);
            Assert.Equal("Import validation failed", ex.Message);
            Assert.Same(errors, ex.Errors);
        }
    }
}
