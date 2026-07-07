---
title: "SRE-Zero: Environment-Grounded Evaluation for Reliable Tool-Using Agents"
description: "Publishing the first public SRE-Zero technical report draft and preliminary benchmark results."
date: "2026-05-19"
tags: ["SRE-Zero", "LLM Agents", "Evaluation", "AI Systems"]
---

# SRE-Zero: Environment-Grounded Evaluation for Reliable Tool-Using Agents

**Draft v1 / Technical Report / Work in Progress**

This is an early public draft. The current results are preliminary and are intended to validate the benchmark design, not to provide final model rankings.

I am publishing the first technical report draft for **SRE-Zero**, an early-stage research benchmark for studying reliable tool-using LLM agents in simulated incident-response workflows.

The project asks a narrow question: can an agent gather evidence, diagnose a simulated infrastructure incident, apply a minimal remediation, and submit the correct final resolution under a step budget?

The benchmark is intentionally simulation-only. It does not execute shell commands, touch real infrastructure, or perform any live remediation. Agents interact with structured tools such as `inspect_logs(service)`, `inspect_metrics(service)`, `check_status(service)`, `update_config(service, key, value)`, and `resolve_incident(root_cause, fix)`.

---

## What v1 contains

The v1 draft describes the initial SRE-Zero environment, task suite, reward design, metrics, and baseline agents. The current paper results use the earlier 15-task suite.

The v1 bundle includes:

- the technical report PDF
- evaluation JSON records
- generated plots
- baseline trajectories and summaries

The website copy of the bundle is stored under `blogs/3/`, and the files below are linked directly from the post.

---

## Download the v1 bundle

### Paper

- [Download the technical report PDF](/blog-assets/3/paper/sre-zero-paper-draft-v1.pdf)

### Main evaluation JSON

- [Combined evaluation results](/blog-assets/3/jsons/eval_results.json)

---

## The main signal

The most interesting early signal is that **evidence gathering and final resolution are separable**.

In the preliminary sweep, the ReAct-style `openai/gpt-5-mini` run reached **0.81 evidence coverage** but **0.00 success**. The prompting-only `openai/gpt-5-mini` run reached **0.63 evidence coverage** with **0.00 success**.

That means the agents were often able to inspect useful logs, metrics, or configuration, but still failed to turn that evidence into the correct minimal fix and final incident resolution. This is exactly the kind of distinction that a benchmark like SRE-Zero should make visible.

---

## Preliminary baseline results

These numbers are from a small, low-budget sweep over the earlier 15-task suite. Deterministic baselines used 5 episodes per task. LLM baselines used 1 episode per task with seed `0`.

| Baseline | Model | Marks | Success | Reward | Evidence | Invalid |
|---|---:|---:|---:|---:|---:|---:|
| Scripted expert | `deterministic/scripted` | 93.7 | 1.00 | 0.946 | 1.00 | 0.00 |
| Frontier | `openai/gpt-5.5` | 67.7 | 0.73 | 0.603 | 0.83 | 0.01 |
| ReAct | `openai/gpt-5-mini` | 21.5 | 0.00 | 0.040 | 0.81 | 0.15 |
| Prompting | `openai/gpt-5-mini` | 17.7 | 0.00 | 0.000 | 0.63 | 0.00 |
| Open-source | `ibm-granite/granite-4.1-8b` | 16.6 | 0.00 | 0.010 | 0.57 | 0.00 |
| Random | `deterministic/random` | 5.6 | 0.00 | 0.001 | 0.08 | 0.21 |

The scripted expert gives the environment a high upper-bound sanity check. The random agent gives a low floor. The LLM baselines sit between them, and their failure modes are more informative than a single success-rate number.

![Overall marks](/blog-assets/3/plots/blog_cheap_sweep/overall_marks.png)

![Success vs evidence coverage](/blog-assets/3/plots/blog_cheap_sweep/success_vs_evidence.png)

