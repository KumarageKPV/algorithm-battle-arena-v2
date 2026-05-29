using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Data
{
    public class DataContextDapper : IDataContextDapper
    {
        private readonly IConfiguration _config;

        public DataContextDapper(IConfiguration config)
        {
            _config = config;
        }

        public IDbConnection CreateConnection()
        {
            var connectionString = Environment.GetEnvironmentVariable("DEFAULT_CONNECTION") ?? 
                                  _config.GetConnectionString("DefaultConnection");
            return new SqlConnection(connectionString);
        }

        // Async Methods
        public async Task<IEnumerable<T>> LoadDataAsync<T>(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return await connection.QueryAsync<T>(sql, parameters);
        }

        public async Task<T> LoadDataSingleAsync<T>(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return await connection.QuerySingleAsync<T>(sql, parameters);
        }

        public async Task<T?> LoadDataSingleOrDefaultAsync<T>(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<T>(sql, parameters);
        }

        public async Task<bool> ExecuteSqlAsync(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return await connection.ExecuteAsync(sql, parameters) > 0;
        }

        // Sync Methods
        public IEnumerable<T> LoadData<T>(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return connection.Query<T>(sql, parameters);
        }

        public T LoadDataSingle<T>(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return connection.QuerySingle<T>(sql, parameters);
        }

        public T? LoadDataSingleOrDefault<T>(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return connection.QuerySingleOrDefault<T>(sql, parameters);
        }

        public bool ExecuteSql(string sql, object? parameters = null)
        { 
            using IDbConnection connection = CreateConnection();
            return connection.Execute(sql, parameters) > 0;
        }

        public int ExecuteSqlWithRowCount(string sql, object? parameters = null)
        {
            using IDbConnection connection = CreateConnection();
            return connection.Execute(sql, parameters);
        }

        public bool ExecuteTransaction(List<(string sql, object? parameters)> sqlCommands)
        {
            using IDbConnection connection = CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                foreach (var (sql, parameters) in sqlCommands)
                {
                    connection.Execute(sql, parameters, transaction);
                }
                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
        }
    }
}
