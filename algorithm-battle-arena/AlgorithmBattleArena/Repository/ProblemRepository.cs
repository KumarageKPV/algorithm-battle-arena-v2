using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Dtos;
using AlgorithmBattleArena.Models;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using AlgorithmBattleArena.Helpers;

namespace AlgorithmBattleArena.Repositories
{
    public class ProblemRepository : IProblemRepository
    {
        private readonly IDataContextDapper _dapper;

        public ProblemRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<int> UpsertProblem(ProblemUpsertDto dto)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Title", dto.Title);
            parameters.Add("@Description", dto.Description);
            parameters.Add("@DifficultyLevel", dto.DifficultyLevel);
            parameters.Add("@Category", dto.Category);
            parameters.Add("@TimeLimit", dto.TimeLimit);
            parameters.Add("@MemoryLimit", dto.MemoryLimit);
            parameters.Add("@CreatedBy", dto.CreatedBy);
            parameters.Add("@Tags", dto.Tags);
            parameters.Add("@TestCases", dto.TestCases);
            parameters.Add("@Solutions", dto.Solutions);

            // Debug logging
            Console.WriteLine($"TestCases JSON: {dto.TestCases}");
            Console.WriteLine($"Solutions JSON: {dto.Solutions}");

            return await _dapper.LoadDataSingleAsync<int>(
                "EXEC AlgorithmBattleArinaSchema.spUpsertProblem @Title, @Description, @DifficultyLevel, @Category, @TimeLimit, @MemoryLimit, @CreatedBy, @Tags, @TestCases, @Solutions",
                parameters
            );
        }

        public async Task<PagedResult<ProblemListDto>> GetProblems(ProblemFilterDto filter)
        {
            var whereClause = new List<string>();
            var parameters = new DynamicParameters();

            if (!string.IsNullOrEmpty(filter.Category))
            {
                whereClause.Add("Category = @Category");
                parameters.Add("@Category", filter.Category);
            }

            if (!string.IsNullOrEmpty(filter.DifficultyLevel))
            {
                whereClause.Add("DifficultyLevel = @DifficultyLevel");
                parameters.Add("@DifficultyLevel", filter.DifficultyLevel);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                whereClause.Add("(Title LIKE @SearchTerm OR Description LIKE @SearchTerm)");
                parameters.Add("@SearchTerm", $"%{filter.SearchTerm}%");
            }

            var whereSql = whereClause.Any() ? " WHERE " + string.Join(" AND ", whereClause) : "";

            var totalSql = "SELECT COUNT(*) FROM AlgorithmBattleArinaSchema.Problems" + whereSql;
            var total = await _dapper.LoadDataSingleAsync<int>(totalSql, parameters);

            var sql = $"SELECT ProblemId, Title, DifficultyLevel, Category, CreatedBy, CreatedAt FROM AlgorithmBattleArinaSchema.Problems{whereSql} ORDER BY CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
            parameters.Add("@Offset", filter.Page * filter.PageSize); // Bug: should be (filter.Page - 1) * filter.PageSize
            parameters.Add("@PageSize", filter.PageSize);

            var problems = await _dapper.LoadDataAsync<ProblemListDto>(sql, parameters);

            return new PagedResult<ProblemListDto> { Items = problems, Total = total };
        }

        public async Task<ProblemResponseDto?> GetProblem(int id)
        {
            var problem = await _dapper.LoadDataSingleOrDefaultAsync<Problem>("SELECT * FROM AlgorithmBattleArinaSchema.Problems WHERE ProblemId = @ProblemId", new { ProblemId = id });
            if (problem == null) return null;

            var testCases = await _dapper.LoadDataAsync<ProblemTestCase>("SELECT * FROM AlgorithmBattleArinaSchema.ProblemTestCases WHERE ProblemId = @ProblemId ORDER BY TestCaseId", new { ProblemId = id });
            var solutions = await _dapper.LoadDataAsync<ProblemSolution>("SELECT * FROM AlgorithmBattleArinaSchema.ProblemSolutions WHERE ProblemId = @ProblemId ORDER BY Language", new { ProblemId = id });

            return new ProblemResponseDto
            {
                ProblemId = problem.ProblemId,
                Title = problem.Title,
                Description = problem.Description,
                DifficultyLevel = problem.DifficultyLevel,
                Category = problem.Category,
                TimeLimit = problem.TimeLimit,
                MemoryLimit = problem.MemoryLimit,
                CreatedBy = problem.CreatedBy,
                Tags = problem.Tags,
                CreatedAt = problem.CreatedAt,
                UpdatedAt = problem.UpdatedAt,
                TestCases = testCases.ToList(),
                Solutions = solutions.ToList()
            };
        }

