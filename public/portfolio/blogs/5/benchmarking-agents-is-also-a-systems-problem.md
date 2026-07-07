---
title: "Benchmarking Agents Is Also a Systems Problem"
description: "Why I paused SRE-Zero's 40-task open-weight sweep and added retries, cooldowns, checkpoints, pause, and resume before publishing larger model results."
date: "2026-06-06"
tags: ["SRE-Zero", "LLM Agents", "Evaluation", "AI Systems"]
---

# Benchmarking Agents Is Also a Systems Problem

I recently tried to run a broader open-weight model sweep for **SRE-Zero**, the simulated incident-response benchmark I am building for reliable tool-using agents.

The plan was straightforward:

- run the expanded 40-task suite
- compare several open-weight models
- keep the environment deterministic
- publish the results with JSON records, plots, and task-level breakdowns

But I am not publishing that 40-task sweep as a leaderboard yet.

The reason is simple: the run started measuring provider reliability more than model behavior.

That is not a good benchmark result. It is a systems problem.

---

## Supporting artifacts

- [Evaluation harness policy JSON](/blog-assets/5/artifacts/eval_harness_policy.json)
- [Pause and resume command notes](/blog-assets/5/pause_resume_commands.md)

---

## What I tried

The current SRE-Zero environment has grown beyond the first small task suite.

The expanded benchmark includes:

- 40 deterministic incident-response tasks
- 5 simulated services: `web_server`, `database`, `cache`, `message_queue`, and `load_balancer`
- easy, medium, and hard tasks
- structured actions such as `inspect_logs`, `inspect_metrics`, `check_status`, `update_config`, and `resolve_incident`
- partial-credit rewards
- metrics for success, reward, evidence coverage, invalid actions, wrong fixes, and distractor failures

The deterministic baselines worked as expected.

The scripted expert remained near the upper bound. The random baseline remained near the floor. That is a useful sanity check: the environment itself was not the bottleneck.

The issue appeared when running the API-backed open-weight baselines.

---

## What went wrong

Several provider-backed model runs had repeated transient failures:

- request errors
- timeout behavior
- rate limits
- unavailable free endpoints
- runs that returned no usable action for many tasks

Some models did produce useful partial behavior. For example, in one easy-split screen, `openai/gpt-oss-20b:free` gathered some evidence and scored above random. But many other model rows mostly reflected failed provider calls.

That makes the result hard to interpret.

If a model gets 0 success because it inspected the wrong logs and applied the wrong fix, that is a benchmark signal.

If a model gets 0 success because most provider requests failed before the agent produced an action, that is a provider artifact.

Those two cases should not be mixed into one leaderboard.

---

## Why I am not publishing the 40-task sweep as rankings

It would be easy to publish the table anyway. There are numbers. There are JSON records. There are plots.

But a table is not automatically a result.

For a model comparison to be useful, the measurement path has to be stable enough that the score mostly reflects model behavior. In this run, too many rows were dominated by provider availability and rate limiting.

So I am treating the failed 40-task sweep as a benchmark infrastructure lesson, not as a model-ranking result.

The current conclusion is:

**Provider failures are an evaluation artifact, not model capability.**

That distinction matters for SRE-Zero because the benchmark is specifically about reliability. If the evaluation harness itself cannot tolerate long-running provider-backed sweeps, then model results will be noisy no matter how clean the environment is.

---

## What changed in the evaluation harness

I added a more conservative runner for API-backed baselines.

The current provider-safe policy is:

- retry failed provider requests up to 5 times
- wait at least 15 seconds between provider calls
- send no more than 5 provider calls per 60 seconds
- if 3 provider requests fail in a row, pause for 60 seconds
- write per-run JSON checkpoints
- support `--resume`
- support a pause file at `notes/runs/pause.flag`

This changes the benchmark workflow.

Previously, a long run was mostly all-or-nothing. If the provider became unstable or I needed to stop the machine, the run could be interrupted awkwardly.

Now the runner can write intermediate records and continue later.

For example, a long run can be launched with:

```powershell
python eval/run_all_eval.py `
  --resume `
  --pause-file notes/runs/pause.flag `
  --only-baselines open_source `
  --llm-episodes 1 `
  --timeout-seconds 30 `
  --llm-max-retries 5 `
  --llm-min-request-interval-seconds 15 `
  --llm-rate-limit-requests 5 `
  --llm-rate-limit-window-seconds 60 `
  --llm-rejection-pause-threshold 3 `
  --llm-rejection-pause-seconds 60
```

And from another terminal, I can request a clean pause with:

```powershell
New-Item -ItemType File -Force notes\runs\pause.flag
```

The runner stops before the next task or model checkpoint, writes partial JSON, and can continue later after removing the pause file:

```powershell
Remove-Item notes\runs\pause.flag -ErrorAction SilentlyContinue
```

This is not glamorous work, but it is necessary.

---

## Why this matters for agent benchmarks

Agent evaluation is not just prompts and scores.

For tool-using agents, the measurement system includes:

- the environment
- the task suite
- the action parser
- the reward function
- the provider client
- timeout policy
- retry policy
- rate-limit policy
- logging
- checkpointing
- artifact storage

If any of those pieces are unstable, the final score becomes harder to trust.

This is especially true for long-running environment benchmarks. A 40-task suite with multi-step agents can require many provider calls per model. Even when each individual task is small, the full sweep becomes a systems workload.

That workload needs basic operational discipline:

- do not overload the provider
- record partial progress
- resume after interruption
- separate provider errors from invalid agent actions
- avoid turning transient infrastructure failures into model rankings

This is the same lesson SRE-Zero is trying to test inside the simulated environment. Reliable behavior depends on more than the final answer.

The evaluator itself also has to be reliable.

---

## What I learned from the failed sweep

The failed open-weight sweep was still useful.

It showed that:

- the deterministic environment can run the 40-task suite
- random and scripted baselines remain useful anchors
- provider-backed open-weight runs need stricter rate control
- task-level plots are misleading when many cells represent provider failure
- evidence coverage remains a better diagnostic signal than success alone
- a publishable leaderboard needs a more stable inference backend

The most important product of the run was not a model table. It was a better evaluation harness.

That is progress, even if it is not the kind of progress that fits neatly into a leaderboard.

---

## What I am doing next

I am pausing the public 40-task model-ranking post until I can run the suite through a more stable provider path.

The next stable sweep will likely use Bedrock. The goal is not just to get higher scores. The goal is to make sure the provider path is consistent enough that model comparisons are meaningful.

The next results post should include:

- the 40-task suite
- deterministic random and scripted anchors
- a stable model set
- explicit retry and timeout policy
- provider-error counts
- task-level success
- evidence coverage
- wrong remediation rate
- invalid action rate
- clear limitations

Until then, I do not want to pretend that a noisy provider-limited run is a benchmark result.

---

## Closing

The current goal of SRE-Zero is not to produce a flashy leaderboard as quickly as possible.

The goal is to build an environment where agent behavior can be measured carefully:

- what did it inspect?
- what evidence did it gather?
- did it follow distractors?
- did it apply the right fix?
- did it resolve the incident correctly?
- did the evaluation system itself run reliably enough to trust the result?

The last question became the main issue in this sweep.

So the next step is not to publish weak rankings. The next step is to make the evaluation path more stable, then rerun the benchmark under conditions where the results mostly reflect agent behavior rather than provider availability.

That is slower, but it is the right kind of slow.
