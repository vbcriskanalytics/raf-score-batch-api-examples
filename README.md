# radv-scrubber-examples

Generic, runnable Python sample code for the **RADV Scrubber REST API** — pull a member's
diagnoses and **scrub** them for **RADV (Risk Adjustment Data Validation)** audit readiness,
flagging HCC-driving codes that may be unsupported, deletable, or high-risk before you
submit to CMS. Useful for **pre-submission RADV scrubbing**, OIG-audit defense, and coding
QA pipelines.

Built and maintained by [VBC Risk Analytics](https://www.vbcriskanalytics.com/radv-scrubber).

## Get an API key

Sign up on the **[RADV Scrubber](https://www.vbcriskanalytics.com/radv-scrubber)** product page.
Interactive docs (Swagger UI): https://restapi.radvscrubber.com/docs

## Quickstart

```bash
pip install -r requirements.txt
export RADV_API_KEY=your_api_key_here
python examples.py
```

If `RADV_API_KEY` is not set, the script prints a friendly message pointing to the sign-up URL.

## Contract

- **Base URL:** `https://restapi.radvscrubber.com`
- **Auth:** custom header `ApiKey: <key>` (a missing/invalid key returns `{"detail":"Invalid or missing API Key"}`).

| Endpoint | Method | Purpose |
|---|---|---|
| `/getDisease` | `GET` | List supported disease categories |
| `/getDataset` | `GET` | Reference dataset (`?diseaseVal=&valCondition=`) |
| `/pullClaims` | `POST` | Pull claims/diagnoses for member(s) (JSON body) |
| `/scrubClaims` | `POST` | Scrub diagnoses for RADV audit readiness (JSON body) |

### Example request

```bash
curl 'https://restapi.radvscrubber.com/getDisease' \
  -H 'accept: application/json' \
  -H "ApiKey: $RADV_API_KEY"
```

> This repository ships **generic illustrative sample code**. The `pullClaims` / `scrubClaims`
> request bodies in `examples.py` are placeholders — adapt them to the exact payload your
> account/docs specify. Use **synthetic, de-identified data only — no PHI.**

## Security

Never commit a real key. The client reads `RADV_API_KEY` from the environment; `.env` is
git-ignored — only `.env.example` (a placeholder) is committed.

---
Maintained by VBC Risk Analytics. Disclosure: we build the RADV Scrubber. Educational only —
not coding, billing, or clinical advice; verify against the current CMS RADV guidance and the
[API docs](https://restapi.radvscrubber.com/docs).
