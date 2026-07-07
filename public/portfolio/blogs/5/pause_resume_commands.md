# Pause and Resume Commands

Run commands from `D:\SRE-Zero`.

## Pause A Running Benchmark

```powershell
New-Item -ItemType File -Force notes\runs\pause.flag
```

The runner checks this file between task episodes and model runs. It writes
partial JSON before stopping. It cannot interrupt an already in-flight provider
request.

## Resume A Benchmark

```powershell
Remove-Item notes\runs\pause.flag -ErrorAction SilentlyContinue
```

Then rerun the same `eval/run_all_eval.py` command with:

```powershell
--resume `
--pause-file notes/runs/pause.flag
```

The runner skips completed per-run JSON files and resumes partial files from
completed task records.

## Provider-Safe Flags

```powershell
--timeout-seconds 30 `
--llm-max-retries 5 `
--llm-min-request-interval-seconds 15 `
--llm-rate-limit-requests 5 `
--llm-rate-limit-window-seconds 60 `
--llm-rejection-pause-threshold 3 `
--llm-rejection-pause-seconds 60
```

## Example Single-Model 40-Task Run

```powershell
Remove-Item notes\runs\pause.flag -ErrorAction SilentlyContinue

python eval/run_all_eval.py `
  --resume `
  --pause-file notes/runs/pause.flag `
  --only-baselines open_source `
  --skip-deterministic `
  --llm-episodes 1 `
  --timeout-seconds 30 `
  --llm-max-retries 5 `
  --llm-min-request-interval-seconds 15 `
  --llm-rate-limit-requests 5 `
  --llm-rate-limit-window-seconds 60 `
  --llm-rejection-pause-threshold 3 `
  --llm-rejection-pause-seconds 60 `
  --open-source-models openai/gpt-oss-20b:free `
  --output-dir notes/runs/open_weight_gpt_oss_40_tasks `
  --summary-output notes/runs/open_weight_gpt_oss_40_tasks/summary.json `
  --log-file notes/runs/open_weight_gpt_oss_40_tasks/run.log
```
