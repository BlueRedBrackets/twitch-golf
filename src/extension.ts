// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CharacterCountCodelensProvider } from './characterCountLens'
import * as timer from './timer';

let timerStartButton: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerCodeLensProvider("*", new CharacterCountCodelensProvider())

	const startTimerId = 'twitch-golf.startTimer';
	context.subscriptions.push(vscode.commands.registerCommand(startTimerId, async () => {
		const input = vscode.window.showInputBox({
			prompt: "Type the number of minutes you want to set a timer for.",
			validateInput: input => {
				const minutes = Number(input);
				if (!Number.isInteger(minutes) || minutes <= 0) {
					return "Please input a positive integer"
				}
			}
		});
		timer.startTimer(Number(await input) * 60)
	}));

	timerStartButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
	timerStartButton.command = startTimerId;
	timerStartButton.tooltip = "Start a golf timer"
	timerStartButton.text = "$(play)";
	context.subscriptions.push(timerStartButton);
	timerStartButton.show();
}

// this method is called when your extension is deactivated
export function deactivate() { }
