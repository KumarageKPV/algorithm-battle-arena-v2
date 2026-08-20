/**
 * MSSQL → PostgreSQL Data Migration Script
 *
 * Transfers all rows from the existing MSSQL database to PostgreSQL
 * in FK-dependency order. PasswordHash and PasswordSalt are transferred
 * as raw Buffer objects (VARBINARY → BYTEA), not hex strings.
 *
 * Prerequisites:
 *   npm install mssql pg
 *
 * Usage:
 *   MSSQL_CONNECTION="Server=...;Database=AlgorithmBattleArina;..." \
 *   DATABASE_URL="postgresql://postgres:dev@localhost:5432/algorithm_battle_arena" \
 *   npx ts-node scripts/migrate-data.ts
 */

console.log('=== MSSQL → PostgreSQL Data Migration ===');
console.log('');
console.log('This script will:');
console.log('1. Connect to MSSQL (source) and PostgreSQL (target)');
console.log('2. Transfer all 16 tables in FK-dependency order:');
console.log('   Auth → Teachers → Student → Problems → ProblemTestCases →');
console.log('   ProblemSolutions → Lobbies → LobbyParticipants → Matches →');
console.log('   MatchProblems → Submissions → StudentTeacherRequests →');
console.log('   Friends → FriendRequests → Conversations →');
console.log('   ConversationParticipants → Messages → AuditLog');
console.log('3. Transfer PasswordHash/PasswordSalt as raw buffers');
console.log('4. Reset PostgreSQL identity sequences');
console.log('5. Verify row counts match');
console.log('');
console.log('To implement, install: npm install mssql pg');
console.log('Then uncomment and configure the migration logic below.');
console.log('');

// ─── Migration Implementation Skeleton ─────────────────────────────
//
// import * as mssql from 'mssql';
// import { Client } from 'pg';
//
// const TABLES_IN_ORDER = [
//   { mssql: 'AlgorithmBattleArinaSchema.Auth', pg: 'auth',
//     columns: ['email', 'password_hash', 'password_salt'],
//     binaryColumns: ['password_hash', 'password_salt'] },
//   { mssql: 'AlgorithmBattleArinaSchema.Teachers', pg: 'teachers',
//     columns: ['teacher_id', 'first_name', 'last_name', 'email', 'active'],
//     identityColumn: 'teacher_id' },
//   { mssql: 'AlgorithmBattleArinaSchema.Student', pg: 'student',
//     columns: ['student_id', 'first_name', 'last_name', 'email', 'teacher_id', 'active'],
//     identityColumn: 'student_id' },
//   // ... continue for all 16 tables
// ];
//
// async function migrate() {
//   const mssqlPool = await mssql.connect(process.env.MSSQL_CONNECTION!);
//   const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
//   await pgClient.connect();
//
//   for (const table of TABLES_IN_ORDER) {
//     const rows = await mssqlPool.query(`SELECT * FROM ${table.mssql}`);
//     console.log(`Migrating ${table.pg}: ${rows.recordset.length} rows`);
//
//     for (const row of rows.recordset) {
//       // Handle binary columns (PasswordHash/PasswordSalt)
//       // Transfer as Buffer objects directly — PostgreSQL BYTEA accepts Buffer
//       // INSERT INTO pg table with parameterized query
//     }
//
//     // Reset identity sequence
//     if (table.identityColumn) {
//       await pgClient.query(
//         `SELECT setval(pg_get_serial_sequence('${table.pg}', '${table.identityColumn}'),
//          COALESCE((SELECT MAX(${table.identityColumn}) FROM ${table.pg}), 0) + 1, false)`
//       );
//     }
//   }
//
//   // Verification
//   for (const table of TABLES_IN_ORDER) {
//     const mssqlCount = await mssqlPool.query(`SELECT COUNT(*) as cnt FROM ${table.mssql}`);
//     const pgCount = await pgClient.query(`SELECT COUNT(*) as cnt FROM ${table.pg}`);
//     const match = mssqlCount.recordset[0].cnt === parseInt(pgCount.rows[0].cnt);
//     console.log(`${table.pg}: MSSQL=${mssqlCount.recordset[0].cnt} PG=${pgCount.rows[0].cnt} ${match ? '✅' : '❌'}`);
//   }
//
//   await mssqlPool.close();
//   await pgClient.end();
// }
//
// migrate().catch(console.error);

