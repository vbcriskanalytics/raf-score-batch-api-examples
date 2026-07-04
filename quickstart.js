// quickstart.js — runnable example for the RAF Score API.
//
// Usage:
//   export RAF_API_KEY=your_api_key_here
//   npm start
//
// Uses the docs' example codes only (not PHI). Prints the full raw response.

// Optional: load a local .env if dotenv is installed (devDependency).
// Safe to skip if dotenv is not present.
try {
  await import('dotenv/config');
} catch {
  // dotenv not installed — rely on real environment variables.
}

import { RafClient } from '../src/rafClient.js';

const SIGNUP_URL = 'https://www.rafscorecalculator.com/raf-score-api';

if (!process.env.RAF_API_KEY) {
  console.error('Missing RAF_API_KEY environment variable.');
  console.error('Set it before running, e.g.:');
  console.error('  export RAF_API_KEY=your_api_key_here');
  console.error(`Get a RAF API key at: ${SIGNUP_URL}`);
  process.exit(1);
}

// Example request body — uses the docs' example HCC codes (not PHI).
// HCC_Codes are ICD-10 codes WITHOUT dots.
const request = {
  model: 'CMS-HCC-V28 Continuing Enrollee',
  factor: 'Community NonDual Aged',
  age: 66,
  gender: 'MALE',
  HCC_Codes: ['E119', 'C61', 'N1832', 'I509', 'J449'],
};

const client = new RafClient();

try {
  const result = await client.calculate(request);
  console.log('RAF API response:');
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error('Request failed:', err.message);
  console.error(`If you do not have a key yet, sign up at: ${SIGNUP_URL}`);
  process.exit(1);
}
