# Discord Bot Based Minecraft Server Manager

Minecraft Server - Node.js Server - Discord Bot

Member of your discord with Subscriber Role can request whitelist by typing !join MinecraftName, and admin can send minecraft command lines through !c commands

type !help for more info.

Each Discord User can only register one Minecraft Username, the Key-Value pair is store into the DiscordUserState.json. 

## How to use
Drop Everything Into Minecraft Server directory (Where you Server.jar is) and install packages
```
npm install
```

In the DiscordBot directory, find config.json and apply the following values

Token : 
Your [Discord Bot Token](https://discord.com/developers/applications)
Must have the following permission: View Channels, Send Messages, Read Message History, Add Reactions

serverStartUpCommand :
Command line to start up start.bat/start.sh that comes with Minecraft Server, remember to set the default EULA agreement to YES.

Example: Windows
```
cmd /c start.bat
```

Inside the start.bat should look something like this

```
echo eula=true>eula.txt
java.exe -server -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -Xmx6144M -Xms4096M -jar Server.jar nogui
```

channelName_Command :
The name of channel in your discord for bot

SubscriberRoleName : 
The name of your members role in discord

ServerAdminRoleName :
The name of your admin role in discord

Run app.js

The Minecraft Server will run automatically after Node.js Start and recover if crash.
