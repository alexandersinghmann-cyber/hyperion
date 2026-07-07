#!/usr/bin/env python3
"""Deploy index.html to GitHub Pages via the GitHub API."""
import base64, json, os, sys, urllib.request, urllib.error

REPO = "alexandersinghmann-cyber/hyperion"
FILE = "index.html"
DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(DIR, ".github-token")
SOURCE = os.path.join(DIR, "index.html")
API = f"https://api.github.com/repos/{REPO}/contents/{FILE}"

def load_token():
    with open(TOKEN_FILE) as f:
        return f.read().strip()

def api_request(url, token, method="GET", data=None, raise_on=()):
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code in raise_on:
            raise  # let the caller retry (e.g. 409 stale-SHA race)
        print(f"HTTP {e.code}: {e.read().decode()}")
        sys.exit(1)

def put_content(token, content_b64, sha):
    return api_request(API, token, method="PUT", raise_on=(409,), data={
        "message": "Update Hyperion",
        "content": content_b64,
        "sha": sha,
    })

def main():
    token = load_token()

    # Read local file
    with open(SOURCE, "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode()

    # Get current SHA and push. A 409 means the remote SHA moved between our
    # GET and PUT (stale-SHA race) — re-fetch the SHA and retry exactly once.
    info = api_request(API, token)
    sha = info["sha"]
    try:
        result = put_content(token, content_b64, sha)
    except urllib.error.HTTPError:
        print("409 (stale SHA) — re-fetching and retrying once...")
        sha = api_request(API, token)["sha"]
        try:
            result = put_content(token, content_b64, sha)
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code} on retry: {e.read().decode()}")
            sys.exit(1)

    new_sha = result.get("content", {}).get("sha", "unknown")
    print(f"Deployed! SHA: {new_sha}")
    print(f"Live at: https://alexandersinghmann-cyber.github.io/hyperion/")

if __name__ == "__main__":
    main()
