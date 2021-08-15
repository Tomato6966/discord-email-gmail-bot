/**
 * @SETUP Importing all needed Modules
 */
const Imap = require("node-imap"); //for reading imap emails likegmail
const Discord = require("discord.js"); //the official discord.js-master branche wrapper
const client = new Discord.Client(); //creating the DiscordClient from discord.js library
const config = require("./config.json"); //loading the onfig data
const fs = require("fs"); //for creating temp files etc.
/**
 * @INFO - THE MODULE ITSELF
 * @param {*} client a DiscordClient
 * @param {*} imap an Imap
 */
module.exports = async (client, imap) => {
    /**
     * @INFO - Imap#Connect
     * connect to the imap client
    */
    await imap.connect();
    //Log information
    console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: CONNECTED TO THE IMAP", "\x1b[0m")
    /**
     * @INFO - OpenInbox(callback)
     * This function opens the Inbox for giving information
     */
    function openInbox(callback) {
        imap.openBox(config.emailclient.INPUT_BOX, true, callback);
    }

    /**
     * @INFO - SendNewest () 
     * This function Sends the Latest Email inot a defined Discord Channel, only if the email is not the same as the one before
     */
    function sendNewest() {
        try {
            openInbox(function (err, box) {
                if (err) throw err; //if an error occurs show it
                //THE SEARCH OPTIONS FROM THE CONFIG FILE
                var FROM = config.emailclient.options.FROM;
                var TO = config.emailclient.options.TO;
                var SUBJECT = config.emailclient.options.SUBJECT;
                var DATE = config.emailclient.options.DATE;
                if (!FROM) FROM = "FROM"; //if no search option replace it
                if (!TO) TO = "TO"; //if no search option replace it
                if (!SUBJECT) SUBJECT = "SUBJECT"; //if no search option replace it
                if (!DATE) DATE = "DATE"; //if no search option replace it

                //fetch the latest email
                var f = imap.seq.fetch(box.messages.total + ":*", { //with the options
                    // id: 1,
                    bodies: [`HEADER.FIELDS (${FROM} ${TO} ${SUBJECT} ${DATE})`, "TEXT"],
                    // struct: true
                })
                //when the fethc is finished
                f.on("message", (message, index) => {
                    try {
                        message.on("body", (stream, info) => { //create the message infos
                            try {
                                var theBuffer = "",
                                    count = 0;
                                var prefix = "(#" + index + ") ";

                                stream.on("data", function (chunk) {
                                    try {
                                        count += chunk.length; //add a length
                                        theBuffer += chunk.toString("utf8"); //add the plain information text
                                    } catch (e) {
                                        console.log(e.stack ? e.stack : e);
                                    }
                                });
                                //when its finished, getting the information
                                stream.once("end", async function () {
                                    try {
                                        
                                        //format the buffer needed for paypal!
                                        
                                        //theBuffer = Buffer.from(theBuffer, "base64")
                                        
                                        //Return if the latestMail is the same!
                                        if (client.OldMails_db.get("LatestMail", "data") === prefix)
                                            return console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: ", "\x1b[33m", "Latest Email already sent!", "\x1b[0m");
                                        var channel = await client.channels.fetch(config.channel); //Define the Channel
                                        let embed = new Discord.MessageEmbed() //create the Embed with the config options
                                        if (config.embed.color && config.embed.Thumbnail.color > 0) embed.setColor(config.embed.color);
                                        if (config.embed.Footer.ALLOW) {
                                            if (config.embed.Footer.text) embed.setFooter(config.embed.Footer.text, config.embed.Footer.icon);
                                            else embed.setFooter(client.user.username, channel.guild.iconURL())
                                        }
                                        if (config.embed.Author.ALLOW) {
                                            if (config.embed.Author.text) embed.setAuthor(config.embed.Author.text, config.embed.Author.icon);
                                            else embed.setAuthor(client.user.username, channel.guild.iconURL())
                                        }
                                        if (config.embed.Thumbnail && config.embed.Thumbnail.length > 0) embed.setThumbnail(config.embed.Thumbnail)
                                        if (config.emailclient.options.FROM) embed.setTitle("New Email from: `" + FROM + "`");
                                        else {
                                            embed.setTitle("New Email");
                                        }
                                        //set it into the db
                                        client.OldMails_db.set("LatestMail", prefix, "data")
                                        //send the embed
                                        try {
                                            await channel.send(embed)
                                        } catch (e) {
                                            console.log(e.stack ? e.stack : e);
                                        }
                                        try {
                                            //create the filename
                                            let filename = `${process.cwd()}/${FROM.split(" ").join("_").slice(0, 40)}.html`;
                                            //create the file
                                            fs.writeFileSync(filename, theBuffer);
                                            //create an attachment, and send it into the chat
                                            const attachment = new Discord.MessageAttachment(filename); //send it as an attachment
                                            await channel.send(attachment).then(msg => {
                                                setTimeout(() => {
                                                    try {
                                                        fs.unlinkSync(filename);
                                                    } catch (e) {
                                                        console.log(e.stack ? e.stack : e);
                                                    }
                                                }, 5000);
                                            })
                                            //Console.log the output
                                            const d = new Date();
                                            return console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: ", "\x1b[32m", `Sent a new Email at: ${d.getDate()}/${d.getMonth()}/${d.getFullYear()} | ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`, "\x1b[0m");
                                        } catch (e) {
                                            console.log(e.stack ? e.stack : e);
                                        }
                                        //send the file
                                    } catch (e) {
                                        console.log(e.stack ? e.stack : e);
                                    }
                                }); //end of stream.once("end"
                            } catch (e) {
                                console.log(e.stack ? e.stack : e);
                            }
                        }); //end of stream.on("body"
                    } catch (e) {
                        console.log(e.stack ? e.stack : e);
                    }
                }); //end of f.on("message"
                f.on("error", function (err) { //when an error happens do this
                    console.log("Fetch error: " + err);
                }); //end of f.on("error"
                f.on("end", function () {
                    console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: ", "\x1b[32m", "Done fetching all messages!", "\x1b[0m");
                }); //end of f.on("end"
            }); //end of openInbox
        } catch (e) {
            console.log(e.stack ? e.stack : e);
        }
    } //end of function SendNewest
    /**
     * @INFO - Imap#ReadyEvent
     * Once Imap is READY and config loop check time per minute is defined loop through the Newest Emails
     */
    imap.on("ready", async function () {
        imap.getBoxes(async function (err, boxes) {
            if(err) console.log(err)
            else console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: ", "\x1b[32m", "Boxes registered!", "\x1b[0m");
            
            let sboxes = []
            for(const [key, value] of Object.entries(boxes)){
                sboxes.push(key)
                if(value.children) {
                    for(const [k, v] of Object.entries(value.children)){
                        sboxes.push(key+ "/" +k)
                    }
                }
            }
            console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: ", "\x1b[32m", "ALL AVAILABLE BOXES FOR THE OPTION: emailclient.INPUT_BOX", "\x1b[0m");
            console.log(sboxes.join(", "))
            //console.log(boxes)
            let check = Number(config.emailclient.loop_check_time_in_min);
            if (!check || check == 0) check = 1;
            for (let i = 1; i > 0; i++) {
                try {
                    console.log("\x1b[36m%s\x1b[0m", " [EMAIL CLIENT] :: ", "\x1b[33m", "Fetching emails", "\x1b[0m")
                    await sendNewest();
                    await delay(check * 1000 * 60);
                } catch (e) {
                    console.log(e.stack ? e.stack : e);
                }
            }
        });
    });
    /**
     * @INFO - Delay
     * Delay Function
     */
    function delay(delayInms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    }
}
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
