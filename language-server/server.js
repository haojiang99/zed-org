#!/usr/bin/env node

const {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  CodeActionKind,
} = require('vscode-languageserver/node');

const { TextDocument } = require('vscode-languageserver-textdocument');

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix, CodeActionKind.RefactorRewrite],
      },
    },
  };
});

connection.onCodeAction((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  const codeActions = [];
  const range = params.range;

  // Get the line where the cursor is
  const line = document.getText({
    start: { line: range.start.line, character: 0 },
    end: { line: range.start.line, character: Number.MAX_SAFE_INTEGER },
  });

  // Define all TODO keywords
  const todoKeywords = {
    active: ['TODO', 'NEXT'],
    inProgress: ['IN-PROGRESS', 'INPROGRESS', 'STARTED'],
    waiting: ['WAITING', 'HOLD', 'DELEGATED'],
    lowPriority: ['MAYBE', 'SOMEDAY'],
    note: ['NOTE'],
    done: ['DONE'],
    cancelled: ['CANCELLED', 'CANCELED', 'DEFERRED'],
  };

  // Flatten all keywords for regex matching
  const allKeywords = Object.values(todoKeywords).flat();
  const keywordRegex = new RegExp(`^(\\s*\\*+\\s+)(${allKeywords.join('|')})(\\s|$)`);
  const todoMatch = line.match(keywordRegex);

  // CASE 1: Change TODO keyword
  if (todoMatch) {
    const prefix = todoMatch[1]; // e.g., "* " or "** "
    const currentKeyword = todoMatch[2];
    const startCol = todoMatch.index + prefix.length;
    const endCol = startCol + currentKeyword.length;

    // Offer code actions to change to each keyword (except the current one)
    allKeywords.forEach((keyword) => {
      if (keyword !== currentKeyword) {
        // Determine the category for better action titles
        let category = '';
        if (todoKeywords.active.includes(keyword)) category = 'Active';
        else if (todoKeywords.inProgress.includes(keyword)) category = 'In Progress';
        else if (todoKeywords.waiting.includes(keyword)) category = 'Waiting/Blocked';
        else if (todoKeywords.lowPriority.includes(keyword)) category = 'Low Priority';
        else if (todoKeywords.note.includes(keyword)) category = 'Note';
        else if (todoKeywords.done.includes(keyword)) category = 'Done';
        else if (todoKeywords.cancelled.includes(keyword)) category = 'Cancelled';

        codeActions.push({
          title: `Change to ${keyword}${category ? ` (${category})` : ''}`,
          kind: CodeActionKind.RefactorRewrite,
          edit: {
            changes: {
              [params.textDocument.uri]: [
                {
                  range: {
                    start: { line: range.start.line, character: startCol },
                    end: { line: range.start.line, character: endCol },
                  },
                  newText: keyword,
                },
              ],
            },
          },
        });
      }
    });
  }

  // Regex to match checkboxes: [ ], [x], [X], [-]
  const checkboxRegex = /(\s*-\s+)\[(.)\]/;
  const match = line.match(checkboxRegex);

  // CASE 2: Toggle existing checkbox
  if (match) {
    const currentState = match[2];
    let newState;
    let actionTitle;

    // Determine the next state in the cycle: [ ] → [x] → [-] → [ ]
    switch (currentState) {
      case ' ':
        newState = 'x';
        actionTitle = 'Mark checkbox as done [x]';
        break;
      case 'x':
      case 'X':
        newState = '-';
        actionTitle = 'Mark checkbox as in-progress [-]';
        break;
      case '-':
        newState = ' ';
        actionTitle = 'Mark checkbox as todo [ ]';
        break;
      default:
        newState = ' ';
        actionTitle = 'Reset checkbox [ ]';
    }

    const checkboxStartCol = match.index + match[1].length + 1; // +1 for the '['
    const checkboxEndCol = checkboxStartCol + 1;

    codeActions.push({
      title: actionTitle,
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [params.textDocument.uri]: [
            {
              range: {
                start: { line: range.start.line, character: checkboxStartCol },
                end: { line: range.start.line, character: checkboxEndCol },
              },
              newText: newState,
            },
          ],
        },
      },
    });
  } else if (line.trim() === '' && range.start.line > 0) {
    // CASE 3: Empty line - check if previous line has a checkbox
    const previousLine = document.getText({
      start: { line: range.start.line - 1, character: 0 },
      end: { line: range.start.line - 1, character: Number.MAX_SAFE_INTEGER },
    });

    const prevCheckboxMatch = previousLine.match(checkboxRegex);

    if (prevCheckboxMatch) {
      // Previous line has a checkbox, offer to insert a new one
      const indentation = prevCheckboxMatch[1]; // Get the same indentation

      codeActions.push({
        title: 'Insert new checkbox [ ]',
        kind: CodeActionKind.QuickFix,
        edit: {
          changes: {
            [params.textDocument.uri]: [
              {
                range: {
                  start: { line: range.start.line, character: 0 },
                  end: { line: range.start.line, character: line.length },
                },
                newText: `${indentation}[ ] `,
              },
            ],
          },
        },
      });
    }
  }

  return codeActions;
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
