using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Data
{
    public interface IDataContextDapper
    {
        Task<IEnumerable<T>> LoadDataAsync<T>(string sql, object? parameters = null);
        Task<T> LoadDataSingleAsync<T>(string sql, object? parameters = null);
        Task<T?> LoadDataSingleOrDefaultAsync<T>(string sql, object? parameters = null);
        Task<bool> ExecuteSqlAsync(string sql, object? parameters = null);

        IEnumerable<T> LoadData<T>(string sql, object? parameters = null);
        T LoadDataSingle<T>(string sql, object? parameters = null);
        T? LoadDataSingleOrDefault<T>(string sql, object? parameters = null);
        bool ExecuteSql(string sql, object? parameters = null);
        int ExecuteSqlWithRowCount(string sql, object? parameters = null);
        bool ExecuteTransaction(List<(string sql, object? parameters)> sqlCommands);
        IDbConnection CreateConnection();
    }
}
