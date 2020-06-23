// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CharacterCountFeature from './features/characterCountFeature'
import TimerFeature from './features/timerFeature';
import TwitchChatFeature from "./features/twitchChatFeature";
import IFeature from './feature';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const features: IFeature[] = [new CharacterCountFeature(), new TimerFeature(), new TwitchChatFeature()];
	for (const feature of features) {
		await feature.installOn(context);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
