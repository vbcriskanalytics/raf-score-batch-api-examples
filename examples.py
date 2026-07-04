"""Runnable examples for the RADV Scrubber API (generic sample code).

    pip install -r requirements.txt
    export RADV_API_KEY=your_api_key_here
    python examples.py

The request bodies below are illustrative. Adapt them to the exact payload your
account/docs specify, then re-run.
"""

import json
import os
import sys

from radv_client import API_KEY_ENV, SIGNUP_URL, RadvClient


def main():
    if not os.environ.get(API_KEY_ENV):
        print(f"Set {API_KEY_ENV} first. Get a key at {SIGNUP_URL}")
        sys.exit(0)

    client = RadvClient()

    # 1) Reference data.
    diseases = client.get_diseases()
    print("Supported diseases (truncated):")
    print(json.dumps(diseases, indent=2)[:400], "...")

    # 2) Pull claims for a (synthetic, de-identified) member.
    member_info = {
        "members": [
            {"member_id": "M0001", "gender": "Female", "dob": "1955-04-12", "year": 2026}
        ]
    }
    claims = client.pull_claims(member_info)

    # 3) Scrub the pulled claims for RADV audit readiness.
    scrubbed = client.scrub_claims(claims)
    print("\nScrub result (truncated):")
    print(json.dumps(scrubbed, indent=2)[:600], "...")


if __name__ == "__main__":
    main()
