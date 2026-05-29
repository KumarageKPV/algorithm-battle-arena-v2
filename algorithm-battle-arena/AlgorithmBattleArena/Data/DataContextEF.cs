using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System;
using AlgorithmBattleArena.Models;



namespace AlgorithmBattleArena.Data
{
    public class DataContextEF: DbContext
    {
        private readonly IConfiguration _config;
        public DataContextEF(IConfiguration config)
        {
            _config = config;
        }

        public virtual DbSet<Student> Student { get; set; }
        public virtual DbSet<Teacher> Teachers { get; set; }
        public virtual DbSet<Auth> Auth { get; set; }
        public virtual DbSet<AuditLog> AuditLogs { get; set; }
        public virtual DbSet<Problem> Problems { get; set; }
        public virtual DbSet<ProblemTestCase> ProblemTestCases { get; set; }
        
        

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder
                       .UseSqlServer(_config.GetConnectionString("DefaultConnection"),
                       options => options.EnableRetryOnFailure()
                       );
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("AlgorithmBattleArinaSchema");
            modelBuilder.Entity<Auth>().ToTable("Auth", "AlgorithmBattleArinaSchema")
                                       .HasKey(a => a.Email);
            modelBuilder.Entity<Student>().ToTable("Student", "AlgorithmBattleArinaSchema")
                                       .HasKey(u => u.StudentId);
            modelBuilder.Entity<Teacher>().ToTable("Teachers", "AlgorithmBattleArinaSchema")
                                       .HasKey(us => us.TeacherId);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.Auth)
                .WithOne(a => a.Student)
                .HasForeignKey<Student>(s => s.Email)
                .HasPrincipalKey<Auth>(a => a.Email);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.Teacher)
                .WithMany(t => t.Students)
                .HasForeignKey(s => s.TeacherId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.Auth)
                .WithOne(a => a.Teacher)
                .HasForeignKey<Teacher>(t => t.Email)
                .HasPrincipalKey<Auth>(a => a.Email);

            modelBuilder.Entity<AuditLog>().ToTable("AuditLogs", "AlgorithmBattleArinaSchema")
                                       .HasKey(a => a.Id);

            modelBuilder.Entity<Problem>().ToTable("Problems", "AlgorithmBattleArinaSchema")
                                       .HasKey(p => p.ProblemId);

            modelBuilder.Entity<ProblemTestCase>().ToTable("ProblemTestCases", "AlgorithmBattleArinaSchema")
                                       .HasKey(tc => tc.TestCaseId);

            modelBuilder.Entity<ProblemTestCase>()
                .HasOne(tc => tc.Problem)
                .WithMany()
                .HasForeignKey(tc => tc.ProblemId)
                .OnDelete(DeleteBehavior.Cascade);
        }
        
    }       
    
}
