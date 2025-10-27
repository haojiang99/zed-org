# Keyboard Shortcut Setup for Checkbox Toggle

This document explains how to set up a keyboard shortcut (Alt+C) to toggle org-mode checkboxes.

## How It Works

The extension provides a language server that detects checkbox patterns in your org files:
- `[ ]` (todo)
- `[x]` or `[X]` (done)
- `[-]` (in-progress)

The toggle cycles through states: `[ ]` → `[x]` → `[-]` → `[ ]`

## Setting Up the Keyboard Shortcut

### Step 1: Open Keymap Configuration

In Zed, press:
- **Linux/Windows**: `Ctrl+K` then `Ctrl+S`
- **macOS**: `Cmd+K` then `Cmd+S`

Or use the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for: **"zed: Open Keymap"**

### Step 2: Add the Keybinding

**For direct toggle (recommended)** - Press `Alt+C` and the checkbox changes immediately:

```json
[
  {
    "context": "Editor && mode == full",
    "bindings": {
      "alt-c": "editor::ConfirmCodeAction"
    }
  }
]
```

**Alternative: Show menu first** - Press `Alt+C` to see a menu, then click to apply:

```json
[
  {
    "context": "Editor && mode == full",
    "bindings": {
      "alt-c": "editor::ToggleCodeActions"
    }
  }
]
```

### Step 3: Alternative - Use the Built-in Code Action Shortcut

Alternatively, you can use Zed's default code action shortcuts:
- Place cursor on a line with a checkbox
- Press `Ctrl+.` (or `Cmd+.` on macOS) to open code actions
- Select the checkbox toggle action

### Step 4: Verify It Works

1. Open an org file (e.g., `sample.org`)
2. Place your cursor on a line with a checkbox:
   ```org
   - [ ] Todo item
   ```
3. Press `Alt+C`
4. The checkbox should toggle to `[x]`

## Customizing the Keybinding

You can change `alt-c` to any key combination you prefer. Some alternatives:

```json
"ctrl-shift-c": "editor::ToggleCodeActions"  // Ctrl+Shift+C
"cmd-k t": "editor::ToggleCodeActions"       // Cmd+K then T (macOS)
```

## Troubleshooting

### The shortcut doesn't work

1. **Check if the extension is loaded**: Open a `.org` file and verify syntax highlighting works
2. **Check Zed logs**: Run `zed --foreground` in terminal to see verbose logging
3. **Reinstall dependencies**:
   ```bash
   cd language-server
   rm -rf node_modules package-lock.json
   npm install
   ```

### The code action doesn't appear

1. **Verify cursor position**: The cursor must be on a line containing a checkbox pattern
2. **Check the pattern**: Checkboxes must follow org-mode format: `- [ ]`, `- [x]`, `- [-]`
3. **Restart Zed**: Sometimes extensions need a restart to reload

## Advanced: Multiple Actions

If you want different keys for different actions:

```json
[
  {
    "context": "Editor",
    "bindings": {
      "alt-c": "editor::ToggleCodeActions",
      "alt-shift-c": "editor::ConfirmCodeAction"
    }
  }
]
```
