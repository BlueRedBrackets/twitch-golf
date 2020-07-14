import * as vscode from "vscode";
import * as twitch from "tmi.js";
import IFeature from "../feature";
import twitchChatHtml from "./twitchChatWebView.html";

export default class TwitchChatFeature implements IFeature {
    private client: twitch.Client | undefined;
    private chatOuput: vscode.WebviewPanel | undefined;

    private async getClient(
        username: string,
        channel: string,
        token: string
    ): Promise<twitch.Client> {
        if (!this.client === undefined || this.client?.readyState() !== "OPEN") {
            this.client = twitch.client({
                identity: {
                    username: username,
                    password: token,
                },
                channels: [channel],
                //@ts-ignore
                reconnect: true
            });
            await this.client.connect();
        }
        return this.client;
    }

    private removeThreatOfInjectionAttackAndReturnAPartialMessage(raw: string): string {
        return `<div>${raw.replace(
            /[^0-9A-Za-z ]/g,
            c => "&#" + c.charCodeAt(0) + ";"
        )}</div>`;
    }


    
    private relayMessage(target: string, context: any, message: string, isMe: boolean): void {
        let messageHtml = '';
        const cleanedEmotes = [];
        for (let emoteId in context.emotes || []) {
            for (let locationString of context.emotes[emoteId]){
                const location = locationString.split('-');
                cleanedEmotes.push({
                    start: Number(location[0]), 
                    end: Number(location[1]), 
                    url: `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/1.0`
                });
            }
        }

        let i = 0;
        for (let emote of cleanedEmotes.sort((a, b) => a.start - b.start)) {
            messageHtml += this.removeThreatOfInjectionAttackAndReturnAPartialMessage(message.substring(i, emote.start));
            messageHtml += `<img src="${emote.url}"/>`;
            i = emote.end + 2;
        }

        messageHtml += this.removeThreatOfInjectionAttackAndReturnAPartialMessage(message.substring(cleanedEmotes[cleanedEmotes.length - 1]?.end + 1 || 0));

        {this.chatOuput?.webview.postMessage({
            user: context["display-name"],
            userColor: context.color,
            message: messageHtml,
        });}
    }

    private async displayTwitchChat(context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration("twitchGolf");
        let botOAuthToken: string | undefined = config.get("botOAuthToken");
        let botUsername: string | undefined = config.get("botUsername");
        let channel: string | undefined = config.get("channel");

        if (!botUsername) {
            botUsername = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: "Type your twitch bot username."
            });
            if (!botUsername) {throw Error("Invalid twitch bot username provided.");}
            config.update("botUsername", botUsername, true);
        }

        if (!channel) {
            channel = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: "Type your twitch channel.",
            });
            if (!channel) {throw Error("Invalid channel provided.");}
            config.update("channel", channel, true);
        }

        if (!botOAuthToken) {
            await vscode.env.openExternal(
                vscode.Uri.parse("https://twitchapps.com/tmi/")
            );
            botOAuthToken = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: "Type your twitch bot OAuth token",
            });
            if (!botOAuthToken) {throw Error("Invalid OAuth token provided.");}
            config.update("botOAuthToken", botOAuthToken, true);
        }

        //chat view
        this.chatOuput = vscode.window.createWebviewPanel(
            "twitch-chat",
            "Twitch Chat",
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );
        this.chatOuput.reveal();
        this.chatOuput.webview.html = twitchChatHtml;
        this.chatOuput.onDidDispose(() => this.client?.disconnect());

        //chat client
        const client = await this.getClient(botUsername, channel, botOAuthToken);
        client.on("message", this.relayMessage.bind(this));
    }

    async installOn(context: vscode.ExtensionContext): Promise<void> {
        vscode.commands.registerCommand(
            "twitch-golf.displayTwitchChat",
            async () => {
                await this.displayTwitchChat(context);
            }
        );
    }
}
