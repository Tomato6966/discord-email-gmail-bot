/**
 * @SETUP Importing all needed Modules
 */
const Imap = require('node-imap'); //for reading imap emails likegmail
const Discord = require('discord.js'); //the official discord.js-master branche wrapper
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
const Enmap = require("enmap");
client.OldMails_db = new Enmap({ name: 'OldMails' });
//Login into the Discord Client
client.login(config.token);
//Log everytime the Discord Client got the first connection possible after the login
client.on("ready", () => {
    console.log("Bot is ready, logging in to email account...")
    //Ensure the database
    client.OldMails_db.ensure("LatestMail", {
        data: "(#00000)"
    })
    //Require the first email client with the client and imap parameter 
    require("./email.js")(client, imap)
    /* You can add code here if you want */
});
/**
 * @INFO
 * This Bot got made for Milrato Development https://milrato.eu | discord.gg/milrato
 * @INFO
 * This Bot is made and Coded by Tomato#6966  https://github.com/Tomato6966
 * @INFO
 * If u share or use this Bot make sure to give us / Tomato#6966 Credits
 * @INFO
 * Website: https://milrato.eu  |  Discord: https://dc.milrato.eu
 * @INFO   
 */
