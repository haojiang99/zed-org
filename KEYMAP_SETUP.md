# Keyboard Shortcut Setup for Checkbox Toggle

This document explains how to set up keyboard shortcuts for org-mode checkboxes in Zed.

## Quick Checkbox Insertion

### Method 1: Smart Insert with Alt+C (Recommended)

When you're on an empty line after a checkbox:
1. Press `Alt+C` to show code actions
2. Select "Insert new checkbox [ ]" (press `Enter`)
3. A new checkbox appears with the same indentation

**Perfect for Vim users**: Press `o` to create a new line, then `Alt+C` + `Enter`!

### Method 2: Snippets

Type the prefix and press `Tab`:
- **`check`** + `Tab` → inserts `- [ ]` (todo checkbox)
- **`checkx`** + `Tab` → inserts `- [x]` (done checkbox)
- **`check-`** + `Tab` → inserts `- [-]` (in-progress checkbox)

After pressing Tab, your cursor will be positioned right after the checkbox, ready to type.

## Checkbox Toggle Shortcut

### How It Works

The extension provides a language server that detects checkbox patterns in your org files:
- `[ ]` (todo) - orange
- `[x]` or `[X]` (done) - green
- `[-]` (in-progress) - yellow

The toggle cycles through states: `[ ]` → `[x]` → `[-]` → `[ ]`

### Setting Up Alt+C for Toggle

#### Step 1: Open Keymap Configuration

In Zed, press:
- **Linux/Windows**: `Ctrl+K` then `Ctrl+S`
- **macOS**: `Cmd+K` then `Cmd+S`

Or use the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for: **"zed: Open Keymap"**

#### Step 2: Add the Keybinding

Add this to your `keymap.json`:

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

**Note**: This shows a menu with the toggle action. Press `Alt+C`, then press `Enter` or click to apply.

#### Step 3: Verify It Works

1. Open an org file (e.g., `sample.org`)
2. Place your cursor on a line with a checkbox:
   ```org
   - [ ] Todo item
   ```
3. Press `Alt+C`
4. Press `Enter` to apply the action
5. The checkbox should toggle to `[x]`

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

### Snippets don't work

1. **Make sure you press Tab**: Type `check` then press `Tab`
2. **Check language mode**: Ensure the file is recognized as "Org" (bottom right corner in Zed)
3. **Reload extension**: `Ctrl+Shift+P` → "reload" → "zed: reload window"

## Tips

- **Quick workflow**:
  1. Type `check` + `Tab` to insert a new checkbox
  2. Type your task
  3. Press `Alt+C` + `Enter` to mark it complete later

- **Alternative approach**: Use Zed's default `Ctrl+.` or `Cmd+.` instead of `Alt+C` if you prefer the default code action shortcut
