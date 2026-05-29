
using AlgorithmBattleArena.Data;
using AlgorithmBattleArena.Models;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AlgorithmBattleArena.Repositories
{
    public class LobbyRepository : ILobbyRepository
    {
        private readonly IDataContextDapper _dapper;

        public LobbyRepository(IDataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public async Task<Lobby> CreateLobby(string lobbyName, int maxPlayers, string mode, string difficulty, string hostEmail, string lobbyCode)
        {
            try
            {
                var sql = @"
                    INSERT INTO AlgorithmBattleArinaSchema.Lobbies (LobbyName, MaxPlayers, Mode, Difficulty, HostEmail, LobbyCode, Status, IsPublic)
                    VALUES (@LobbyName, @MaxPlayers, @Mode, @Difficulty, @HostEmail, @LobbyCode, 'Open', 1);
                    SELECT CAST(SCOPE_IDENTITY() as int)";
                
                var parameters = new DynamicParameters();
                parameters.Add("@LobbyName", lobbyName, DbType.String);
                parameters.Add("@MaxPlayers", maxPlayers, DbType.Int32);
                parameters.Add("@Mode", mode, DbType.String);
                parameters.Add("@Difficulty", difficulty, DbType.String);
                parameters.Add("@HostEmail", hostEmail, DbType.String);
                parameters.Add("@LobbyCode", lobbyCode, DbType.String);

                var lobbyId = await _dapper.LoadDataSingleAsync<int>(sql, parameters);

                if (lobbyId <= 0)
                {
                    throw new Exception("Failed to create lobby - invalid lobby ID returned");
                }

                var participantSql = @"
                    INSERT INTO AlgorithmBattleArinaSchema.LobbyParticipants (LobbyId, ParticipantEmail, Role)
                    VALUES (@LobbyId, @ParticipantEmail, 'Host')";
                
                var participantParams = new DynamicParameters();
                participantParams.Add("@LobbyId", lobbyId, DbType.Int32);
                participantParams.Add("@ParticipantEmail", hostEmail, DbType.String);

                var participantAdded = await _dapper.ExecuteSqlAsync(participantSql, participantParams);
                
                if (!participantAdded)
                {
                    throw new Exception("Failed to add host as participant");
                }

                var createdLobby = await GetLobbyById(lobbyId);
                if (createdLobby == null)
                {
                    throw new Exception("Failed to retrieve created lobby");
                }
                
                return createdLobby;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating lobby: {ex.Message}", ex);
            }
        }

        public async Task<bool> JoinLobby(int lobbyId, string participantEmail)
        {
            var lobby = await GetLobbyById(lobbyId);
            if (lobby == null || lobby.Status != "Open" || lobby.Participants.Count >= lobby.MaxPlayers)
            {
                return false;
            }

            // Check if user is already a participant
            if (lobby.Participants.Any(p => p.ParticipantEmail == participantEmail))
            {
                return false;
            }

            var sql = @"
                INSERT INTO AlgorithmBattleArinaSchema.LobbyParticipants (LobbyId, ParticipantEmail, Role)
                VALUES (@LobbyId, @ParticipantEmail, 'Player')";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);
            parameters.Add("@ParticipantEmail", participantEmail, DbType.String);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<bool> LeaveLobby(int lobbyId, string participantEmail)
        {
            var sql = "DELETE FROM AlgorithmBattleArinaSchema.LobbyParticipants WHERE LobbyId = @LobbyId AND ParticipantEmail = @ParticipantEmail";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);
            parameters.Add("@ParticipantEmail", participantEmail, DbType.String);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<bool> KickParticipant(int lobbyId, string hostEmail, string participantEmail)
        {
            if (!await IsHost(lobbyId, hostEmail))
            {
                return false;
            }
            
            var sql = "DELETE FROM AlgorithmBattleArinaSchema.LobbyParticipants WHERE LobbyId = @LobbyId AND ParticipantEmail = @ParticipantEmail";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);
            parameters.Add("@ParticipantEmail", participantEmail, DbType.String);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<bool> CloseLobby(int lobbyId, string hostEmail)
        {
            if (!await IsHost(lobbyId, hostEmail))
            {
                return false;
            }
            return await UpdateLobbyStatus(lobbyId, "Closed");
        }

        public async Task<bool> UpdateLobbyStatus(int lobbyId, string status)
        {
            var sql = "UPDATE AlgorithmBattleArinaSchema.Lobbies SET Status = @Status WHERE LobbyId = @LobbyId";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);
            parameters.Add("@Status", status, DbType.String);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<bool> UpdateLobbyPrivacy(int lobbyId, bool isPublic)
        {
            var sql = "UPDATE AlgorithmBattleArinaSchema.Lobbies SET IsPublic = @IsPublic WHERE LobbyId = @LobbyId";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);
            parameters.Add("@IsPublic", isPublic, DbType.Boolean);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<bool> UpdateLobbyDifficulty(int lobbyId, string difficulty)
        {
            var sql = "UPDATE AlgorithmBattleArinaSchema.Lobbies SET Difficulty = @Difficulty WHERE LobbyId = @LobbyId";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);
            parameters.Add("@Difficulty", difficulty, DbType.String);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<bool> DeleteLobby(int lobbyId)
        {
            var sql = "DELETE FROM AlgorithmBattleArinaSchema.Lobbies WHERE LobbyId = @LobbyId";
            
            var parameters = new DynamicParameters();
            parameters.Add("@LobbyId", lobbyId, DbType.Int32);

            return await _dapper.ExecuteSqlAsync(sql, parameters);
        }

        public async Task<IEnumerable<Lobby>> GetOpenLobbies()
        {
            var sql = "SELECT * FROM AlgorithmBattleArinaSchema.Lobbies WHERE Status = 'Open' AND IsPublic = 1";
            var lobbies = await _dapper.LoadDataAsync<Lobby>(sql);
            foreach(var lobby in lobbies)
            {
                var participantsSql = "SELECT * FROM AlgorithmBattleArinaSchema.LobbyParticipants WHERE LobbyId = @LobbyId";
                var participants = await _dapper.LoadDataAsync<LobbyParticipant>(participantsSql, new { LobbyId = lobby.LobbyId });
                lobby.Participants = participants.ToList();
            }
            return lobbies;
        }

        public async Task<Lobby?> GetLobbyById(int lobbyId)
        {
            var sql = "SELECT * FROM AlgorithmBattleArinaSchema.Lobbies WHERE LobbyId = @LobbyId";
            var lobby = await _dapper.LoadDataSingleOrDefaultAsync<Lobby>(sql, new { LobbyId = lobbyId });

            if (lobby != null)
            {
                var participantsSql = "SELECT * FROM AlgorithmBattleArinaSchema.LobbyParticipants WHERE LobbyId = @LobbyId";
                var participants = await _dapper.LoadDataAsync<LobbyParticipant>(participantsSql, new { LobbyId = lobby.LobbyId });
                lobby.Participants = participants.ToList();
            }

            return lobby;
        }
        
        public async Task<Lobby?> GetLobbyByCode(string lobbyCode)
        {
            var sql = "SELECT * FROM AlgorithmBattleArinaSchema.Lobbies WHERE LobbyCode = @LobbyCode";
            var lobby = await _dapper.LoadDataSingleOrDefaultAsync<Lobby>(sql, new { LobbyCode = lobbyCode });

            if (lobby != null)
            {
                var participantsSql = "SELECT * FROM AlgorithmBattleArinaSchema.LobbyParticipants WHERE LobbyId = @LobbyId";
                var participants = await _dapper.LoadDataAsync<LobbyParticipant>(participantsSql, new { LobbyId = lobby.LobbyId });
                lobby.Participants = participants.ToList();
            }

            return lobby;
        }

        public async Task<bool> IsHost(int lobbyId, string email)
        {
            var sql = "SELECT 1 FROM AlgorithmBattleArinaSchema.Lobbies WHERE LobbyId = @LobbyId AND HostEmail = @Email";
            var result = await _dapper.LoadDataSingleOrDefaultAsync<int?>(sql, new { LobbyId = lobbyId, Email = email });
            return result.HasValue;
        }
    }
}
