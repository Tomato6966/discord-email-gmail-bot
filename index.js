const Discord = require("discord.js");
const client = new Discord.Client();
client.login("NzQ4MDk2MTcwNjk3NTU1OTY5.X0Yc2g.tT4pFNWNqrzRhz7Q8yjMty9vZW4");
const OLDMAILS = new Map();
client.on("ready", () => {
    console.log("Bot is ready 2 use");
    OLDMAILS.set("KEY", "something");
});
const Imap = require("node-imap");
const inspect = require("util").inspect;
const fs = require("fs");
const config = require("./config.json")

const imap = new Imap({
    user: config.emailclient.user,
    password: config.emailclient.password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
});

function openInbox(callback){
   imap.openBox("INBOX", true, callback); 
}
function sendNewest(){
    openInbox(function(err, box) {
        if(err) throw err;
        var buffer2 = "";
        var buffer = ""; 
        let i = 0;
        let embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("NEW EMAIL")
     
        var f = imap.seq.fetch(box.messages.total + ":*", {
            id: 1,
            bodies: [`HEADER.FIELDS (FROM TO SUBJECT DATE)` , "1"],
            struct: true
        })
        var f2 = imap.seq.fetch(box.messages.total + ":*", {
            id: 1,
            bodies: [`HEADER.FIELDS (FROM TO SUBJECT DATE)`],
            struct: true
        })
        f2.on("message", (message, index) => {
            message.on("body", (stream, info) => {
          
                var count = 0;
                var prefix = "(#" + index + ")";

                stream.on("data", function(chunk) {
                    count += chunk.length;
                    buffer2 += chunk.toString("utf8");
                })

                stream.once("end", async function() {
                    i++;
                    runit()
                })
            })
        })
        f.on("message", (message, index) => {
            message.on("body", (stream, info) => {
          
                var count = 0;
                var prefix = "(#" + index + ")";

                stream.on("data", function(chunk) {
                    count += chunk.length;
                    buffer += chunk.toString("utf8");
                })

                stream.once("end", async function() {
                    i++;
                    runit()
                })
            })
        })
        async function runit(){
            if(i==2){
            var themsg = buffer2 + buffer;
            var channel = await client.channels.fetch("797043865567625308");     
            if(themsg === OLDMAILS.get("KEY")){ 
                return console.log("MULTIPLE EMAILS ARE THE SAME NO RESULT HERE AGAIN THE BUFFER: \n" + buffer)
            }
            else{
                OLDMAILS.set("KEY", themsg)
            }
            if(themsg.length > 2000){
                embed.setDescription(themsg.substr(0, 2000) + "...")
            }
            embed.setDescription(themsg)
            channel.send(embed);
            }
        }
        f.on("error", function(err){
            console.log(err)
        });
        f.on("end", function(){
            console.log("FINSHED!")
        });
    })
}
imap.on("ready", async function(){
    while( 1 !== 0 )
    {
        console.log("fetching mails");
        await sendNewest();
        await delay(1*60*1000)
    }
})

imap.connect();

function delay (delayInms){
    return new Promise( resolve => {
        setTimeout(()=>{
            resolve(2);
        }, delayInms);
    });
}