# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zed editor extension that adds Org Mode support. It uses tree-sitter-org for parsing and provides syntax highlighting, code injections, and outline navigation for `.org` files.

## Architecture

### Extension Structure

- `extension.toml`: Extension metadata and tree-sitter grammar configuration
  - Points to the tree-sitter-org grammar from https://github.com/milisims/tree-sitter-org
  - Commit: 64cfbc213f5a83da17632c95382a5a0a2f3357c1

- `languages/org/config.toml`: Language configuration that associates `.org` file extensions with the grammar

- `languages/org/highlights.scm`: Tree-sitter highlighting queries
  - Implements cyclic headline highlighting (3 levels that repeat)
  - Headlines are color-coded: level 1 → function, level 2 → string.regex, level 3 → operator
  - TODO keywords styled as `@keyword`, DONE as `@constant`
  - Progress cookies with numbers `[3/7]` and percentages `[33%]` with different styling for complete vs incomplete
  - Tags styled as `@type`
  - Properties, timestamps, footnotes, directives, drawers, and blocks all have dedicated styling

- `languages/org/outline.scm`: Defines outline/navigation structure
  - Matches sections based on star depth (`*`, `**`, `***`)
  - Enables code folding and document outline navigation in Zed

- `languages/org/injections.scm`: Code injection configuration
  - Enables syntax highlighting for code blocks (e.g., `#+begin_src rust`)
  - Captures the language parameter and block contents for proper highlighting

### Tree-sitter Query Files

The `.scm` files use tree-sitter query syntax with predicates like `#match?`, `#eq?`, `#not-eq?`, `#any-of?`, and `#not-any-of?` to target specific nodes in the parse tree. When modifying these:

- Anonymous nodes (strings in queries) cannot be anchored per tree-sitter limitation
- The headline highlighting pattern uses regex to match star depth: `^(\\*{3})*\\*$` for level 1, `^(\\*{3})*\\*\\*$` for level 2, etc.
- Progress cookies and completion status are matched separately to enable conditional styling

## Development

This extension doesn't require traditional build/test commands. To develop:

1. Edit the `.scm` query files or `extension.toml` configuration
2. Test by installing the extension in Zed (reload Zed to see changes)
3. Use `sample.org` to verify syntax highlighting and features

## Key Implementation Details

- **Headline levels**: The cyclic pattern `(\\*{3})*` allows infinite nesting while repeating 3 colors
- **Section discovery**: Recent bugfix (e086cc4) corrected section matching in `outline.scm` to properly identify sections using star patterns
- **Color scheme**: Each structural level has dedicated colors defined in `highlights.scm` for visual hierarchy
