using System.Collections.Generic;
using System.Threading.Tasks;
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using Dapper;

namespace AlgorithmBattleArena.Repositories
{
    public class TeacherRepository : ITeacherRepository
    {
        private readonly IDataContextDapper _dapper;

        public TeacherRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<Teacher>> GetTeachers()
        {
            string sql = @"SELECT * FROM AlgorithmBattleArinaSchema.Teachers";
            return await _dapper.LoadDataAsync<Teacher>(sql);
        }

        public async Task<bool> ExistsAsync(int teacherId)
        {
            string sql = @"SELECT COUNT(1) FROM AlgorithmBattleArinaSchema.Teachers WHERE TeacherId = @TeacherId";
            var result = await _dapper.LoadDataAsync<int>(sql, new { TeacherId = teacherId });
            var count = result.FirstOrDefault();
            return count > 0;
        }
    }
}
