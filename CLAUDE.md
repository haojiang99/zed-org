# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zed editor extension that adds Org Mode support. It uses tree-sitter-org for parsing and provides:
- Syntax highlighting with semantic TODO keyword colors
- Code injections for embedded code blocks
- Outline navigation
- Interactive checkbox toggling via a custom language server

## Architecture

### Extension Structure

- `extension.toml`: Extension metadata and tree-sitter grammar configuration
  - Points to the tree-sitter-org grammar from https://github.com/milisims/tree-sitter-org
  - Commit: 64cfbc213f5a83da17632c95382a5a0a2f3357c1

- `languages/org/config.toml`: Language configuration that associates `.org` file extensions with the grammar

- `languages/org/highlights.scm`: Tree-sitter highlighting queries
  - Implements cyclic headline highlighting (3 levels that repeat)
  - Headlines are color-coded: level 1 → function, level 2 → string.regex, level 3 → operator
  - TODO keywords with semantic categorization (each has distinct colors):
    - Active action states: TODO, NEXT → `@keyword` (orange)
    - In-progress states: IN-PROGRESS, INPROGRESS → `@string.special` (light green)
    - Started states: STARTED → `@keyword.function`
    - Waiting/blocked states: WAITING, HOLD, DELEGATED → `@keyword.directive`
    - Low priority states: MAYBE, SOMEDAY → `@keyword.storage`
    - Note/information: NOTE → `@keyword.import`
    - Completed states: DONE → `@constant`
    - Cancelled states: CANCELLED, CANCELED, DEFERRED → `@comment.doc`
  - Priority tags with distinct colors:
    - `[#A]` (highest priority) → `@error.priority` (red)
    - `[#B]` (medium priority) → `@warning.priority` (orange)
    - `[#C]` (lower priority) → `@hint.priority` (muted)
    - `[#D-Z]` (other priorities) → `@hint` (default)
  - Checkbox states with distinct colors:
    - `[ ]` (todo) → `@keyword` (orange)
    - `[x]` or `[X]` (done) → `@constant` (green)
    - `[-]` (in-progress) → `@operator` (yellow/distinct)
  - Progress cookies with numbers `[3/7]` and percentages `[33%]` with different styling for complete vs incomplete
  - Tags styled as `@type`
  - Properties, timestamps, footnotes, directives, drawers, and blocks all have dedicated styling

- `languages/org/outline.scm`: Defines outline/navigation structure
  - Matches sections based on star depth (`*`, `**`, `***`)
  - Enables code folding and document outline navigation in Zed

- `languages/org/injections.scm`: Code injection configuration
  - Enables syntax highlighting for code blocks (e.g., `#+begin_src rust`)
  - Captures the language parameter and block contents for proper highlighting

- `languages/org/org.json`: Snippet definitions for quick text insertion
  - `check` + Tab → `- [ ]` (todo checkbox)
  - `checkx` + Tab → `- [x]` (done checkbox)
  - `check-` + Tab → `- [-]` (in-progress checkbox)

### Tree-sitter Query Files

The `.scm` files use tree-sitter query syntax with predicates like `#match?`, `#eq?`, `#not-eq?`, `#any-of?`, and `#not-any-of?` to target specific nodes in the parse tree. When modifying these:

- Anonymous nodes (strings in queries) cannot be anchored per tree-sitter limitation
- The headline highlighting pattern uses regex to match star depth: `^(\\*{3})*\\*$` for level 1, `^(\\*{3})*\\*\\*$` for level 2, etc.
- Progress cookies and completion status are matched separately to enable conditional styling

## Language Server

The extension includes a custom Node.js-based language server (`language-server/server.js`) that provides:

### Code Actions

The language server provides three types of code actions:

**1. Change TODO Keywords**
- Detects lines starting with `* TODO`, `** IN-PROGRESS`, etc.
- Offers code actions to change to any other TODO keyword
- Supports all keywords: TODO, NEXT, IN-PROGRESS, INPROGRESS, STARTED, WAITING, HOLD, DELEGATED, MAYBE, SOMEDAY, NOTE, DONE, CANCELLED, CANCELED, DEFERRED
- Each action is labeled with its category (Active, In Progress, Done, etc.)
- Uses LSP `CodeActionKind.RefactorRewrite`

**2. Toggle Checkbox State**
- Detects checkbox patterns: `- [ ]`, `- [x]`, `- [-]`
- Cycles through states: `[ ]` → `[x]` → `[-]` → `[ ]`
- Triggered when cursor is on a line with a checkbox
- Uses LSP `CodeActionKind.QuickFix`

**3. Insert New Checkbox**
- Detects when cursor is on an empty line after a checkbox line
- Offers to insert `- [ ]` with the same indentation as the previous checkbox
- Perfect for quickly creating checkbox lists
- Uses LSP `CodeActionKind.QuickFix`

All actions are triggered by: `Alt+C` or `Ctrl+.`

### Architecture

- `src/lib.rs`: Rust extension that launches the language server
  - Auto-installs npm dependencies on first run
  - Uses Zed's `node_binary_path()` to run the server
- `language-server/server.js`: Node.js LSP server
  - Uses `vscode-languageserver` for LSP protocol
  - Regex matching for checkbox detection: `/(\s*-\s+)\[(.)\]/`
  - Returns text edits to replace checkbox character

### Adding Language Server Features

To add new code actions or LSP features:
1. Edit `language-server/server.js`
2. Implement new LSP capabilities (hover, completion, etc.) in the connection handlers
3. Update `extension.toml` if adding new language servers
4. Test with `zed --foreground` for verbose logging

## Development

### Building the Extension

```bash
# Build the Rust extension
cargo build --release

# Install language server dependencies
cd language-server
npm install
```

### Testing

1. Use "Install Dev Extension" in Zed's extensions page
2. Point it to this repository directory
3. Run `zed --foreground` in terminal for verbose logging
4. Open a `.org` file to test features
5. Use `sample.org` which includes test cases for all TODO keywords and checkboxes

### Debugging

- Check `~/.local/share/zed/logs/Zed.log` (Linux) for error messages
- Language server logs appear in Zed's output panel
- Use `console.error()` in `server.js` for debugging
- Verify npm dependencies are installed in `language-server/node_modules/`

## Key Implementation Details

- **Headline levels**: The cyclic pattern `(\\*{3})*` allows infinite nesting while repeating 3 colors
- **Section discovery**: Recent bugfix (e086cc4) corrected section matching in `outline.scm` to properly identify sections using star patterns
- **Color scheme**: Each structural level has dedicated colors defined in `highlights.scm` for visual hierarchy
