# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- **Preferred:** open a private report via GitHub — this repo → **Security** →
  *"Report a vulnerability."*
- **Or email:** `security@ackersonlabs.com`

Include what you found, steps to reproduce, the affected version, and the
impact. We aim to acknowledge within **3 business days** and to keep you posted
through triage and fix. Please allow reasonable time to remediate before public
disclosure.

## Scope

This is an Enclave plugin. It runs sandboxed in a Worker thread with
permission-gated host access, so the most valuable reports show a way to exceed
the plugin's declared permissions, exfiltrate user data, or break sandbox
containment. Vulnerabilities in the Enclave host itself belong in the main
Enclave repository.

## Supported versions

Security fixes target the latest published release. There is no bug-bounty
program at this time — we're grateful for responsible disclosure.
