import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const passwordKey = process.env.PASSWORD_KEY;

if (!passwordKey) {
  throw new Error('PASSWORD_KEY is required to seed login users.');
}

function getPasswordSalt() {
  return crypto.randomBytes(16);
}

function getPasswordHash(password: string, salt: Buffer) {
  const combinedSalt = Buffer.concat([Buffer.from(passwordKey!, 'utf8'), salt]);
  return crypto.pbkdf2Sync(password, combinedSalt, 100_000, 32, 'sha256');
}

async function upsertAuthUser(email: string, password: string) {
  const salt = getPasswordSalt();
  const hash = getPasswordHash(password, salt);

  await prisma.auth.upsert({
    where: { email },
    create: {
      email,
      passwordHash: hash,
      passwordSalt: salt,
    },
    update: {
      passwordHash: hash,
      passwordSalt: salt,
    },
  });
}

const teacher = {
  email: 'teacher.seed@arena.local',
  password: 'Teacher123!',
  firstName: 'Maya',
  lastName: 'Perera',
};

const student = {
  email: 'student.seed@arena.local',
  password: 'Student123!',
  firstName: 'Nimal',
  lastName: 'Silva',
};

const problems = [
  {
    title: 'Sum of Two Numbers',
    description: [
      'Given two integers, return their sum.',
      '',
      'Input Format',
      'A single line containing two space-separated integers a and b.',
      '',
      'Output Format',
      'Print a single integer: the sum of a and b.',
      '',
      'Example',
      'Input: 3 5',
      'Output: 8',
      '',
      'Constraints',
      '-10^9 <= a, b <= 10^9',
    ].join('\n'),
    difficultyLevel: 'Easy',
    category: 'Math',
    timeLimit: 1,
    memoryLimit: 128,
    tags: ['math', 'implementation'],
    testCases: [
      { inputData: '3 5\n', expectedOutput: '8\n', isSample: true },
      { inputData: '-4 10\n', expectedOutput: '6\n', isSample: false },
      { inputData: '1000000000 -1\n', expectedOutput: '999999999\n', isSample: false },
    ],
    solutions: [
      {
        language: 'JavaScript',
        solutionText: [
          "const fs = require('fs');",
          "const [a, b] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);",
          'console.log(a + b);',
        ].join('\n'),
      },
    ],
  },
  {
    title: 'Count Vowels',
    description: [
      'Given a lowercase English string, count how many characters are vowels.',
      '',
      'Input Format',
      'A single line containing a string s.',
      '',
      'Output Format',
      'Print a single integer: the number of vowels in s.',
      '',
      'Example',
      'Input: algorithm',
      'Output: 3',
      '',
      'Constraints',
      '1 <= |s| <= 100000',
      's contains only lowercase English letters.',
    ].join('\n'),
    difficultyLevel: 'Easy',
    category: 'String',
    timeLimit: 1,
    memoryLimit: 128,
    tags: ['string', 'counting'],
    testCases: [
      { inputData: 'algorithm\n', expectedOutput: '3\n', isSample: true },
      { inputData: 'bcdfg\n', expectedOutput: '0\n', isSample: false },
      { inputData: 'aeiouaeiou\n', expectedOutput: '10\n', isSample: false },
    ],
    solutions: [
      {
        language: 'JavaScript',
        solutionText: [
          "const fs = require('fs');",
          "const s = fs.readFileSync(0, 'utf8').trim();",
          "let count = 0;",
          "for (const ch of s) if ('aeiou'.includes(ch)) count++;",
          'console.log(count);',
        ].join('\n'),
      },
    ],
  },
  {
    title: 'Longest Increasing Streak',
    description: [
      'Given an array of integers, find the length of the longest contiguous strictly increasing streak.',
      '',
      'Input Format',
      'The first line contains an integer n.',
      'The second line contains n space-separated integers.',
      '',
      'Output Format',
      'Print a single integer: the maximum length of a contiguous strictly increasing streak.',
      '',
      'Example',
      'Input:',
      '6',
      '1 2 2 3 4 1',
      'Output: 3',
      '',
      'Constraints',
      '1 <= n <= 200000',
      '-10^9 <= ai <= 10^9',
    ].join('\n'),
    difficultyLevel: 'Medium',
    category: 'Array',
    timeLimit: 2,
    memoryLimit: 256,
    tags: ['array', 'linear-scan'],
    testCases: [
      { inputData: '6\n1 2 2 3 4 1\n', expectedOutput: '3\n', isSample: true },
      { inputData: '5\n5 4 3 2 1\n', expectedOutput: '1\n', isSample: false },
      { inputData: '7\n1 2 3 4 5 6 7\n', expectedOutput: '7\n', isSample: false },
    ],
    solutions: [
      {
        language: 'JavaScript',
        solutionText: [
          "const fs = require('fs');",
          "const nums = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);",
          'const n = nums[0];',
          'const arr = nums.slice(1, n + 1);',
          'let best = 1;',
          'let current = 1;',
          'for (let i = 1; i < n; i++) {',
          '  if (arr[i] > arr[i - 1]) current++;',
          '  else current = 1;',
          '  if (current > best) best = current;',
          '}',
          'console.log(best);',
        ].join('\n'),
      },
    ],
  },
];

async function upsertProblem(problem: (typeof problems)[number]) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.problem.findFirst({ where: { title: problem.title } });
    const saved = existing
      ? await tx.problem.update({
          where: { problemId: existing.problemId },
          data: {
            description: problem.description,
            difficultyLevel: problem.difficultyLevel,
            category: problem.category,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            createdBy: teacher.email,
            tags: JSON.stringify(problem.tags),
          },
        })
      : await tx.problem.create({
          data: {
            title: problem.title,
            description: problem.description,
            difficultyLevel: problem.difficultyLevel,
            category: problem.category,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            createdBy: teacher.email,
            tags: JSON.stringify(problem.tags),
          },
        });

    await tx.problemTestCase.deleteMany({ where: { problemId: saved.problemId } });
    await tx.problemSolution.deleteMany({ where: { problemId: saved.problemId } });

    await tx.problemTestCase.createMany({
      data: problem.testCases.map((testCase) => ({
        problemId: saved.problemId,
        inputData: testCase.inputData,
        expectedOutput: testCase.expectedOutput,
        isSample: testCase.isSample,
      })),
    });

    await tx.problemSolution.createMany({
      data: problem.solutions.map((solution) => ({
        problemId: saved.problemId,
        language: solution.language,
        solutionText: solution.solutionText,
      })),
    });
  });
}

async function main() {
  await upsertAuthUser(teacher.email, teacher.password);
  const savedTeacher = await prisma.teacher.upsert({
    where: { email: teacher.email },
    create: {
      email: teacher.email,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      active: true,
    },
    update: {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      active: true,
    },
  });

  await upsertAuthUser(student.email, student.password);
  await prisma.student.upsert({
    where: { email: student.email },
    create: {
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      teacherId: savedTeacher.teacherId,
      active: true,
    },
    update: {
      firstName: student.firstName,
      lastName: student.lastName,
      teacherId: savedTeacher.teacherId,
      active: true,
    },
  });

  for (const problem of problems) {
    await upsertProblem(problem);
  }

  console.log('Seed complete');
  console.log(`Teacher: ${teacher.email} / ${teacher.password}`);
  console.log(`Student: ${student.email} / ${student.password}`);
  console.log(`Problems: ${problems.map((problem) => problem.title).join(', ')}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
