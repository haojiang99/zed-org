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

  // Regex to match checkboxes: [ ], [x], [X], [-]
  const checkboxRegex = /(\s*-\s+)\[(.)\]/;
  const match = line.match(checkboxRegex);

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
  }

  return codeActions;
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
