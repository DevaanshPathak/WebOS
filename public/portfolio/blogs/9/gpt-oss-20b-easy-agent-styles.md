---
title: "GPT-OSS 20B on SRE-Zero Easy: ReAct Helps, Resolution Still Fails Often"
description: "A managed-run report comparing plain prompting, ReAct, and guided open-source-agent control for GPT-OSS 20B on the SRE-Zero easy split."
date: "2026-06-16"
tags: ["SRE-Zero", "LLM Agents", "Evaluation", "Benchmarking"]
---

# GPT-OSS 20B on SRE-Zero Easy: ReAct Helps, Resolution Still Fails Often

This post reports a small managed run from **SRE-Zero**, using `openai/gpt-oss-20b:free` on the easy task split.

The goal is not to publish a broad model leaderboard. The goal is narrower: hold one model fixed and compare three agent-control styles under the same deterministic incident-response environment.

The run compares:

- a random baseline
- a scripted expert baseline
- plain open-source-agent prompting
- ReAct-style open-source-agent control
- guided open-source-agent control, which adds lightweight action validation and sequencing constraints

The run was created and executed through the SRE-Zero managed-run TUI. The raw JSON outputs, summaries, command files, and logs are included with this post under `artifacts/`, `commands/`, and `logs/`.

Important caveat: this is an easy-split, single-seed, one-episode-per-task LLM run. It is useful for validating the benchmark and comparing agent-control behavior, not for final model ranking.

![Standardized marks by baseline and GPT-OSS 20B agent style.](assets/marks_by_agent.png)

---

## Run setup

The managed run was:

```text
run id: blog-gpt-oss-20b-easy-agent-styles-2026-06-15
difficulty: easy
seed: 0
LLM episodes per task: 1
deterministic episodes per task: 5
target steps: 8.0
model: openai/gpt-oss-20b:free
```

The LLM request settings were conservative because the provider has shown transient failures and rate-limit behavior during longer benchmark sweeps:

```text
timeout seconds: 30.0
max tokens: 1536
max retries: 5
minimum request interval: 15.0 seconds
rate limit: 5 requests per 60.0 seconds
cooldown: 60.0 seconds after 3 consecutive rejected requests
reasoning excluded: true
```

All five targets completed. No target ended with an agent-level runtime error.

---

## Result table

| Baseline | Model | Marks | Success | Reward | Evidence | Root cause | Fix ID | Correct fix | Premature | Wrong fix | Errors |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Random | `deterministic/random` | 5.7 | 0.0% | 0.005 | 4.8% | 1.8% | 1.8% | 7.3% | 60.0% | 87.5% | 0 |
| Scripted expert | `deterministic/scripted` | 93.2 | 100.0% | 0.941 | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0 |
| Plain GPT-OSS | `openai/gpt-oss-20b:free` | 18.2 | 0.0% | 0.044 | 60.6% | 9.1% | 0.0% | 36.4% | 9.1% | 20.0% | 0 |
| ReAct GPT-OSS | `openai/gpt-oss-20b:free` | 43.1 | 36.4% | 0.314 | 74.2% | 63.6% | 54.5% | 63.6% | 45.5% | 70.8% | 0 |
| Guided GPT-OSS | `openai/gpt-oss-20b:free` | 29.5 | 9.1% | 0.229 | 74.2% | 72.7% | 18.2% | 63.6% | 72.7% | 66.7% | 0 |

The scripted expert remains the sanity-check upper bound and the random baseline remains the floor. That confirms this run is measuring agent behavior on a working task suite rather than a broken evaluation harness.

Among the GPT-OSS 20B variants, **ReAct GPT-OSS** had the highest standardized score: **43.1 marks** with **36.4% success**. Plain prompting scored **18.2 marks** with **0.0% success**. ReAct scored **43.1 marks**, and the guided variant scored **29.5 marks**.

![Grouped partial-credit metrics for the easy split.](assets/core_metrics.png)

---

## What the partial metrics show

The main benchmark signal is still that evidence gathering, diagnosis, remediation, and final resolution are separable.

The best GPT-OSS 20B variant reached:

- **74.2% evidence coverage**
- **63.6% root-cause identification**
- **63.6% correct-remediation rate**
- **36.4% final success**

That gap matters. The model often inspected useful state and sometimes touched the right fix path, but did not reliably convert that into a correct terminal incident resolution.

