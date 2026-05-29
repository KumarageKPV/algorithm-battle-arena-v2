using System.Text.RegularExpressions;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Exceptions;
using AlgorithmBattleArena.Models;
using System.Text.Json;

namespace AlgorithmBattleArena.Repositories
{
    public class ProblemImportRepository : IProblemImportRepository
    {
        private readonly IProblemRepository _problemRepository;
        private static readonly Regex SlugPattern = new Regex(@"^[a-z0-9\-_.]{2,100}$", RegexOptions.Compiled);
        private static readonly HashSet<string> ValidDifficulties = new() { "Easy", "Medium", "Hard" };

        public ProblemImportRepository(IProblemRepository problemRepository)
        {
            _problemRepository = problemRepository;
        }

        public async Task<ImportResultDto> ImportProblemsAsync(IEnumerable<ImportedProblemDto> problems, CancellationToken cancellationToken = default)
        {
            var problemList = problems.ToList();
            
            // Validate all problems first
            var validationErrors = new List<ImportErrorDto>();
            for (int i = 0; i < problemList.Count; i++)
            {
                var errors = await ValidateAsync(problemList[i], i + 1);
                validationErrors.AddRange(errors);
            }

            if (validationErrors.Any())
            {
                throw new ImportException(validationErrors);
            }

            // Use stored procedure to import each problem
            var importedCount = 0;
            foreach (var dto in problemList)
            {
                var testCasesJson = JsonSerializer.Serialize(dto.TestCases);
                var solutionsJson = JsonSerializer.Serialize(dto.Solutions);
                
                var upsertDto = new ProblemUpsertDto
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    DifficultyLevel = dto.DifficultyLevel,
                    Category = dto.Category,
                    TimeLimit = dto.TimeLimit > 0 ? dto.TimeLimit : 1000,
                    MemoryLimit = dto.MemoryLimit > 0 ? dto.MemoryLimit : 256,
                    CreatedBy = dto.CreatedBy,
                    Tags = dto.Tags,
                    TestCases = testCasesJson,
                    Solutions = solutionsJson
                };
                
                await _problemRepository.UpsertProblem(upsertDto);
                importedCount++;
            }
            
            return new ImportResultDto
            {
                Ok = true,
                Inserted = importedCount,
                Slugs = problemList.Select(p => GenerateSlug(p.Title)).ToArray()
            };
        }

        public async Task<List<ImportErrorDto>> ValidateAsync(ImportedProblemDto problem, int row)
        {
            var errors = new List<ImportErrorDto>();

            if (string.IsNullOrWhiteSpace(problem.Title))
                errors.Add(new ImportErrorDto { Row = row, Field = "title", Message = "Title is required" });
            else if (problem.Title.Length > 200)
                errors.Add(new ImportErrorDto { Row = row, Field = "title", Message = "Title must be 200 characters or less" });

            if (string.IsNullOrWhiteSpace(problem.Description))
                errors.Add(new ImportErrorDto { Row = row, Field = "description", Message = "Description is required" });

            if (string.IsNullOrWhiteSpace(problem.DifficultyLevel))
                errors.Add(new ImportErrorDto { Row = row, Field = "difficultyLevel", Message = "Difficulty is required" });
            else if (!IsValidDifficulty(problem.DifficultyLevel))
                errors.Add(new ImportErrorDto { Row = row, Field = "difficultyLevel", Message = "Difficulty must be Easy, Medium, Hard, or numeric 1-5" });

            if (problem.TestCases == null || problem.TestCases.Length == 0)
                errors.Add(new ImportErrorDto { Row = row, Field = "testCases", Message = "At least one test case required" });
            else
            {
                for (int i = 0; i < problem.TestCases.Length; i++)
                {
                    var testCase = problem.TestCases[i];
                    if (string.IsNullOrWhiteSpace(testCase.InputData))
                        errors.Add(new ImportErrorDto { Row = row, Field = $"testCases[{i}].inputData", Message = "Test case input cannot be empty" });
                    if (string.IsNullOrWhiteSpace(testCase.ExpectedOutput))
                        errors.Add(new ImportErrorDto { Row = row, Field = $"testCases[{i}].expectedOutput", Message = "Test case expected output cannot be empty" });
                }
            }

            return errors;
        }

        private static string GenerateSlug(string title)
        {
            return title.ToLower()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("(", "")
                .Replace(")", "")
                .Replace("[", "")
                .Replace("]", "")
                .Replace("{", "")
                .Replace("}", "");
        }

        private static bool IsValidDifficulty(string difficulty)
        {
            if (ValidDifficulties.Contains(difficulty))
                return true;

            if (int.TryParse(difficulty, out int numericDifficulty))
                return numericDifficulty >= 1 && numericDifficulty <= 5;

            return false;
        }
    }
}
