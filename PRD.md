# WebOS 1 Product Requirements Document

## Overview

WebOS 1 is a browser-based desktop OS simulation for Hack Club's Stardance WebOS 1 mission. It should feel like a personal machine: part portfolio, part embedded-systems dashboard, part homelab control panel. The project must be approachable enough for anyone visiting the public link, while still showing technical taste beyond the base guide.

## Problem and Motivation

Most personal websites are linear pages. The WebOS mission asks for a more playful format: a web page that behaves like a small operating system. WebOS 1 uses that structure to present a personal/portfolio experience through windows, terminal commands, live-looking system widgets, and desktop interactions.

The goal is to satisfy the Stardance WebOS 1 requirements while building something visually and functionally distinct from the guide. The project should show frontend interaction skills, design direction, and the ability to ship a polished static web app.

## Target Users

- Stardance mission reviewers checking whether the submission meets the WebOS 1 requirements.
- Hack Club community members browsing projects.
- Portfolio visitors who want a quick, interactive sense of the builder's interests.
- Friends or testers opening the live link on desktop or mobile browsers.

## Core Requirements

| Mission requirement | WebOS 1 plan |
| --- | --- |
| Working webpage with multiple draggable windows | Build a desktop surface with several app windows that can be opened, dragged, focused, and closed. |
| Looks original and not exactly like the guide | Use an embedded-systems, homelab, terminal-inspired visual identity instead of copying the guide's default styling. |
| At least 3 devlogs showing progress | Write 3 or more devlogs before submission, stored locally under `devlog/` when requested. |
| At least 1 new feature not listed in the guide | Ship multiple custom additions: terminal commands, snapping/tiling, system monitor, persistent layout, and boot sequence. |
| No password | Do not add authentication. The boot sequence may include fake login-style visuals, but it must never block visitors from entering. |

## Feature List

### Guide Baseline

- Welcome or boot entry screen.
- Desktop-style page with wallpaper/background treatment.
- Top bar or status area, including a clock.
- Desktop icons or launch controls for opening apps.
- Draggable, closable, and openable windows.
- At least one simple app window.
- At least one more advanced app window or richer desktop interaction.

### Custom Additions

1. Functional terminal window with hardcoded commands.
   - `system info`
   - `ls`
   - `whoami`
   - `ping`
   - one easter egg command
2. Window snapping and tiling.
   - Dragging a window to an edge should snap it to half screen.
   - Dragging to a corner should snap it to quarter screen where practical.
3. System monitor widget.
   - Fake CPU, RAM, and uptime data.
   - Animated graph styling inspired by `htop` or `btop`.
4. Persistent window layout.
   - Store window positions, sizes, z-index/focus state where useful, and open apps in `localStorage`.
   - Restore the desktop state on reload.
5. Boot sequence animation.
   - BIOS-style scrolling text.
   - Fake login or shell handoff.
   - No real password prompt and no gate that prevents public testing.

## Non-Goals

- Real operating system behavior.
- Real filesystem access or durable file persistence beyond browser `localStorage`.
- Multi-user accounts, authentication, or password protection.
- Backend APIs, databases, server actions, or server-only Next.js features.
- Full terminal emulation.
- Real hardware telemetry.
- Package manager, process manager, or sandboxed app runtime.
- Pixel-perfect reproduction of any existing desktop OS.

## Success Criteria

- The live page loads publicly without login or password.
- Multiple windows can be opened and dragged.
- The project has a clear custom identity and does not look like a guide clone.
- At least one custom feature works; the target is to ship all five custom additions.
- Window interactions feel stable and do not break basic browsing.
- Layout works acceptably on common desktop sizes and remains usable on mobile or narrow screens.
- Static export deployment works without runtime server dependencies.
- At least 3 progress devlogs exist before final mission submission.