---

## Why this matters

Many agent evaluations collapse a whole workflow into a final answer. SRE-Zero is designed to expose the intermediate behavior:

- whether the agent inspected relevant evidence
- whether it followed distractors
- whether it applied the right fix
- whether it resolved too early
- whether invalid or repeated actions consumed the budget

This matters for tool-using agents because operational reliability is not only about producing a plausible final sentence. It is about acting in the environment with enough discipline to gather evidence before changing state.

---

## Limitations

The v1 draft is deliberately cautious. These results should not be read as final model rankings.

Important limitations:

- one seed
- one episode per LLM task
- a small model set
- the earlier 15-task suite
- simple simulated services
- no human SRE comparison yet
- no statistical confidence intervals yet

The purpose of this draft is to validate the benchmark design and identify whether the environment produces useful differences between agent strategies.

---

## Next steps

The next stage is to expand the environment beyond the initial suite, run more seeds, evaluate more models, and report confidence intervals. The environment has already started moving toward a larger v0.5 benchmark with additional services, more tasks, noisy metrics, distractor logs, and richer failure metrics.

The current claim is modest: SRE-Zero appears useful as an environment-grounded testbed for separating evidence gathering, remediation quality, final resolution, and action discipline in tool-using agents.

---

## Full artifact downloads

### JSON browser

- [Open the JSON browser](/blog-json/3)

### Baseline run JSON records

Baseline agents without API calls:

- [Check agent trajectory](/blog-assets/3/jsons/baseline_agents_no_api/check_agent.json)
- [Check summary](/blog-assets/3/jsons/baseline_agents_no_api/check_summary.json)
- [Random failure on misleading web task](/blog-assets/3/jsons/baseline_agents_no_api/random_failure_misleading_web.json)
- [Scripted success on misleading web task](/blog-assets/3/jsons/baseline_agents_no_api/scripted_success_misleading_web.json)
- [Baseline no-API summary](/blog-assets/3/jsons/baseline_agents_no_api/summary.json)

Full baseline blog run:

- [Random baseline, 5 episodes](/blog-assets/3/jsons/baseline_blog_full/random_episodes5.json)
- [Scripted baseline, 5 episodes](/blog-assets/3/jsons/baseline_blog_full/scripted_episodes5.json)
- [Prompting, openai/gpt-5-mini](/blog-assets/3/jsons/baseline_blog_full/prompting_openai_gpt-5-mini_episodes1.json)
- [ReAct, openai/gpt-5-mini](/blog-assets/3/jsons/baseline_blog_full/react_openai_gpt-5-mini_episodes1.json)
- [ReAct, anthropic/claude-sonnet-4.6](/blog-assets/3/jsons/baseline_blog_full/react_anthropic_claude-sonnet-4.6_episodes1.json)
- [Open-source, google/gemma-4-26b-a4b-it-free](/blog-assets/3/jsons/baseline_blog_full/open_source_google_gemma-4-26b-a4b-it-free_episodes1.json)
- [Open-source, meta-llama/llama-3.3-70b-instruct-free](/blog-assets/3/jsons/baseline_blog_full/open_source_meta-llama_llama-3.3-70b-instruct-free_episodes1.json)
- [Open-source, mistralai/mistral-small-3.2-24b-instruct](/blog-assets/3/jsons/baseline_blog_full/open_source_mistralai_mistral-small-3.2-24b-instruct_episodes1.json)
- [Open-source, nvidia/nemotron-3-super-120b-a12b-free](/blog-assets/3/jsons/baseline_blog_full/open_source_nvidia_nemotron-3-super-120b-a12b-free_episodes1.json)
- [Open-source, openai/gpt-oss-20b-free](/blog-assets/3/jsons/baseline_blog_full/open_source_openai_gpt-oss-20b-free_episodes1.json)
- [Open-source, qwen/qwen3-next-80b-a3b-instruct-free](/blog-assets/3/jsons/baseline_blog_full/open_source_qwen_qwen3-next-80b-a3b-instruct-free_episodes1.json)

