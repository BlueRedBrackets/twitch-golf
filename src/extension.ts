// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CharacterCountCodelensProvider } from './characterCountLens'

let secondsLeft: number;
let timer: NodeJS.Timeout;

let timerStartButton: vscode.StatusBarItem;
let timerDisplay: vscode.StatusBarItem;

function updateTimerDisplay() {
	const hours = Math.floor(secondsLeft / 60 / 60).toString().padStart(2, "0");
	const minutes = Math.floor(secondsLeft / 60 % 60).toString().padStart(2, "0");
	const seconds = Math.floor(secondsLeft % 60).toString().padStart(2, "0");
	timerDisplay.text = `${hours}:${minutes}:${seconds}`
}

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
		secondsLeft = Number(await input) * 60;
		updateTimerDisplay();
		timerDisplay.show();
		clearInterval(timer);
		timer = setInterval(() => {
			secondsLeft--;
			if (secondsLeft === 0) {
				timerDisplay.hide();
				clearInterval(timer);
				vscode.window.showInformationMessage("Game over!");
			} else {
				updateTimerDisplay();
			}
		}, 1000);
	}));

	timerStartButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
	timerStartButton.command = startTimerId;
	timerStartButton.tooltip = "Start a golf timer"
	timerStartButton.text = "$(play)";
	context.subscriptions.push(timerStartButton);
	timerStartButton.show();

	timerDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
}

// this method is called when your extension is deactivated
export function deactivate() { }
