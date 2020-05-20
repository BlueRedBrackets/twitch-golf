import * as vscode from 'vscode';

let timerStatusBarItem: vscode.StatusBarItem;
let secondsSetFor: number;
let startedAt: number;
let pausedAt: number;
let pauseRemainder: number;
let timerUpdateTimeout: NodeJS.Timeout;
let isRunning: boolean

function updateTimer() {
    const secondsLeft = Math.ceil(secondsSetFor - (Date.now() - startedAt) / 1000);
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
    isRunning = true;
    startedAt = Date.now();
    secondsSetFor = seconds;
    if (timerStatusBarItem) timerStatusBarItem.hide();
    timerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);
    updateTimer();
    timerStatusBarItem.show();
    timerUpdateTimeout = setInterval(updateTimer, 500);
}

export function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        pausedAt = Date.now();
        pauseRemainder = (pausedAt - startedAt) % 1000
        clearInterval(timerUpdateTimeout);
    }
}

export function resumeTimer() {
    if (!isRunning) {
        isRunning = true;
        startedAt += Date.now() - pausedAt;
        updateTimer()
        setTimeout(updateTimer, pauseRemainder)
        timerUpdateTimeout = setInterval(updateTimer, 500);
    }
}