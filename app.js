//Modules
const Discord = require('discord.js')
const exec = require('child_process').exec 
const fs = require('fs');

//Files
const config = require('./DiscordBot/config.json')
const DiscordJSON = require('./DiscordBot/DiscordUserState.json')

//Settings
const client = new Discord.Client()

const Token = config.Token
const serverStartUpCommand = config.serverStartUpCommand
const channelName_Command = config.channelName_Command

const SubscriberRoleName = config.SubscriberRoleName
const ServerAdminRoleName = config.ServerAdminRoleName

//  ███╗   ███╗██╗███╗   ██╗███████╗ ██████╗██████╗  █████╗ ███████╗████████╗
//  ████╗ ████║██║████╗  ██║██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
//  ██╔████╔██║██║██╔██╗ ██║█████╗  ██║     ██████╔╝███████║█████╗     ██║   
//  ██║╚██╔╝██║██║██║╚██╗██║██╔══╝  ██║     ██╔══██╗██╔══██║██╔══╝     ██║   
//  ██║ ╚═╝ ██║██║██║ ╚████║███████╗╚██████╗██║  ██║██║  ██║██║        ██║   
//  ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   
//Minecraft Server Will Be Spawn As Child_Process

//Global States
var isServerUp = false
var minecraftServerProcess = exec(serverStartUpCommand);

//Initialize
BindEventToServerProcess(minecraftServerProcess)

//Bind Event To New Process
async function BindEventToServerProcess(ServerProcess){
    //Closed
    ServerProcess.on("close", function() {
        isServerUp = false
        console.log("Server DOWN! DOWN! DOWN! Engineering Report To The Deck!")

        RestartServer()
    })
    
    //Error
    ServerProcess.on("error", function(err) {
        // ugh, something went wrong
        console.log("Server error:", err);
    });

    //Communication
    ServerProcess.stdout.on('data', log);
    ServerProcess.stderr.on('data', log);
}

//Restart Server
async function RestartServer(){
    //A Delay To Free Up The Port
    if(minecraftServerProcess) minecraftServerProcess.stdin.write("stop")
    await sleep(1200);
    minecraftServerProcess = exec(serverStartUpCommand)
    BindEventToServerProcess(minecraftServerProcess)
}

//Logging and Intercept the Done Message From Server
async function log(data) {
    let dataString = data.toString()
    process.stdout.write(data.toString());
    if(dataString.includes('[minecraft/DedicatedServer]: Done')){
        isServerUp = true
        console.log("Server is Up!")
    }
}

//  ██████╗ ██╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗     ██████╗  ██████╗ ████████╗
//  ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
//  ██║  ██║██║███████╗██║     ██║   ██║██████╔╝██║  ██║    ██████╔╝██║   ██║   ██║   
//  ██║  ██║██║╚════██║██║     ██║   ██║██╔══██╗██║  ██║    ██╔══██╗██║   ██║   ██║   
//  ██████╔╝██║███████║╚██████╗╚██████╔╝██║  ██║██████╔╝    ██████╔╝╚██████╔╝   ██║   
//  ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═════╝  ╚═════╝    ╚═╝                                                                                                                                                
//Command Trigger Prefix
const prefix = '!';

//Confirm Ready
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.cache.find(entry => entry.name === channelName_Command)
    .send("The Bot Is Awake, You Have 20 Seconds To Comply")
});

//A key-value pair for DiscordID : MinecraftName
function SetDiscordUserState(DiscordID,MinecraftName){
    let DataEntry = {
        [DiscordID] : MinecraftName
    }
    
    console.log(JSON.stringify(DataEntry))
    fs.writeFileSync(DiscordJSON, JSON.stringify(DataEntry), function(err) {
        if(err) console.log(err);
        console.log(DiscordID + " Has Assign His Minecraft Whitelist : " + MinecraftName);
    }); 
}

//If Discord already have a set -> return true, This will require user to remove their origin entry first
//Otherwise return false
function GetDiscordUserState(DiscordID){
    let DataEntries

    let rawdata = fs.readFileSync(DiscordJSON)
    DataEntries = JSON.parse(rawdata);

    for (let key in DataEntries) {
        if (DataEntries.hasOwnProperty(DiscordID)) {
            let Value = DataEntries[DiscordID]
            if(Value === "EMPTY"){
                return false;
            }else{
                return Value;
            }
        }
    }
    return false;
}
 
//Replies
client.on('message', async msg  => {
    //Ignore Messages
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;
 
    //Process the string
    const command = msg.content.slice(prefix.length).toLowerCase().split(' ')
    let DiscordID = msg.author.id
    let RoleSets = msg.member.roles.cache
    //The commands
    switch(command[0]){
        case 'help':
            msg.reply("\npathetic, Wow\n"
            + "Normie Commands : \n"
            + "!Join MinecraftName - Request to be whitelist \n\n"
            + "\nAdmin Commands : \n"
            + "!c command - !s follow by your normal minecraft commands\n\n"
            + "!Restart - Restart the server\n\n"
            )
        return;

        //Join Command - Allow User To Request Whitelist via role check
        case 'join':
            if (!isServerUp){
                msg.reply("Minecraft Server Is Starting, Please Wait You Impatience Fuck")
                return
            }

            if (command[1] == undefined){
                msg.reply("Please Include The Name Behind The Command")
                return
            } 

            if (RoleSets.find(i => i.name === SubscriberRoleName) || RoleSets.find(i => i.name === ServerAdminRoleName)){
                let result = GetDiscordUserState(DiscordID)

                if(result){
                    //User Already Add Once, Replace It With New Account Name Provided
                    minecraftServerProcess.stdin.write("whitelist remove " + result[1] +'\n')
                    minecraftServerProcess.stdin.write("whitelist add " + command[1] +'\n')
                    SetDiscordUserState(DiscordID, command[1], true)
                    msg.reply("Replace The Existed Account " + result + " With " + command[1])
                }else{
                    //New User
                    minecraftServerProcess.stdin.write("whitelist add " + command[1] +'\n')
                    SetDiscordUserState(DiscordID, command[1], false)
                    msg.react('✅');
                }
            }else{
                //User Have No Vaild Roles
                msg.reply("N OMEGALUL \n If you believe this is a mistake, @ the dude who can help you")
            }
        return

        //ADMIN COMMANDS
        //
        case 'c':
            if (!isServerUp){
                msg.reply("Minecraft Server Is Starting, Please Wait You")
                return
            }


            if (RoleSets.find(i => i.name === ServerAdminRoleName)){
                //Force Add A User To Minecraft Server OP List
                minecraftServerProcess.stdin.write(command[1] +'\n')
                msg.react('✅');
            }else{
                //User Have No Vaild Roles
                msg.reply("This is a Admin Command")
            }
        return

        //restart server
        case 'restart':
            if (!isServerUp){
                msg.reply("Minecraft Server Is Already In The Process of Starting, Please Wait")
                return
            }

            if (RoleSets.find(i => i.name === ServerAdminRoleName)){
                if (isServerUp){
                    //Kill, Death Event Should Trigger The Restart Automatically
                    msg.reply("Restarting...This Will Take A Few Minutes")
                    minecraftServerProcess.kill()
                    RestartServer()
                }
            }else{
                //User Have No Vaild Roles
                msg.reply("This is a Admin Command")
            }
        return
        
        default:
            msg.reply("The hell you talking about")
        return
    }
});
 
//Kill Server if Node Crashed
process.on('exit', function() {
    minecraftServerProcess.kill();
});

client.login(Token);