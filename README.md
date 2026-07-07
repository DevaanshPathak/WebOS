# WebOS 1

WebOS 1 is a browser-based desktop OS simulation with draggable windows, built with an embedded-systems and homelab-inspired portfolio aesthetic.

## Live Demo

https://os.devaanshpathak.com

## Features

- Desktop-style webpage with multiple draggable windows.
- Custom visual identity distinct from the official WebOS guide.
- Publicly testable experience with no password or login gate.
- Functional terminal window with hardcoded commands:
  - `system info`
  - `ls`
  - `whoami`
  - `ping`
  - one easter egg command
- Window snapping and tiling by dragging windows to screen edges.
- System monitor widget with animated fake CPU, RAM, and uptime graphs.
- Persistent window layout using `localStorage`.
- BIOS-style boot sequence animation with a fake login moment that does not block access.

## Tech Stack

- Framework: Next.js
- Styling: Tailwind CSS
- Hosting target: static export on Vercel, Netlify, GitHub Pages, or another static host

The project should stay compatible with static export. Avoid server-only Next.js features, backend sessions, protected routes, or anything that requires a Node server at runtime.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local development URL shown in the terminal.

## Deployment

The project is deployed publicly at:

- Live site: https://os.devaanshpathak.com

The project is exported as static files and deployed to a static host. The deployment serves the desktop simulation directly without authentication so mission reviewers and visitors can test it immediately.

Build the static export with:

```bash
npm run build
```

The static output is generated in `out/`.

## Mission Link

This project is for Hack Club's Stardance WebOS 1 mission:

- Mission: https://stardance.hackclub.com/missions/web-os-1
- Guide: https://jams.hackclub.com/batch/webOS

Devlogs for the Stardance submission are posted in the Stardance portal.
