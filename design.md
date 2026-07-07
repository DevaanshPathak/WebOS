# WebOS 1 Design Direction

## Aesthetic Direction

WebOS 1 should feel like a small embedded workstation or homelab dashboard running in the browser. The visual language should borrow from terminal interfaces, rack-mounted systems, serial consoles, BIOS screens, and system monitoring tools, without becoming a generic hacker theme.

The design should avoid copying the official WebOS guide's default look. It should feel custom, technical, and personal: a desktop environment for someone who likes firmware logs, servers, cables, dashboards, and small utility apps.

## Color Palette

The palette should use dark terminal tones as the base, with restrained bright accents for active state and telemetry.

- Base background: near-black charcoal or deep graphite.
- Window surfaces: dark gray with subtle contrast from the desktop.
- Primary accent: phosphor green or signal green for terminal/system status.
- Secondary accent: amber or warm yellow for boot text, warnings, and highlighted metadata.
- Tertiary accent: cyan or cool blue for active focus, links, and graph traces.
- Error/destructive accent: muted red for failed terminal commands or warning states.

Use accents sparingly so the interface reads as a practical system surface, not a neon poster.

## Typography

- Primary system/terminal font: a monospace font for terminal output, app chrome labels, status readouts, and monitor widgets.
- Secondary UI font: a clean sans-serif font for longer portfolio content and app body text.
- Text hierarchy should be compact and dashboard-like. Avoid oversized marketing headings inside the desktop.

## Window Chrome

Windows should feel like lightweight system panels:

- Compact title bars with app name, status indicator, and close/minimize controls.
- Thin borders with stronger highlight on the focused window.
- Mostly flat surfaces with small shadows only to clarify stacking.
- Square or lightly rounded corners, closer to utility software than consumer app cards.
- Resize handles should be visible or discoverable without making the UI noisy.

Window controls can use small symbols or icon buttons rather than large text buttons.

## Icon and Desktop Layout

The desktop should start with a small set of icons or launchers arranged like tools on a workstation:

- Terminal
- System Monitor
- About/Profile
- Projects or Logs
- Notes or Field Manual

Icons should feel like system utilities rather than glossy app-store icons. Labels should be short, readable, and aligned to a simple desktop grid.

## Boot Sequence Concept

On first load, the page should show a BIOS-style boot animation:

- Fast scrolling diagnostic lines.
- Fake board or firmware identifiers.
- Memory check, network check, device scan, and UI handoff messages.
- A fake login-looking moment that immediately continues without requiring user input.

The boot sequence is a visual transition only. It must not behave like a password gate.

## System Monitor Widget Concept

The system monitor should look inspired by `htop` or `btop`, using fake animated telemetry:

- CPU graph with small changing bars or line segments.
- RAM usage bar with numeric-looking labels.
- Uptime counter that increments while the page is open.
- Small process list using playful fake process names tied to the WebOS theme.
- Compact color-coded traces using green, amber, cyan, and muted red.

The widget should feel alive without depending on real system data.
