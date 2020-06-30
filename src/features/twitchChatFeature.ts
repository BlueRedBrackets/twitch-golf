import * as vscode from "vscode";
import * as twitch from "tmi.js";
import IFeature from "../feature";
import twitchChatHtml from "./twitchChatWebView.html";

export default class TwitchChatFeature implements IFeature {
  private _client: twitch.Client | undefined;
  private chatOuput: vscode.WebviewPanel | undefined;

  private async getClient(
    username: string,
    channel: string,
    token: string
  ): Promise<twitch.Client> {
    if (!this._client === undefined || this._client?.readyState() !== "OPEN") {
      this._client = twitch.client({
        identity: {
          username: username,
          password: token,
        },
        channels: [channel],
      });
      await this._client.connect();
    }
    return this._client;
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
    this.chatOuput.onDidDispose(() => this._client?.disconnect());

    //chat client
    const client = await this.getClient(botUsername, channel, botOAuthToken);
    client.on("message", (target, context, message, isMe) => {
      this.chatOuput?.webview.postMessage({
        user: context["display-name"],
        userColor: context.color,
        message: message,
      });
    });
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
