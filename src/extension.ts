// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let characterCountStatusBarItem: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "twitch-golf" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	characterCountStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateCharacterCount));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(updateCharacterCount));
	updateCharacterCount();
	characterCountStatusBarItem.show();
}

function updateCharacterCount(): void {
	const text = vscode.window.activeTextEditor?.document?.getText() || "";
	characterCountStatusBarItem.text = text.length.toLocaleString();
}

// this method is called when your extension is deactivated
export function deactivate() {}
