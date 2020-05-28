import * as vscode from 'vscode';
import { IFeature } from '../feature';

class Countdown {
    private static tickCheckFrequency: number = 100;
    private setFor: number;
    private startedAt: number;
    private pausedAt: number | undefined;
    private lastTickSent: number;
    private tickCheckInterval: NodeJS.Timeout;

    private tickCallback: (secondsLeft: number) => void;
    private endCallback: () => void

    constructor(setFor: number, tickCallback: (secondsLeft: number) => void, endCallback: () => void) {
        this.setFor = setFor;
        this.lastTickSent = this.setFor;
        this.startedAt = Date.now();
        this.tickCallback = tickCallback;
        this.endCallback = endCallback;
        this.tickCheckInterval = this.setTickCheckInterval();
        this.tickCallback(this.setFor);
    }

    isRunning() {
        return this.tickCheckInterval.hasRef();
    }

    cancel() {
        this.pausedAt = undefined;
        clearInterval(this.tickCheckInterval);
    }

    pause() {
        if (!this.isRunning()) return;
        clearInterval(this.tickCheckInterval);
        this.pausedAt = Date.now();
    }

    resume() {
        if (this.pausedAt === undefined) return;
        this.startedAt += Date.now() - this.pausedAt;
        this.tickCheckInterval = this.setTickCheckInterval();
        this.pausedAt = undefined
    }

    addSeconds(seconds: number) {
        this.startedAt += seconds * 1000;
        this.lastTickSent += seconds;
        this.tickCheck();
    }

    removeSeconds(seconds: number) {
        this.startedAt -= seconds * 1000
        this.lastTickSent -= seconds;
        this.tickCheck();
    }

    reset() {
        if (!this.tickCheckInterval.hasRef()) return;
        clearInterval(this.tickCheckInterval);
        this.pausedAt = undefined;
        this.startedAt = Date.now();
        this.lastTickSent = this.setFor;
        this.tickCheckInterval = this.setTickCheckInterval();
        this.tickCallback(this.setFor);
    }

    private setTickCheckInterval(): NodeJS.Timeout {
        return setInterval(this.tickCheck.bind(this), Countdown.tickCheckFrequency);
    }

    private tickCheck() {
        const secondsLeft: number = this.setFor - Math.floor((Date.now() - this.startedAt) / 1000);
        if (secondsLeft <= 0) {
            this.cancel();
            this.endCallback();
        } else if (secondsLeft < this.lastTickSent) {
            this.lastTickSent = secondsLeft;
            this.tickCallback(secondsLeft);
        }
    }
}

export class TimerFeature implements IFeature {
    private countdown: Countdown | undefined;
    private countdownStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER);

    installOn(context: vscode.ExtensionContext): void {
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.startCountdown", this.startCountdown.bind(this)));
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.pauseCountdown", () => this.countdown?.pause()));
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.resumeCountdown", () => this.countdown?.resume()));
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.resetCountdown", () => this.countdown?.reset()));
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.cancelCountdown", this.cancelCountdown.bind(this)));
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.addSeconds", this.addSeconds.bind(this)));
        context.subscriptions.push(vscode.commands.registerCommand("twitch-golf.removeSeconds", this.removeSeconds.bind(this)));
    }

    private async promtForInteger(prompt: string): Promise<number | undefined> {
        const input = vscode.window.showInputBox({
            prompt: prompt,
            validateInput: input => {
                const minutes = Number(input);
                if (!Number.isInteger(minutes) || minutes <= 0) {
                    return "Please input a positive integer"
                }
            }
        });
        const integer = await input;
        if (integer) return Number(integer);
    }

    private async addSeconds() {
        if (!this.countdown?.isRunning()) return;
        const seconds = await this.promtForInteger("Type the number of seconds you want to add to the countdown.")
        if (!seconds) return;
        this.countdown?.addSeconds(seconds);
    }

    private async removeSeconds() {
        if (!this.countdown?.isRunning()) return;
        const seconds = await this.promtForInteger("Type the number of seconds you want to remove from the countdown.")
        if (!seconds) return;
        this.countdown?.removeSeconds(seconds);
    }

    private async startCountdown(): Promise<undefined> {
        const minutes = await this.promtForInteger("Type the number of minutes you want to set the countdown for.")
        if (!minutes) return;
        this.countdown?.cancel();
        this.countdown = new Countdown(
            minutes * 60,
            this.handleCountdownTick.bind(this),
            this.handleCountdownEnd.bind(this)
        )
        this.countdownStatusBarItem.show();
    }

    private cancelCountdown() {
        this.countdown?.cancel();
        this.countdownStatusBarItem.hide();
    }

    private handleCountdownTick(secondsLeft: number) {
        const hours = Math.floor(secondsLeft / 60 / 60).toString().padStart(2, "0");
        const minutes = Math.floor(secondsLeft / 60 % 60).toString().padStart(2, "0");
        const seconds = Math.floor(secondsLeft % 60).toString().padStart(2, "0");
        this.countdownStatusBarItem.text = `${hours}:${minutes}:${seconds}`;
        if (secondsLeft < 60) this.countdownStatusBarItem.color = "red";
        else this.countdownStatusBarItem.color = undefined;
    }

    private handleCountdownEnd() {
        this.countdownStatusBarItem.hide();
        vscode.window.showInformationMessage("Game over!");
    }
}