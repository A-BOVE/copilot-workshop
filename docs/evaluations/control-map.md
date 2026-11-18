# Control map — GitHub Copilot in our organisation

Status: ✅ enforced · ⚠️ available but not set · ❓ unknown · 🔒 can't see (admin only)

Based on [Lab A1, Steps 3–5](../../labs/a1-models-enterprise-controls/README.md) and the local **VS Code Policy Diagnostics** report generated **2026-11-18 at 09:47:04 UTC** (VS Code 1.146.0). Findings apply to the account and machine captured in that snapshot. Owners below are responsible roles from the lab; named owners still need confirmation. Unknown statuses mean the effective configuration has not been verified.

| Layer | Control | Owner | Status |
|---|---|---|---|
| ① GitHub AI controls | Copilot features (chat, agents, cloud agent, code review) | Enterprise / organisation admins | ❓ partially observed — account entitlements enable chat, CLI and cloud sessions; account policy enables chat agents and preview features. Cloud-agent repository access and code-review policy are not established by this report |
| ① GitHub AI controls | Model availability + "Default availability" for new models | Enterprise / organisation admins; platform team + finance approve model allow-list and budget | ❓ unknown — compare the model picker with Copilot settings; confirm the new-model policy with admins |
| ① GitHub AI controls | MCP servers in Copilot policy | Enterprise / organisation admins | ✅ account policy allows MCP (`mcp: true`); entitlement also enables MCP. Registry configuration and server restrictions remain unknown |
| ① GitHub AI controls | Content exclusion | Enterprise / organisation admins | ❓ unknown — account entitlement reports `copilotignore_enabled: false`; excluded paths/repos and applicable coverage are not shown |
| ① GitHub AI controls | Audit log (agent actions) | Enterprise / organisation admins; security / CISO office owns audit evidence | ❓ unknown — confirm audit access and agent-action evidence (`actor_is_agent`) with admins |
| ① GitHub AI controls | Session sync (`CopilotSessionSync`) | Enterprise / organisation admins | ✅ enforced — account policy sets `chat.sessionSync.enabled` to `false` |
| ② Enterprise-managed settings | `permissions` / `sandbox` | Developer-platform team | ⚠️ available but not set — no active managed settings; runtime reports no managed keys, `bypassPermissionsDisabled: false` and `failClosed: false`; no enterprise-required Agent Host sandbox is active |
| ② Enterprise-managed settings | Default `model` / `fusionTier` | Developer-platform team | ⚠️ available but not set — no active managed-settings sources or keys; no managed model default is supplied |
| ② Enterprise-managed settings | MCP allow / deny lists | Developer-platform team | ⚠️ available but not set — no active managed settings; `ChatAllowedMcpServers`, `ChatDeniedMcpServers` and `ChatAllowManagedMcpServersOnly` are not applied |
| ③ VS Code device policies | ChatAgentMode · ChatToolsAutoApprove · ChatMCP | Device / MDM administrators with the developer-platform team | ⚠️ available but not set — all three appear in the non-applied policy inventory; account policy still allows agents and MCP |
| Repository | preToolUse guardrail hook (`.github/hooks/`) — Step 4 | me (this lab); developer-platform team for template distribution | ⚠️ available but not set — no hook files present in this checkout |
| Repository | Branch ruleset on `main` — Step 5 | me (this lab), as repository admin | ❓ unknown — verify an active `protect-main` ruleset requires a PR and the `Test` check; confirm automatic Copilot review availability |
| Repository | CI check `Test` (`.github/workflows/ci.yml`) | Repository maintainers | ✅ configured — workflow defines `Test` for pushes to `main` and pull requests; latest run and required-check enforcement are unverified |

## Findings and verification

- **Managed-settings evidence:** the report shows no active sources, 0 supplied/effective keys and 0 parse issues. Native MDM and file sources contribute no winning keys; the file parses as `{}`. The server fetch returned HTTP 404 with no successful managed-settings response captured. The independent Copilot runtime snapshot also reports `source: "none"`, no managed keys and no diagnostics.
- **Account and device policy:** 1 policy is applied (`CopilotSessionSync`, from the account, set to `false`); 73 are not applied. A non-applied policy is not proof that its feature is disabled or an enforcement gap. User settings, defaults and account entitlements can still determine behaviour.
- **Account gate and harness:** the account policy gate is inactive because no approved organisations are configured (`ChatApprovedAccountOrganizations` is not set). Account policy values still apply. Chat harness selection is **not enforced**.
- **Scope and remaining unknowns:** the report does not establish the model allow-list, default availability of new models, audit-log configuration, repository rulesets or CI results. Confirm these in GitHub or with admins. Runtime diagnostics exclude session-specific client contributions and policy-helper execution; the readiness check does not establish full runtime policy parity or cover other hosts/providers.
- **Hook:** complete Step 4, pass all 7 unit tests, then verify a live denied edit and the audit log before marking it enforced. If the hook is blocked or does not fire, record that finding here.
- **Ruleset:** verify effective rules with `gh api "repos/{owner}/{repo}/rules/branches/main" --jq '.[].type'`. Expect at least `pull_request` and `required_status_checks`. Record any plan-related enforcement limitation or unavailable Copilot review option.
- **CI:** the workflow runs the public-safety scan, unit/API tests and an application smoke test. Confirm a green `Test` run in Actions; requiring it before merge is the ruleset's responsibility.
- **Defence in depth:** content exclusion is not a guaranteed barrier for agents or the CLI. Instructions are guidance; hooks, permissions, rulesets and CI provide controls.
