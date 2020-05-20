import * as vscode from 'vscode';

let timerStatusBarItem: vscode.StatusBarItem;
let secondsSetFor: number;
let startTime: number;
let timerUpdateTimeout: NodeJS.Timeout;

function updateTimer() {
    const secondsLeft = Math.ceil(secondsSetFor - (Date.now() - startTime) / 1000);
    const hours = Math.floor(secondsLeft / 60 / 60).toString().padStart(2, "0");
    const minutes = Math.floor(secondsLeft / 60 % 60).toString().padStart(2, "0");
    const seconds = Math.floor(secondsLeft % 60).toString().padStart(2, "0");
    timerStatusBarItem.text = `${hours}:${minutes}:${seconds}`;
    if (secondsLeft < 60) timerStatusBarItem.color = "red";
    if (secondsLeft === 0) {
        timerStatusBarItem.hide();
        clearInterval(timerUpdateTimeout);
        vscode.window.showInformationMessage("Game over!");
    }
}

export function startTimer(seconds: number) {
    startTime = Date.now();
    secondsSetFor = seconds;
    if (timerStatusBarItem) timerStatusBarItem.hide();
    timerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
    updateTimer();
    timerStatusBarItem.show();
    timerUpdateTimeout = setInterval(updateTimer, 500);
}