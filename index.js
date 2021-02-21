/**
   * @SETUP Importing all needed Modules
*/
const Imap = require('node-imap'); //for reading imap emails likegmail
const inspect = require('util').inspect; //thats just a util
const fs  = require('fs'); //for reading files
const Discord  = require('discord.js'); //the official discord.js-master branche wrapper
const client = new Discord.Client(); //creating the DiscordClient from discord.js library
var config = require('./config.json'); //loading the onfig data
/**
   * @EMAIL
   * Create the Email Client from your Email Account data
   * Make sure to have allowed by third parties enabled in your google account settings!!
*/
var imap = new Imap({
    user: config.emailclient.user, //your email user, usually the email address
    password: config.emailclient.password, //the password of that email addres
    host: config.emailclient.host, //host imap.google.com for example
    port: config.emailclient.port, //port 
    tls: config.emailclient.tls //tls usually on true
});
//CREATING THE DATABASE FOR THE OLD EMAILS 
const QUICK = require("quick.db-plus");
const OLDMAILS = new Quick.db('OldMails');
/**
   * @INFO DiscordClient.login
   * Login into the Discord Client
*/
client.login(config.token); 
/**
   * @INFO - DiscordClient#ReadyEvent
   * Log everytime the Discord Client got the first connection possible after the login
*/
client.on("ready", () => {
    console.log("Bot is ready, logging in to email account...")
    OLDMAILS.set("LatestMail", "Unasdaweuhau2qehdouwhjnb2ß7sadg2");
    /* You can add code here if you want */
});
/**
   * @INFO - OpenInbox(callback)
   * This function opens the Inbox for giving information
*/
function openInbox(callback) {
    imap.openBox('INBOX', true, callback);
}
  
/**
   * @INFO - SendNewest () 
   * This function Sends the Latest Email inot a defined Discord Channel, only if the email is not the same as the one before
*/
function sendNewest() {
    try {
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
                try {
                    message.on('body', (stream, info) => { //create the message infos
                    try {
                        var buffer = '', count = 0;
                        var prefix = '(#' + index + ') ';
        
                        stream.on('data', function(chunk) {
                            try {
                                count += chunk.length; //add a length
                                buffer += chunk.toString('utf8'); //add the plain information text
                            } catch(e){ console.log(e.stack); }
                        });
                        //when its finished, getting the information
                        stream.once('end', async function() {
                            try {
                                var channel = await client.channels.fetch(config.channel); //Define the Channel
                                let embed = new Discord.MessageEmbed() //create the Embed with the config options
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
                            } catch(e){ console.log(e.stack); }
                        }); //end of stream.once("end"
                    } catch(e){ console.log(e.stack); }
                    }); //end of stream.on("body"
                } catch(e){ console.log(e.stack); }
            }); //end of f.on("message"
            f.on('error', function(err) { //when an error happens do this
                console.log('Fetch error: ' + err);
            });//end of f.on("error"
            f.on('end', function() {
                console.log('Done fetching all messages!');
            });//end of f.on("end"
        } catch(e){ console.log(e.stack); }
    });//end of openInbox
}//end of function SendNewest
/**
   * @INFO - Imap#ReadyEvent
   * Once Imap is READY and config loop check time per minute is defined loop through the Newest Emails
*/
imap.on('ready', async function() {
    while(Number(config.emailclient.loop_check_time_in_min) !== 0)
    {   
        try {
            console.log("fetching emails")
            await sendNewest();
            await delay(Number(config.emailclient.loop_check_time_in_min)*1000*60);
        } catch(e){ console.log(e.stack); }
    }
});
/**
   * @INFO - Imap#Connect
   * connect to the imap client
*/
imap.connect();
/**
   * @INFO - Delay
   * Delay Function
*/
function delay (delayInms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}
/**
   * @INFO
   * This Bot got made for Milrato Development https://github.com/Milrato-Development
   * @INFO
   * This Bot is made and Coded by Tomato#6966  https://github.com/Tomato6966
   * @INFO
   * If u share or use this Bot make sure to give us / Tomato#6966 Credits
   * @INFO
   * Website: https://milrato.eu  |  Discord: https://dc.milrato.eu
   * @INFO   
*/
