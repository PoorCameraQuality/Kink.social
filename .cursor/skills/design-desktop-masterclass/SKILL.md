---
name: design-desktop-masterclass
description: >-
  Dense, keyboard-driven desktop UI (Electron, Tauri, native): multi-panel
  layouts, command palette, shortcuts, context menus, title bar, status bar.
  Use when building desktop apps or when the user wants IDE/tool-style UX.
---

# Desktop app design masterclass

Read [reference.md](reference.md) for three-panel layouts, sidebars, split panes, tabs, command palette spec, OS color schemes (GitHub/VS Code/Discord-style), title bar drag regions, toolbars, toasts, drag-and-drop, and multi-select.

## Apply first

- **Not a website in a window**: prioritize density, keyboard shortcuts, panels, resize behavior, right-click menus.
- **Command palette**: Cmd/Ctrl+K fuzzy search, shortcuts shown on rows, arrow keys + Enter/Escape.
- **Do not override** standard shortcuts (Save, Undo, Find, Close tab, Settings, etc.).
- **Typography**: desktop UI often 13–14px base (denser than marketing web); monospace for code per reference.
- **Chrome**: custom title bar uses explicit drag/no-drag regions; status bar for context (branch, encoding, etc.).

## When detail is needed

Open `reference.md` for exact measurements, shortcut tables, and the desktop ship checklist.
