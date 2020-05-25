import * as vscode from 'vscode';

export class CharacterCountCodelensProvider implements vscode.CodeLensProvider {
    private codeBlockRegex = new RegExp(/(?:[^\n]\n{0,2})+/, "g")
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];
        const documentText = document.getText();
        let match;
        while ((match = this.codeBlockRegex.exec(documentText))) {
            const position = document.positionAt(match.index)
            const lens = new vscode.CodeLens(new vscode.Range(position, position));
            lens.command = {
                title: `char count: ${match[0].trim().length.toLocaleString()}`,
                command: ""
            }
            lenses.push(lens);
        }
        return lenses
    }
}