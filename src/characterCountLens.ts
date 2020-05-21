import * as vscode from 'vscode';

function createLens(lineNumber: number, characterCount: number): vscode.CodeLens {
    const position = new vscode.Position(lineNumber, 0);
    const lens = new vscode.CodeLens(new vscode.Range(position, position));
    lens.command = {
        title: `char count: ${characterCount.toLocaleString()}`,
        command: ""
    };
    return lens
}

export class CharacterCountCodelensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];
        let blockCharacterCount: number = 0;
        for (let i = document.lineCount - 1; i >= 0; i--) {
            const line = document.lineAt(i);
            if (!line.isEmptyOrWhitespace) blockCharacterCount += line.text.length + 1;
            if (i == 0 && blockCharacterCount > 0) {
                lenses.push(createLens(i, blockCharacterCount - 1));
            } else if (line.isEmptyOrWhitespace && blockCharacterCount > 0) {
                lenses.push(createLens(i + 1, blockCharacterCount - 1));
                blockCharacterCount = 0;
            }
        }
        return lenses;
    }
}