"""Minimal client for the RADV Scrubber REST API (generic sample code).

CONTRACT (from the published OpenAPI spec):
    Base URL:  https://restapi.radvscrubber.com
    Auth:      custom header  ApiKey: <RADV_API_KEY>
    Docs:      https://restapi.radvscrubber.com/docs

Endpoints:
    GET  /getDisease                              List supported disease categories
    GET  /getDataset  ?diseaseVal= &valCondition= Reference dataset for a disease/condition
    POST /pullClaims   (JSON: member info)        Pull claims/diagnoses for member(s)
    POST /scrubClaims  (JSON: claims payload)     Scrub diagnoses for RADV audit readiness

RADV (Risk Adjustment Data Validation) scrubbing checks that each HCC-driving diagnosis
on a submitted claim is supported (and would survive a CMS/OIG audit). Use it to flag
unsupported, deletable, or high-risk codes before submission.

This is generic, illustrative sample code — the request bodies below are examples; replace
the placeholder key and adapt the payload/response handling to the live contract.
"""

import os

import requests

BASE_URL = "https://restapi.radvscrubber.com"
SIGNUP_URL = "https://www.vbcriskanalytics.com/radv-scrubber"
API_KEY_ENV = "RADV_API_KEY"


class RadvClient:
    """Small client for the RADV Scrubber API. Returns parsed JSON."""

    def __init__(self, api_key=None, base_url=BASE_URL, timeout=60):
        self.api_key = api_key or os.environ.get(API_KEY_ENV)
        if not self.api_key:
            raise ValueError(
                f"No API key found. Set the {API_KEY_ENV} environment variable. "
                f"Get a key at {SIGNUP_URL}"
            )
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _headers(self, json_body=False):
        h = {"accept": "application/json", "ApiKey": self.api_key}
        if json_body:
            h["Content-Type"] = "application/json"
        return h

    def get_diseases(self):
        """List the supported disease categories."""
        resp = requests.get(
            f"{self.base_url}/getDisease", headers=self._headers(), timeout=self.timeout
        )
        resp.raise_for_status()
        return resp.json()

    def get_dataset(self, disease_val=None, val_condition=None):
        """Reference dataset for a disease / validation condition."""
        params = {k: v for k, v in
                  {"diseaseVal": disease_val, "valCondition": val_condition}.items()
                  if v is not None}
        resp = requests.get(
            f"{self.base_url}/getDataset", params=params,
            headers=self._headers(), timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()

    def pull_claims(self, member_info):
        """Pull claims/diagnoses for a member (POST a member-info JSON body)."""
        resp = requests.post(
            f"{self.base_url}/pullClaims", json=member_info,
            headers=self._headers(json_body=True), timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()

    def scrub_claims(self, claims_payload):
        """Scrub a claims payload for RADV audit readiness (POST JSON)."""
        resp = requests.post(
            f"{self.base_url}/scrubClaims", json=claims_payload,
            headers=self._headers(json_body=True), timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()
