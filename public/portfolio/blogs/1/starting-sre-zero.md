---
title: "Starting SRE-Zero: Building RL Environments for Reliable Tool-Using AI Agents"
description: "Why I’m starting a long-term research project on environment-grounded evaluation and training for reliable LLM agents."
date: "2026-05-13"
tags: ["SRE-Zero", "LLM Agents", "Reinforcement Learning", "AI Systems"]
---

# Starting SRE-Zero: Building RL Environments for Reliable Tool-Using AI Agents

Large language models are becoming increasingly capable at using tools, writing code, searching through information, and interacting with external systems. But as these agents move from simple chat interfaces into real workflows, one question becomes more important:

**How do we know if an AI agent is actually reliable?**

It is not enough for an agent to produce a correct-looking final answer. In real operational settings, an agent has to gather evidence, make decisions step by step, avoid unsafe actions, recover from mistakes, and know when it does not have enough information.

That is the motivation behind **SRE-Zero**, a long-term research project I am starting around reinforcement learning environments, agent evaluation, and reliable tool-using LLMs.

This is an early research project, and the first goal is to build a reproducible benchmark before making strong claims about training better agents.

---

## Why start this project?

Most AI agent demos look impressive when they work, but real-world reliability is much harder than demo success.

A useful agent should not only answer questions. It should be able to:

- inspect the state of a system
- choose the right tools
- gather relevant evidence
- avoid jumping to conclusions
- apply safe and minimal fixes
- recover when its first hypothesis is wrong
- complete a task within a limited budget

This is especially important for technical workflows like debugging, infrastructure operations, incident response, and software maintenance.

These are not single-step tasks. They are sequential decision-making problems. That makes them a natural fit for reinforcement learning environments and structured evaluation.

SRE-Zero is my attempt to study this problem in a controlled way.

---

## Why incident response?

Site reliability engineering is a strong testbed for AI agents because incident response is naturally multi-step.

When a service fails, a good engineer does not randomly restart everything. They usually follow a process:

1. Check what is broken.
2. Inspect logs and metrics.
3. Form a root-cause hypothesis.
4. Test the hypothesis.
5. Apply the smallest safe fix.
6. Verify recovery.
7. Resolve or escalate.

This is exactly the kind of workflow where current LLM agents can fail in interesting ways.

They may inspect the wrong logs.  
They may apply a fix without enough evidence.  
They may confuse symptoms with root cause.  
They may take too many steps.  
They may hallucinate actions.  
They may resolve an incident before actually fixing it.

That makes SRE a useful environment for measuring agent reliability beyond simple final success.

---

## What SRE-Zero is

SRE-Zero is planned as an environment-grounded benchmark for evaluating tool-using LLM agents in simulated incident-response workflows.

The environment will include simulated services such as:

- web server
- database
- cache
- message queue
- load balancer

Agents will interact with the environment through structured tools, such as:

- inspect logs
- inspect metrics
- check service status
- restart service
- update configuration
- resolve incident

Each task will represent a specific operational incident. For example:

- a cache service crash
- database connection pool exhaustion
- a timeout misconfiguration
- queue backlog causing user-facing latency
- misleading web server errors caused by a deeper database issue

The agent’s goal is to diagnose the incident and apply the correct remediation within a limited number of steps.

---

## What the first phase will include

The first phase of SRE-Zero is focused on building the benchmark itself.

The goal is not to immediately train the best possible agent. The first goal is to create a clean, reproducible environment where different agents can be evaluated fairly.

Phase 1 will include:

- deterministic incident-response tasks
- easy, medium, and hard difficulty splits
- structured observations and tool actions
- partial-credit reward functions
- standardized evaluation scripts
- random and scripted baselines
- prompting-only LLM baselines
- ReAct-style agent baselines
- open-source and frontier model evaluations
- failure analysis and qualitative trajectories

The most important part is designing metrics that measure reliability, not just success.

Some metrics I want to track include:

- success rate
- mean steps to resolution
- invalid action rate
- evidence coverage
- wrong remediation rate
- robustness to distractor logs
- recovery from incorrect actions
- partial reward score

This should make it possible to study where agents fail and what kinds of training or prompting actually improve behavior.

---

## What I am not claiming yet

At this stage, I am not claiming that SRE-Zero solves incident response.

I am also not claiming that LLM agents are ready to autonomously operate real infrastructure.

The project is starting as a research benchmark, not a production automation system.

The goal is to build a controlled environment where questions like these can be studied:

- How well do current LLM agents perform on multi-step operational tasks?
- Do agents gather enough evidence before acting?
- Are they robust to misleading symptoms?
- Can they distinguish root causes from surface-level errors?
- Do structured rewards help measure useful progress?
- Can supervised fine-tuning or reinforcement learning improve reliability?

Those are the kinds of questions SRE-Zero is meant to explore.

---

## Roadmap

The long-term roadmap is divided into three main research phases.

### Phase 1: Benchmark and baselines

**Timeline:** May 2026 to September 2027

The first phase is focused on building SRE-Zero as a benchmark.

The target deliverables are:

- SRE-Zero environment v1
- 15 to 30 incident-response tasks
- random, scripted, prompting, and ReAct baselines
- frontier and open-source model evaluations
- first benchmark paper draft
- public GitHub repository
- project documentation

The main output will be a benchmark paper:

**SRE-Zero: Environment-Grounded Evaluation of Reliable Tool-Using LLM Agents**

---

### Phase 2: Supervised fine-tuning baselines

**Timeline:** October 2027 to August 2028

The second phase will add supervised fine-tuning baselines.

The goal will be to generate expert trajectories, train open-source models on incident-response behavior, and evaluate whether SFT improves reliability and generalization.

Questions for this phase include:

- Does SFT improve tool-use efficiency?
- Does it reduce invalid actions?
- Does it improve performance on unseen incidents?
- Does the agent learn real diagnosis behavior or memorize task templates?

---

### Phase 3: Reinforcement learning from environment feedback

**Timeline:** September 2028 to May 2029

The third phase will explore reinforcement learning methods such as GRPO or related environment-feedback training approaches.

The goal will be to study whether RL-style post-training can improve multi-step incident response beyond prompting and SFT.

This phase will focus heavily on:

- reward design
- robustness
- reward hacking
- generalization
- recovery behavior
- tool-use efficiency

---

## Why I am documenting this publicly

I am documenting SRE-Zero publicly because I want the research process to be visible from the beginning.

That includes not only polished results, but also:

- design decisions
- failed experiments
- baseline weaknesses
- reward-design problems
- evaluation mistakes
- paper-writing progress
- lessons from related work

The goal is to build in public while keeping the work serious and reproducible.

I also want this project to become a long-term foundation for my work in reinforcement learning, LLM agents, post-training, and AI systems.

---

## Closing note

SRE-Zero is starting as a simple idea:

**Reliable AI agents need better environments, better evaluations, and better feedback loops.**

Incident response gives a practical setting where agents must make sequential decisions, use tools carefully, and reason from evidence under uncertainty.

The first milestone is to build the benchmark.

After that, the real research begins.
