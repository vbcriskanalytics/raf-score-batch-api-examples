// rafClient.test.js — uses Node's built-in test runner: `node --test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RafClient, RAF_API_URL } from '../src/rafClient.js';

const sampleRequest = {
  model: 'CMS-HCC-V28 Continuing Enrollee',
  factor: 'Community NonDual Aged',
  age: 66,
  gender: 'MALE',
  HCC_Codes: ['E119', 'C61', 'N1832', 'I509', 'J449'],
};

// Real verified 200 response shape from the live API.
const sampleResponse = {
  api_usage_log_id: 439229,
  score: {
    Demographic: {
      'Age and Gender': { MA_Payment: 3453.58, RAF_Score: 0.332 },
    },
    Diagnosis: {
      'HCC 226': { MA_Payment: 3744.84, RAF_Score: 0.36 },
      'HCC 23': { MA_Payment: 1934.84, RAF_Score: 0.186 },
      'HCC 280': { MA_Payment: 3318.35, RAF_Score: 0.319 },
      'HCC 328': { MA_Payment: '1321.10', RAF_Score: 0.127 },
      'HCC 38': { MA_Payment: 1726.79, RAF_Score: 0.166 },
      'HCC Count': { Count: 5, MA_Payment: 520.12, RAF_Score: 0.05 },
    },
    'Disease Interaction': {
      DIABETES_HF: { MA_Payment: 1165.06, RAF_Score: 0.112 },
      HF_CHR_LUNG: { MA_Payment: 811.38, RAF_Score: 0.078 },
      HF_KIDNEY: { MA_Payment: 1830.81, RAF_Score: 0.176 },
    },
    Total: {
      'Grand Total': { MA_Payment: 19826.87, RAF_Score: 1.906 },
      MA_Adjusted: { MA_Payment: 17485.55, RAF_Score: 1.681 },
      Normalized: { MA_Payment: 18581.88, RAF_Score: 1.786 },
    },
  },
  score_cnt: 9,
  status: 'success',
};

test('constructor throws when no API key is available', () => {
  assert.throws(
    () => new RafClient({ apiKey: undefined, fetch: async () => ({}) }),
    /Missing RAF API key/,
  );
});

test('calculate() posts to the getScore endpoint with ApiKey auth and returns JSON', async () => {
  const calls = [];
  const mockFetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleResponse,
    };
  };

  const client = new RafClient({ apiKey: 'test-key', fetch: mockFetch });
  const result = await client.calculate(sampleRequest);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, RAF_API_URL);
  assert.equal(
    calls[0].url,
    'https://restapi.npidataservices.com/raf/api/v1/getScore',
  );
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.ApiKey, 'test-key');
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(
    calls[0].options.headers['Content-Type'],
    'application/json',
  );
  assert.equal(calls[0].options.headers.accept, 'application/json');

  const sentBody = JSON.parse(calls[0].options.body);
  assert.deepEqual(sentBody, sampleRequest);
  assert.equal(sentBody.model, 'CMS-HCC-V28 Continuing Enrollee');
  assert.equal(sentBody.factor, 'Community NonDual Aged');
  assert.equal(sentBody.age, 66);
  assert.equal(sentBody.gender, 'MALE');
  assert.deepEqual(sentBody.HCC_Codes, ['E119', 'C61', 'N1832', 'I509', 'J449']);

  assert.deepEqual(result, sampleResponse);
  assert.equal(result.status, 'success');
  assert.equal(result.score.Total['Grand Total'].RAF_Score, 1.906);
});

test('calculate() throws on non-OK response', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    text: async () => 'invalid key',
  });

  const client = new RafClient({ apiKey: 'bad-key', fetch: mockFetch });
  await assert.rejects(
    () => client.calculate(sampleRequest),
    /RAF API request failed: 401 Unauthorized — invalid key/,
  );
});
