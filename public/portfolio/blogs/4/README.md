# SRE-Zero v1.5 Bundle

This folder is a local bundle for the SRE-Zero v1.5 draft and the 25-task
baseline sweep.

## Contents

- `paper/` - v1.5 technical report PDF.
- `jsons/baseline_blog_full/` - full baseline sweep JSON records.
- `plots/baseline_blog_full/` - SVG, PNG, and markdown plot/table outputs.
- `sre-zero-v1-5-public-draft.md` - combined public-draft and baseline-results post with links to the paper PDF, plots, JSON browser, and raw JSON records.

## Publishing

The v1.5 post links to the paper PDF, plots, the JSON browser at `/blog-json/4`, and raw JSON records inside this bundle.

## Status

This is an early public draft. The current results are preliminary and are
intended to validate the benchmark design, not to provide final model rankings.

The v1.5 results use one seed and one episode per LLM task. Several runs include
provider or agent errors, so the numbers should be treated as preliminary
benchmark signals rather than stable model rankings.