        public async Task<bool> DeleteProblem(int id)
        {
            return await _dapper.ExecuteSqlAsync(
                @"DELETE FROM AlgorithmBattleArinaSchema.ProblemSolutions WHERE ProblemId = @ProblemId;
                  DELETE FROM AlgorithmBattleArinaSchema.ProblemTestCases WHERE ProblemId = @ProblemId;
                  DELETE FROM AlgorithmBattleArinaSchema.Problems WHERE ProblemId = @ProblemId;",
                new { ProblemId = id }
            );
        }

        public async Task<IEnumerable<string>> GetCategories()
        {
            return await _dapper.LoadDataAsync<string>("SELECT DISTINCT Category FROM AlgorithmBattleArinaSchema.Problems ORDER BY Category");
        }

        public async Task<IEnumerable<string>> GetDifficultyLevels()
        {
            return await _dapper.LoadDataAsync<string>("SELECT DISTINCT DifficultyLevel FROM AlgorithmBattleArinaSchema.Problems ORDER BY DifficultyLevel");
        }

        public async Task<IEnumerable<Problem>> GetRandomProblems(string language, string difficulty, int maxProblems)
        {
            var sql = @"SELECT TOP (@MaxProblems) p.* 
                        FROM AlgorithmBattleArinaSchema.Problems p
                        INNER JOIN AlgorithmBattleArinaSchema.ProblemSolutions s ON p.ProblemId = s.ProblemId
                        WHERE s.Language = @Language";

            var parameters = new DynamicParameters();
            parameters.Add("@Language", language);
            parameters.Add("@MaxProblems", maxProblems);

            if (difficulty != "Mixed")
            {
                sql += " AND p.DifficultyLevel = @Difficulty";
                parameters.Add("@Difficulty", difficulty);
            }

            sql += " ORDER BY NEWID()";

            return await _dapper.LoadDataAsync<Problem>(sql, parameters);
        }

        public async Task<int> ImportProblemsAsync(IEnumerable<Problem> problems)
        {
            using var connection = _dapper.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                int importedCount = 0;
                foreach (var problem in problems)
                {
                    var problemId = await InsertProblemAsync(connection, transaction, problem);
                    await InsertTestCasesAsync(connection, transaction, problemId, problem.TestCases);
                    importedCount++;
                }

                transaction.Commit();
                return importedCount;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task<int> InsertProblemAsync(IDbConnection connection, IDbTransaction transaction, Problem problem)
        {
            const string sql = @"
                INSERT INTO AlgorithmBattleArinaSchema.Problems 
                (Title, Description, DifficultyLevel, Category, TimeLimit, MemoryLimit, CreatedBy, Tags)
                VALUES (@Title, @Description, @DifficultyLevel, @Category, @TimeLimit, @MemoryLimit, @CreatedBy, @Tags);
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await connection.QuerySingleAsync<int>(sql, new
            {
                problem.Title,
                problem.Description,
                problem.DifficultyLevel,
                problem.Category,
                problem.TimeLimit,
                problem.MemoryLimit,
                problem.CreatedBy,
                problem.Tags
            }, transaction);
        }

        private async Task InsertTestCasesAsync(IDbConnection connection, IDbTransaction transaction, int problemId, ICollection<ProblemTestCase> testCases)
        {
            const string sql = @"
                INSERT INTO AlgorithmBattleArinaSchema.ProblemTestCases 
                (ProblemId, InputData, ExpectedOutput, IsSample)
                VALUES (@ProblemId, @InputData, @ExpectedOutput, @IsSample)";

            foreach (var testCase in testCases)
            {
                await connection.ExecuteAsync(sql, new
                {
                    ProblemId = problemId,
                    InputData = testCase.InputData,
                    testCase.ExpectedOutput,
                    testCase.IsSample
                }, transaction);
            }
        }

        public async Task<bool> SlugExistsAsync(string slug)
        {
            const string sql = "SELECT COUNT(1) FROM AlgorithmBattleArinaSchema.Problems WHERE Slug = @Slug";
            var count = await _dapper.LoadDataSingleAsync<int>(sql, new { Slug = slug });
            return count > 0;
        }
    }
}
