# Model scorecard — rule R1 (pensionableSalary)

> One run is a sample, not a benchmark. Synthetic data only — never paste secrets or real member data.

| | Model A | Model B |
|---|---|---|
| Model (conversation model label) | gpt-6.1-sol | gpt-5.6-luna |
| Harness · Mode · Permissions | Copilot SDK in VS Code · mode/permissions not recorded | Copilot SDK in VS Code · mode/permissions not recorded |
| Reasoning effort | Not recorded | Not recorded |
| Date | 2026-11-18 | 2026-11-18 |

Compared the two five-case answers in this conversation. Both proposed the same inputs and expected results. The later three-case command was not the scored test set.

## Scores

| Criterion | How to score | Model A | Model B |
|---|---|---|---|
| Correctness verified | Expected values that match the `node -e` output (x / 5) | 5/5 | 5/5 |
| Edge cases found | Which did it cover? franchise boundary · salary cap · part-time · below franchise → 0 · invalid factor (0 or > 1) · negative salary | Franchise boundary; salary cap; part-time; invalid factor (0); negative salary; half-cent rounding | Franchise boundary; salary cap; part-time; invalid factor (0); negative salary; half-cent rounding |
| Hallucinations | Invented functions, parameters, files or rules? List them (none = 👍) | None | None |
| Latency feel | fast / ok / slow | Unavailable: not measured | Unavailable: not measured |
| Cost / credits | Relative cost of the model (supported-models doc) — heavier model = more AI credits | Unavailable: no verified pricing or usage data | Unavailable: no verified pricing or usage data |

Neither answer proposed a below-franchise input, a factor greater than 1, or non-finite inputs. Both explanations matched the implementation.

## Verification output

Executed with Node v26.5.0. Command below passed (exit code 0); all five predictions matched for each model, including error type and exact message. This verifies these examples, not the full application test suite.

```sh
node -e 'import("./api/src/domain/pension.ts").then(({pensionableSalary})=>{const cases=[[17545,1,0],[137801,0.5,60127.5],[17545.25,0.5,0.13],[-1,1,"RangeError: fullTimeSalary must be a non-negative number"],[50000,0,"RangeError: partTimeFactor must be greater than 0 and at most 1"]];for(const model of ["Model A","Model B"]){console.log(model);let passed=0;for(const [s,f,expected] of cases){let actual;try{actual=pensionableSalary(s,f)}catch(e){if(!(e instanceof RangeError))throw e;actual=e.name+": "+e.message}const ok=Object.is(actual,expected);console.log(s,f,actual,ok?"PASS":"FAIL");if(ok)passed++;else process.exitCode=1}console.log(passed+"/"+cases.length+" matched")}})'
```

```text
Model A
17545 1 0 PASS
137801 0.5 60127.5 PASS
17545.25 0.5 0.13 PASS
-1 1 RangeError: fullTimeSalary must be a non-negative number PASS
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1 PASS
5/5 matched
Model B
17545 1 0 PASS
137801 0.5 60127.5 PASS
17545.25 0.5 0.13 PASS
-1 1 RangeError: fullTimeSalary must be a non-negative number PASS
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1 PASS
5/5 matched
```

## Verdict

- For **this kind of task** I would use: either model; this sample shows no correctness winner.
- Because: both gave three accurate explanation bullets and the same five correct edge-case predictions. There is no measured latency or cost evidence to break the tie.
- Would I trust it **without** the `node -e` check? No: exact numeric results, rounding, and error messages should be checked against the implementation.
- To make this a real benchmark I would need: repeated independent runs in fresh sessions (Model B could see Model A's answer here), identical prompts and settings, a broader held-out case set, measured latency and credit usage, and a predefined scoring rubric.