Earlier cheap sweep:

- [Cheap sweep summary](/blog-assets/3/jsons/blog_cheap_sweep/summary.json)
- [Random baseline, 5 episodes](/blog-assets/3/jsons/blog_cheap_sweep/random_episodes5.json)
- [Scripted baseline, 5 episodes](/blog-assets/3/jsons/blog_cheap_sweep/scripted_episodes5.json)
- [Prompting, openai/gpt-5-mini](/blog-assets/3/jsons/blog_cheap_sweep/prompting_openai_gpt-5-mini_episodes1.json)
- [ReAct, openai/gpt-5-mini](/blog-assets/3/jsons/blog_cheap_sweep/react_openai_gpt-5-mini_episodes1.json)
- [Open-source, ibm-granite/granite-4.1-8b](/blog-assets/3/jsons/blog_cheap_sweep/open_source_ibm-granite_granite-4.1-8b_episodes1.json)
- [Frontier, openai/gpt-5.5](/blog-assets/3/jsons/blog_cheap_sweep/frontier_openai_gpt-5.5_episodes1.json)

Expanded deterministic smoke:

- [Smoke summary](/blog-assets/3/jsons/expanded_deterministic_smoke/summary.json)
- [Random smoke run](/blog-assets/3/jsons/expanded_deterministic_smoke/random_episodes1.json)
- [Scripted smoke run](/blog-assets/3/jsons/expanded_deterministic_smoke/scripted_episodes1.json)

### Plots and tables

Cheap sweep plots:

- [Overall marks plot](/blog-assets/3/plots/blog_cheap_sweep/overall_marks.png)
- [Success vs evidence plot](/blog-assets/3/plots/blog_cheap_sweep/success_vs_evidence.png)
- [Task success heatmap](/blog-assets/3/plots/blog_cheap_sweep/task_success_heatmap.png)
- [Score components plot](/blog-assets/3/plots/blog_cheap_sweep/score_components.png)
- [Errors and invalid actions plot](/blog-assets/3/plots/blog_cheap_sweep/errors_invalid_actions.png)
- [Results table](/blog-assets/3/plots/blog_cheap_sweep/results_table.md)

Smoke and plotting outputs:

- [Expanded smoke metrics table](/blog-assets/3/plots/expanded_deterministic_smoke/metrics_table.md)
- [Expanded smoke overall marks SVG](/blog-assets/3/plots/expanded_deterministic_smoke/overall_marks.svg)
- [Expanded smoke success vs evidence SVG](/blog-assets/3/plots/expanded_deterministic_smoke/success_vs_evidence.svg)
- [Final push smoke metrics table](/blog-assets/3/plots/final_push_smoke/metrics_table.md)
- [Final push smoke overall marks SVG](/blog-assets/3/plots/final_push_smoke/overall_marks.svg)
- [Final push smoke success vs evidence SVG](/blog-assets/3/plots/final_push_smoke/success_vs_evidence.svg)
- [Plot-from-eval smoke metrics table](/blog-assets/3/plots/plot_from_eval_smoke/metrics_table.md)
- [Plot-from-eval smoke overall marks SVG](/blog-assets/3/plots/plot_from_eval_smoke/overall_marks.svg)
- [Plot-from-eval smoke success vs evidence SVG](/blog-assets/3/plots/plot_from_eval_smoke/success_vs_evidence.svg)
- [Plot-script smoke metrics table](/blog-assets/3/plots/plot_script_smoke/metrics_table.md)
- [Plot-script smoke overall marks SVG](/blog-assets/3/plots/plot_script_smoke/overall_marks.svg)
- [Plot-script smoke success vs evidence SVG](/blog-assets/3/plots/plot_script_smoke/success_vs_evidence.svg)
