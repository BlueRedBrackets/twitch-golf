import IFeature from '../feature'
import * as vscode from 'vscode';

class CharacterCountCodelensProvider implements vscode.CodeLensProvider {
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

export default class CharacterCountFeature implements IFeature {
    private lensProviders: { [id: string]: vscode.Disposable } = {};

    installOn(context: vscode.ExtensionContext): void {
        vscode.commands.registerCommand("twitch-golf.enableCharacterCount", this.enableForFile.bind(this));
        vscode.commands.registerCommand("twitch-golf.disableCharacterCount", this.disableForFile.bind(this));
    }

    enableForFile() {
        let fileName = vscode.window.activeTextEditor?.document.fileName;
        if (fileName !== undefined && this.lensProviders[fileName] === undefined) {
            this.lensProviders[fileName] = vscode.languages.registerCodeLensProvider({ pattern: fileName }, new CharacterCountCodelensProvider());
        }
    }

    disableForFile() {
        const fileName = vscode.window.activeTextEditor?.document.fileName;
        if (fileName !== undefined && this.lensProviders[fileName] !== undefined) {
            this.lensProviders[fileName].dispose();
            delete this.lensProviders[fileName];
        }
    }
}