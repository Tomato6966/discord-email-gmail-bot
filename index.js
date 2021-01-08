//CONFIGURATION 
//EMBED SETUP
const Imap = require('node-imap');
const inspect = require('util').inspect;
const fs  = require('fs');
const Discord  = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');
//CREATE THE EMAIL CLIENT
var imap = new Imap({
    user: config.emailclient.user,
    password: config.emailclient.password,
    host: config.emailclient.host,
    port: config.emailclient.port,
    tls: config.emailclient.tls
});
const OLDMAILS = new Map(); 
///EVENTS

client.login(config.token); //login into the bot
//log when ready..
client.on("ready", () => {
    console.log("Bot is ready, logging in to email account...")
    OLDMAILS.set("LatestMail", "Unasdaweuhau2qehdouwhjnb2ß7sadg2");
    /* You can add code here if you want */
});
//a Function for calling the Bot
function openInbox(callback) {
    imap.openBox('INBOX', true, callback);
}
  
// Send the newest message to discord
function sendNewest() {
    openInbox(function(err, box) {
        if (err) throw err; //if an error occurs show it
        //THE SEARCH OPTIONS FROM THE CONFIG FILE
        var FROM = config.emailclient.options.FROM; 
        var TO = config.emailclient.options.TO;
        var SUBJECT = config.emailclient.options.SUBJECT;
        var DATE = config.emailclient.options.DATE;
        if(!FROM) FROM = "FROM"; //if no search option replace it
        if(!TO) TO = "TO";//if no search option replace it
        if(!SUBJECT) SUBJECT = "SUBJECT";//if no search option replace it
        if(!DATE) DATE = "DATE";//if no search option replace it
        
        //fetch the latest email
        var f = imap.seq.fetch(box.messages.total + ':*', { //with the options
            id: 1,
            bodies: [`HEADER.FIELDS (${FROM} ${TO} ${SUBJECT} ${DATE})`, '1'],
            struct: true
        })
        //when the fethc is finished
        f.on('message', (message, index) => {
            message.on('body', (stream, info) => { //create the message infos
                var buffer = '', count = 0;
                var prefix = '(#' + index + ') ';

                stream.on('data', function(chunk) {
                    count += chunk.length; //add a length
                    buffer += chunk.toString('utf8'); //add the plain information text
                });
                //when its finished, getting the information
                stream.once('end', async function() {
                    var channel = await client.channels.fetch(config.channel); //Define the Channel
                    let embed = new Discord.MessageEmbed() //create the Embed with the config options
                    .setColor("BLACK")
                    if(config.embed.color) embed.setColor(config.embed.color);
                    if(config.embed.Footer){
                        if(config.embed.Footer.text) embed.setFooter(config.embed.Footer.text, config.embed.Footer.icon);
                        else embed.setFooter(client.user.username, channel.guild.iconURL())
                    }
                    if(config.embed.Author){
                        if(config.embed.Author.text) embed.setAuthor(config.embed.Author.text, config.embed.Author.icon);
                        else embed.setAuthor(client.user.username, channel.guild.iconURL())
                    }
                    if(config.embed.Thumbnail) embed.setThumbnail(config.embed.Thumbnail)
                    if(config.emailclient.options.FROM) embed.setTitle("New Email from: `" + FROM + "`");
                    else {
                        embed.setTitle("New Email");
                    }
                    embed.setDescription(buffer)
                    channel.send(embed); //Send the Embed
                });

            });
        });
        
        f.once('error', function(err) { //when an error happens do this
            console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
            console.log('Done fetching all messages!');
        });
    });

}
//once imap is ready, call the functions
imap.on('ready',async function() {
    while(Number(config.emailclient.loop_check_time_in_min) !== 0)
    {   console.log("fetching emails")
        await sendNewest();
        await delay(Number(config.emailclient.loop_check_time_in_min)*1000*60);
    }
});
//connect to the imap client
imap.connect();
//delay function
function delay (delayInms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}