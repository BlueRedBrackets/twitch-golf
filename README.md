# Code Golf Extension for Visual Studio Code with Twitch Integration

Let's face it. However great a game code golf is, its live-streaming presence is sadly nonexistent. Could it be the lack of accessibility? Maybe it's the lack of viewer engagement. Perhaps, it's just plain boring.

Not anymore.

Introducing Twitch Golf, the VS Code extension for code golf enthusiasts.

## Quick start
1. Install the Twitch Golf extension for VS Code
1. Open up a text file
1. Type `ctrl+shift+p` and run the `Twitch Golf: Enable Character Count` command
1. Type `ctrl+shift+p` and run the `Twitch Golf: Start Countdown` command
1. Play ball!


## Twitch Integration
Twitch integration is in development. As of now, a simple twitch chat panel is all that's available.

To enable twitch chat:
1. Set the `botUsername` configuration to your twitch bot account username
1. Set the `channel` configuration to your twitch stream account username
1. Type `ctrl+shift+p` and run the `Twitch Golf: Display Twitch Chat` command
1. Open the external site and follow the authorization prompts to recieve your bot account's OAuth token
1. Paste your bot's OAuth token into the VS Code prompt

To disable twitch chat either:
- Type `ctrl+shift+p` and run the `Twitch Golf: Hide Twitch Chat` command
or:
- Set the `displayTwitchChat` configuration to `false`