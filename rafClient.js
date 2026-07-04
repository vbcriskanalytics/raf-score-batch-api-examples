// rafClient.js
//
// Thin client for the RAF Score API.
//
// This module centralizes the API contract: the endpoint URL, the
// authentication scheme, and the request/response shape. If the official docs
// differ, update this file only.
//
// VERIFIED-LIVE CONTRACT — see the official API docs for details:
//   https://www.rafscorecalculator.com/raf-score-api
//
//   Endpoint:  POST https://restapi.npidataservices.com/raf/api/v1/getScore
//   Headers:   Content-Type: application/json
//              accept: application/json
//              ApiKey: <RAF_API_KEY>   (custom header, no "Bearer" prefix)
//   Auth key:  read from env RAF_API_KEY — never hardcode.
//
//   Request body fields:
//     model      (string)            e.g. "CMS-HCC-V28 Continuing Enrollee"
//     factor     (string)            e.g. "Community NonDual Aged"
//     age        (int)
//     gender     ("MALE"|"FEMALE")
//     HCC_Codes  (string[])          ICD-10 codes WITHOUT dots, e.g. ["E119"]
//
//   Response: see README for a real verified sample.

/** Single RAF API endpoint (full URL). */
export const RAF_API_URL = 'https://restapi.npidataservices.com/raf/api/v1/getScore';

/** @deprecated Use RAF_API_URL. Retained for backward compatibility. */
export const RAF_API_BASE_URL = RAF_API_URL;

/**
 * @typedef {Object} RafRequest
 * @property {string} model                  e.g. "CMS-HCC-V28 Continuing Enrollee"
 * @property {string} factor                 e.g. "Community NonDual Aged"
 * @property {number} age                    integer
 * @property {'MALE'|'FEMALE'} gender
 * @property {string[]} HCC_Codes            ICD-10 codes WITHOUT dots, e.g. ["E119"]
 */

export class RafClient {
  /**
   * @param {Object} [options]
   * @param {string} [options.apiKey]  Defaults to process.env.RAF_API_KEY.
   * @param {string} [options.baseUrl] Defaults to RAF_API_BASE_URL.
   * @param {typeof fetch} [options.fetch] Injectable fetch (for testing).
   */
  constructor(options = {}) {
    // NEVER hardcode a key. Read it from the environment by default.
    this.apiKey = options.apiKey ?? process.env.RAF_API_KEY;
    this.baseUrl = options.baseUrl ?? RAF_API_URL;
    this.fetch = options.fetch ?? globalThis.fetch;

    if (!this.apiKey) {
      throw new Error(
        'Missing RAF API key. Set the RAF_API_KEY environment variable. ' +
          'Get a key at https://www.rafscorecalculator.com/raf-score-api',
      );
    }
  }

  /**
   * Calculate a RAF score.
   *
   * @param {RafRequest} request  Posted verbatim as the JSON request body.
   * @returns {Promise<object>} Parsed JSON response.
   */
  async calculate(request) {
    const res = await this.fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        // Custom auth header — the API key is sent as-is (no "Bearer" prefix).
        ApiKey: this.apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      let detail = '';
      try {
        detail = await res.text();
      } catch {
        // ignore body read errors
      }
      throw new Error(
        `RAF API request failed: ${res.status} ${res.statusText}` +
          (detail ? ` — ${detail}` : ''),
      );
    }

    return res.json();
  }
}

export default RafClient;