For this run, the interesting behavior is not invalid tool formatting. Invalid-action rates were low across the LLM variants. The harder failure is deciding when the incident is actually resolved and submitting the exact expected root cause and fix.

---

## Failure modes

![Stacked failure-mode chart for GPT-OSS 20B agent variants.](assets/failure_modes.png)

The most useful failures were benchmark-level failures rather than harness crashes: wrong remediation, premature resolution, and step-budget exhaustion.

This is the kind of failure profile SRE-Zero is meant to expose. A model can gather evidence and still fail the incident because it stops too early, applies the wrong fix, or never submits the correct final resolution.

---

## Task-level view

![Task-level success matrix for plain, ReAct, and guided GPT-OSS 20B.](assets/task_success_matrix.png)

| Task | Plain GPT-OSS | ReAct GPT-OSS | Guided GPT-OSS |
|---|---:|---:|---:|
| `cache_crash` | step_budget_exhausted (0.000) | success (0.938) | success (0.883) |
| `web_worker_crash` | step_budget_exhausted (0.000) | success (0.883) | premature_or_incorrect_resolution (0.433) |
| `database_disk_full` | step_budget_exhausted (0.000) | premature_or_incorrect_resolution (0.250) | premature_or_incorrect_resolution (0.100) |
| `cache_memory_pressure` | step_budget_exhausted (0.000) | success (0.600) | premature_or_incorrect_resolution (0.200) |
| `message_queue_crash` | step_budget_exhausted (0.133) | premature_or_incorrect_resolution (0.100) | premature_or_incorrect_resolution (0.183) |
| `load_balancer_health_check_misconfig` | step_budget_exhausted (0.033) | step_budget_exhausted (0.033) | step_budget_exhausted (0.000) |
| `message_queue_backlog_consumers_low` | step_budget_exhausted (0.000) | premature_or_incorrect_resolution (0.000) | premature_or_incorrect_resolution (0.000) |
| `web_server_memory_leak_restart` | step_budget_exhausted (0.133) | success (0.383) | premature_or_incorrect_resolution (0.283) |
| `database_maintenance_mode_left_on` | step_budget_exhausted (0.183) | premature_or_incorrect_resolution (0.150) | premature_or_incorrect_resolution (0.433) |
| `cache_auth_token_expired` | step_budget_exhausted (0.000) | step_budget_exhausted (0.000) | step_budget_exhausted (0.000) |
| `load_balancer_tls_cert_expired` | premature_or_incorrect_resolution (0.000) | premature_or_incorrect_resolution (0.117) | premature_or_incorrect_resolution (0.000) |

The task table is useful because it shows where control style matters. The same underlying model can succeed, fail by budget, or fail by final resolution depending on the loop around it.

---

## Provider health

![Provider request health chart for the three GPT-OSS 20B variants.](assets/provider_health.png)

| Baseline | Requests | Successes | Retried failures | Cooldowns |
|---|---:|---:|---:|---:|
| Plain GPT-OSS | 90 | 88 | 2 | 0 |
| ReAct GPT-OSS | 69 | 69 | 0 | 0 |
| Guided GPT-OSS | 74 | 73 | 1 | 0 |

There were **3 retryable provider failures** across the LLM targets and **0 cooldown events**. The managed runner retained the completed artifacts and all targets reached a final output, so this run is publishable as a diagnostic rather than a provider-failure report.

---

## Attached artifacts

The blog folder includes the source artifacts needed to inspect the run:

- [combined summary](artifacts/combined_summary.json)
- [marks table JSON](artifacts/marks_table.json)
- [marks table CSV](artifacts/marks_table.csv)
- [task outcomes JSON](artifacts/task_outcomes.json)
- [failure modes JSON](artifacts/failure_modes.json)
- [provider health JSON](artifacts/provider_health.json)
- [run config](artifacts/run.json)
- [raw output JSON files](artifacts/json/outputs/)
- [target summary JSON files](artifacts/json/target_summaries/)
- [command files](commands/)
- [run logs and console logs](logs/)

---

## Takeaway

This run supports the current SRE-Zero thesis: reliable incident-response agents need more than the ability to inspect evidence. They need to decide when enough evidence has been gathered, apply the minimal correct remediation, and then submit a precise resolution under a step budget.

On this easy split, GPT-OSS 20B shows useful partial progress, but the gap to the scripted expert remains large. That gap is the point of the benchmark: it makes the difference between tool use, evidence gathering, remediation, and final incident closure visible.
