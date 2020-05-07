import * as vscode from 'vscode';

export class CharacterCountCodelensProvider implements vscode.CodeLensProvider {
    private characterCount: string = "0";

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        this.characterCount = document.getText().length.toLocaleString();

        const zero = new vscode.Position(0, 0);
        return [new vscode.CodeLens(new vscode.Range(zero, zero))];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        codeLens.command = {
            title: `char count: ${this.characterCount}`,
            command: ""
        };
        return codeLens;
    }
}