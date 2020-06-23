import * as vscode from "vscode";
import * as twitch from 'tmi.js';
import IFeature from "../feature"
import * as path from 'path'
import * as fs from 'fs'


export default class TwitchChatFeature implements IFeature {
    private _client: twitch.Client | undefined;
    private chatOuput: vscode.WebviewPanel | undefined;

    private async getClient(username: string, channel: string, token: string): Promise<twitch.Client> {
        if (!this._client === undefined || this._client?.readyState() !== 'OPEN') {
            this._client = twitch.client({
                identity: {
                    username: username,
                    password: token
                },
                channels: [channel]
            });
            await this._client.connect();
        }
        return this._client;
    }

    private async displayTwitchChat(context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration('twitchGolf');
        let botOauthToken: string | undefined = config.get('botOauthToken');
        const botUsername: string | undefined = config.get('botUsername');
        const channel: string | undefined = config.get('channel');

        if (!botUsername) throw Error("botUsername setting is not defined.ks");
        if (!channel) throw Error("channel setting is not defined.ks");
        if (!botOauthToken) {
            await vscode.env.openExternal(vscode.Uri.parse("https://twitchapps.com/tmi/"));
            botOauthToken = await vscode.window.showInputBox({
                ignoreFocusOut: true
            });
            if (!botOauthToken) throw Error("invalid OAuth token provided.");
            config.update('botOauthToken', botOauthToken);
        }

        //chat view
        this.chatOuput = vscode.window.createWebviewPanel('twitch-chat', 'Twitch Chat', vscode.ViewColumn.Beside, { enableScripts: true });
        this.chatOuput.reveal();
        const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'features', 'twitchChatWebView.html'));
        this.chatOuput.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');

        //chat client
        const client = await this.getClient(botUsername, channel, botOauthToken)
        client.on('message', (target, context, message, isMe) => {
            this.chatOuput?.webview.postMessage({
                user: context["display-name"],
                userColor: context.color,
                message: message
            });
        });

        config.update('enableTwitchChat', true);
    }

    private hideTwitchChat() {
        this.chatOuput?.dispose();
        this._client?.disconnect();
    }

    async installOn(context: vscode.ExtensionContext): Promise<void> {
        vscode.commands.registerCommand("twitch-golf.displayTwitchChat", async () => {
            await this.displayTwitchChat(context);
        });
        vscode.commands.registerCommand("twitch-golf.hideTwitchChat", this.hideTwitchChat.bind(this));

        const config = vscode.workspace.getConfiguration("twitchGolf");
        if (config.get('displayTwitchChat')) {
            await this.displayTwitchChat(context);
        }
    }
}