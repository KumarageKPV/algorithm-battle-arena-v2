export const PLAYERS = [
  { id: 1, name: "Aurelia Vance", handle: "aurelia.v", tier: "Diamond II", xp: 8420, streak: 12, wins: 142, country: "PT", rating: 2418 },
  { id: 2, name: "Kenji Park", handle: "kenj1", tier: "Diamond I", xp: 9120, streak: 7, wins: 168, country: "KR", rating: 2487 },
  { id: 3, name: "Mira Okafor", handle: "mira.ok", tier: "Platinum III", xp: 6240, streak: 4, wins: 96, country: "NG", rating: 2204 },
  { id: 4, name: "Leon Hartwell", handle: "leon.h", tier: "Diamond III", xp: 7810, streak: 9, wins: 121, country: "UK", rating: 2351 },
  { id: 5, name: "Sana Aslam", handle: "s.aslam", tier: "Platinum II", xp: 5870, streak: 3, wins: 84, country: "PK", rating: 2147 },
  { id: 6, name: "Theo Marchetti", handle: "theo.m", tier: "Master", xp: 11240, streak: 21, wins: 214, country: "IT", rating: 2612 },
  { id: 7, name: "Noor Haddad", handle: "noor", tier: "Diamond II", xp: 8120, streak: 6, wins: 137, country: "AE", rating: 2402 },
  { id: 8, name: "Yuki Watanabe", handle: "yuki.w", tier: "Platinum I", xp: 6710, streak: 5, wins: 109, country: "JP", rating: 2271 },
];

export const LOBBIES = [
  { id: "lb-1", title: "Sunset 1v1: Two Sum Showdown", mode: "1v1", challenge: "Two-Pointer Drift", difficulty: "Easy", language: "Python", joined: 2, capacity: 2, status: "Live", host: "Theo M." },
  { id: "lb-2", title: "Graph Wars: Bridges & Cuts", mode: "Team 3v3", challenge: "Articulation Run", difficulty: "Hard", language: "C++", joined: 4, capacity: 6, status: "Open", host: "Aurelia V." },
  { id: "lb-3", title: "Daily Drill — DP Sprint", mode: "Solo", challenge: "Knapsack Rerolled", difficulty: "Medium", language: "Any", joined: 18, capacity: 32, status: "Open", host: "System" },
  { id: "lb-4", title: "Heap Heist", mode: "1v1", challenge: "Top-K Frequent", difficulty: "Medium", language: "JS/TS", joined: 1, capacity: 2, status: "Open", host: "Mira O." },
  { id: "lb-5", title: "Recursion Rumble", mode: "Team 2v2", challenge: "Tower Splitter", difficulty: "Hard", language: "Go", joined: 3, capacity: 4, status: "Filling", host: "Leon H." },
  { id: "lb-6", title: "Greedy Mornings", mode: "Solo", challenge: "Interval Cull", difficulty: "Easy", language: "Python", joined: 6, capacity: 16, status: "Open", host: "System" },
];

export const TEST_CASES = [
  { id: 1, name: "Sample · single edge", status: "pass", time: "12ms" },
  { id: 2, name: "Sample · disconnected nodes", status: "pass", time: "14ms" },
  { id: 3, name: "Edge · 1 element", status: "pass", time: "9ms" },
  { id: 4, name: "Stress · 10⁵ nodes", status: "pending", time: "—" },
  { id: 5, name: "Hidden · cycles", status: "fail", time: "—" },
  { id: 6, name: "Hidden · sparse graph", status: "pending", time: "—" },
];

export const COUNTRIES: Record<string, string> = {
  PT: "🇵🇹", KR: "🇰🇷", NG: "🇳🇬", UK: "🇬🇧", PK: "🇵🇰", IT: "🇮🇹", AE: "🇦🇪", JP: "🇯🇵", US: "🇺🇸", BR: "🇧🇷",
};

export const STUDENTS = [
  { id: 1, name: "Aurelia Vance", email: "aurelia@school.edu", cohort: "CS204-A", status: "Online", rating: 2418, last: "2m ago", risk: "low" },
  { id: 2, name: "Kenji Park", email: "kenji@school.edu", cohort: "CS204-A", status: "Online", rating: 2487, last: "just now", risk: "low" },
  { id: 3, name: "Mira Okafor", email: "mira@school.edu", cohort: "CS204-B", status: "Offline", rating: 2204, last: "yesterday", risk: "medium" },
  { id: 4, name: "Leon Hartwell", email: "leon@school.edu", cohort: "CS204-A", status: "In match", rating: 2351, last: "now", risk: "low" },
  { id: 5, name: "Sana Aslam", email: "sana@school.edu", cohort: "CS204-B", status: "Online", rating: 2147, last: "5m ago", risk: "low" },
  { id: 6, name: "Devon Hill", email: "devon@school.edu", cohort: "CS204-B", status: "Offline", rating: 1840, last: "3d ago", risk: "high" },
  { id: 7, name: "Noor Haddad", email: "noor@school.edu", cohort: "CS204-A", status: "Online", rating: 2402, last: "1m ago", risk: "low" },
  { id: 8, name: "Yuki Watanabe", email: "yuki@school.edu", cohort: "CS204-B", status: "Online", rating: 2271, last: "30s ago", risk: "low" },
];
