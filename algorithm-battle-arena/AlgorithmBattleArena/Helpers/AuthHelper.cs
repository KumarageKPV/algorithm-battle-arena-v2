using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace AlgorithmBattleArena.Helpers
{
    public class AuthHelper
    {
        private readonly IConfiguration _config;

        public AuthHelper(IConfiguration config)
        {
            _config = config;
        }

        public byte[] GetPasswordSalt()
        {
            byte[] salt = new byte[16];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(salt);
            return salt;
        }

        public byte[] GetPasswordHash(string password, byte[] salt)
        {

            if (_config == null)
            {
                throw new InvalidOperationException("Configuration is not available!");
            }

            string? passwordKey = Environment.GetEnvironmentVariable("PASSWORD_KEY") ?? 
                                 _config.GetSection("AppSettings:PasswordKey").Value;
            if (string.IsNullOrEmpty(passwordKey))
            {
                throw new InvalidOperationException("PasswordKey is missing from environment variables and configuration!");
            }

            var combinedSalt = Encoding.UTF8.GetBytes(passwordKey).Concat(salt).ToArray();

            return KeyDerivation.Pbkdf2(
                password: password,
                salt: combinedSalt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 32
            );
        }

        public bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            var computedHash = GetPasswordHash(password, storedSalt);
            return computedHash.SequenceEqual(storedHash);
        }

        public string CreateToken(string email, string role, int? userId = null)
        {

            if (_config == null)
            {
                throw new InvalidOperationException("Configuration is not available!");
            }

            string? tokenKeyValue = Environment.GetEnvironmentVariable("TOKEN_KEY") ?? 
                                   _config.GetSection("AppSettings:TokenKey").Value;
            if (string.IsNullOrEmpty(tokenKeyValue))
            {
                throw new InvalidOperationException("TokenKey is missing from environment variables and configuration!");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            if (userId.HasValue)
            {
                string claimType = role switch
                {
                    "Student" => "studentId",
                    "Teacher" => "teacherId",
                    _ => "userId"
                };
                claims.Add(new Claim(claimType, userId.ToString()!));
            }

            var tokenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKeyValue));
            var credentials = new SigningCredentials(tokenKey, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {

            if (_config == null)
            {
                return null;
            }
           
            string? tokenKeyValue = Environment.GetEnvironmentVariable("TOKEN_KEY") ?? 
                                   _config.GetSection("AppSettings:TokenKey").Value;
            if (string.IsNullOrEmpty(tokenKeyValue))
            {
                return null;
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(tokenKeyValue);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };

                return tokenHandler.ValidateToken(token, validationParameters, out _);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
                return null;
            }
        }

        public string? GetClaimValue(ClaimsPrincipal user, params string[] claimTypes)
        {
            foreach (var type in claimTypes)
            {
                var claim = user.FindFirst(type);
                if (claim != null) return claim.Value;
            }
            return null;
        }

        public string? GetEmailFromClaims(ClaimsPrincipal user) =>
            GetClaimValue(user, "email", ClaimTypes.Email, "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");

        public string? GetRoleFromClaims(ClaimsPrincipal user) =>
            GetClaimValue(user, "role", ClaimTypes.Role, "http://schemas.microsoft.com/ws/2008/06/identity/claims/role");

        public int? GetUserIdFromClaims(ClaimsPrincipal user, string role)
        {
            string? claimValue = role switch
            {
                "Student" => GetClaimValue(user, "studentId"),
                "Teacher" => GetClaimValue(user, "teacherId"),
                _ => null
            };
            return int.TryParse(claimValue, out int id) ? id : null;
        }

        public bool ValidateAdminCredentials(string email, string password)
        {
            string? adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? 
                                _config.GetSection("AppSettings:AdminEmail").Value;
            string? adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? 
                                   _config.GetSection("AppSettings:AdminPassword").Value;
            
            return !string.IsNullOrEmpty(adminEmail) && 
                   !string.IsNullOrEmpty(adminPassword) &&
                   email == adminEmail && 
                   password == adminPassword;
        }
    }
}
