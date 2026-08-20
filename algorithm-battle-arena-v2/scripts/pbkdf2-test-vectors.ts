/**
 * PBKDF2 Cross-Platform Test Vector Generator
 *
 * This script generates test vectors to verify byte-level compatibility
 * between Node.js crypto.pbkdf2Sync and .NET's KeyDerivation.Pbkdf2.
 *
 * Run this script and compare output against the .NET equivalent.
 * Both must produce identical hex strings for the same inputs.
 *
 * Usage:
 *   npx ts-node scripts/pbkdf2-test-vectors.ts
 *
 * .NET equivalent (run in C# Interactive or a test):
 *   using Microsoft.AspNetCore.Cryptography.KeyDerivation;
 *   var passwordKey = "test_password_key";
 *   var password = "MySecurePassword123!";
 *   var randomSalt = Convert.FromHexString("a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6");
 *   var combinedSalt = Encoding.UTF8.GetBytes(passwordKey).Concat(randomSalt).ToArray();
 *   var hash = KeyDerivation.Pbkdf2(password, combinedSalt, KeyDerivationPrf.HMACSHA256, 100000, 32);
 *   Console.WriteLine(Convert.ToHexString(hash));
 */

import * as crypto from 'crypto';

interface TestVector {
  passwordKey: string;
  password: string;
  saltHex: string;
  expectedHashHex?: string; // Fill in from .NET output for cross-validation
}

const TEST_VECTORS: TestVector[] = [
  {
    passwordKey: 'test_password_key',
    password: 'MySecurePassword123!',
    saltHex: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
  },
  {
    passwordKey: 'another_key_for_testing',
    password: 'SimplePass1',
    saltHex: '00112233445566778899aabbccddeeff',
  },
  {
    passwordKey: '',
    password: 'EmptyKeyTest',
    saltHex: 'ffffffffffffffffffffffffffffffff',
  },
  {
    passwordKey: 'production_key_example_!@#$%^&*()',
    password: 'P@$$w0rd!2024',
    saltHex: 'deadbeefcafebabe1234567890abcdef',
  },
];

function computeHash(passwordKey: string, password: string, saltHex: string): string {
  const passwordKeyBytes = Buffer.from(passwordKey, 'utf8');
  const randomSalt = Buffer.from(saltHex, 'hex');
  const combinedSalt = Buffer.concat([passwordKeyBytes, randomSalt]);

  const hash = crypto.pbkdf2Sync(password, combinedSalt, 100_000, 32, 'sha256');
  return hash.toString('hex').toUpperCase();
}

console.log('=== PBKDF2 Cross-Platform Test Vectors ===');
console.log('Algorithm: PBKDF2-HMAC-SHA256');
console.log('Iterations: 100,000');
console.log('Output length: 32 bytes');
console.log('Salt composition: UTF8(PasswordKey) + RandomSalt');
console.log('');

for (let i = 0; i < TEST_VECTORS.length; i++) {
  const tv = TEST_VECTORS[i];
  const hashHex = computeHash(tv.passwordKey, tv.password, tv.saltHex);

  console.log(`--- Test Vector ${i + 1} ---`);
  console.log(`  PasswordKey:    "${tv.passwordKey}"`);
  console.log(`  Password:       "${tv.password}"`);
  console.log(`  RandomSalt:     ${tv.saltHex}`);
  console.log(`  CombinedSalt:   ${Buffer.concat([Buffer.from(tv.passwordKey, 'utf8'), Buffer.from(tv.saltHex, 'hex')]).toString('hex').toUpperCase()}`);
  console.log(`  Node.js Hash:   ${hashHex}`);

  if (tv.expectedHashHex) {
    const match = hashHex === tv.expectedHashHex.toUpperCase();
    console.log(`  .NET Hash:      ${tv.expectedHashHex.toUpperCase()}`);
    console.log(`  Match:          ${match ? '✅ PASS' : '❌ FAIL'}`);
  } else {
    console.log(`  .NET Hash:      (paste .NET output here to compare)`);
  }
  console.log('');
}

console.log('=== Instructions ===');
console.log('1. Run this script: npx ts-node scripts/pbkdf2-test-vectors.ts');
console.log('2. Run the equivalent C# code with the same inputs');
console.log('3. Compare the hex hashes — they MUST be identical');
console.log('4. If they differ, check:');
console.log('   - PasswordKey encoding (must be UTF-8)');
console.log('   - Salt byte order (passwordKey bytes THEN random salt bytes)');
console.log('   - PBKDF2 PRF (must be HMAC-SHA256, not SHA1 or SHA512)');
console.log('   - Iteration count (must be exactly 100,000)');
console.log('   - Output length (must be exactly 32 bytes)');

