const tmi = require('tmi.js');
const utils = require('./utils.js');
const https = require("https");
var request = require("request");
const fs = require("fs");


const rawjson = fs.readFileSync('secret.json');
const secret = JSON.parse(rawjson);

let listOfViewers = [];
let interactionsLastMinute = 0;
const interactionLimit = 4;
let requestsLastMinute = 0;
const requestLimit = 28;

const opts = {
    identity: {
        username: 'qiqeteBot',
        password: secret.oauthBot
    },
    channels: [
        'qiqete'
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);

// Connect to Twitch:
client.connect();

// setTimeout(() => { updateWatcherList() }, 3000);
setTimeout(() => { setInterval(updateWatcherList, 120000) }, 3000);
setInterval(clearInteractions, 60000);

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log("BOT CONNECTED");
    client.action('qiqete', 'here and ready for action');
    interactionsLastMinute++;

    const url = "https://tmi.twitch.tv/group/user/qiqete/chatters";
    https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            listOfViewers = body.chatters.viewers;
        });
    });
}

function updateWatcherList() {
    const url = "https://tmi.twitch.tv/group/user/qiqete/chatters";

    https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            let newListOfViewers = body.chatters.viewers;

            if (!listOfViewers.equals(newListOfViewers)) {
                let newViewers = newElementsOnArr(newListOfViewers, listOfViewers);
                if (newViewers != null) {
                    let greet = 'Hello ';
                    for (i = 0; i < newViewers.length; i++) {
                        if (i == newViewers - 1 && i != 1) {
                            greet += "and " + newViewers[i];
                        } else
                            greet += newViewers[i] + ' ';
                    }
                    greet += "! 🙆";
                    client.action('qiqete', greet);
                    interactionsLastMinute++;
                }
                listOfViewers = newListOfViewers;
            }
            else {
                console.log("I'm sorry qiqe, no new viewers joined your stream🙅‍");
            }
        });
    });
}

function newElementsOnArr(newArr, oldArr) {
    return newArr.filter(x => !oldArr.includes(x));
}


function onMessageHandler(channel, userstate, message, self) {
    if (self) return; // Bot itself was the sender of the message so do don't interpret it
    console.log(message);
    if (message.startsWith("!")) {
        if (message.startsWith("!help")) {
            client.action('qiqete', '!uptime for uptime <3');
            interactionsLastMinute++;
        } else if (message.startsWith("!uptime")) {
            getUptime();
        }
    }
}

let startTime;
function getUptime() {
    if (!startTime != null) {
        console.log("requesting time");
        var options = {
            method: 'GET',
            url: 'https://api.twitch.tv/helix/streams',
            qs: { user_login: 'qiqete' },
            headers: { 'Client-ID': secret.client_id }
        };

        request(options, function (error, response, body) {
            if (error) {
                client.action('qiqete is not streaming atm');
                return;
            }
            else if (JSON.parse(body).data.length > 0) {
                startTime = new Date(JSON.parse(body).data[0].started_at);
                client.action('qiqete', utils.msToTime(Date.now() - startTime));
            } else {
                client.action('qiqete', 'qiqete is not streaming atm');
            }
        });
    } else {
        let startTimeDate = Date.parse(startTime);
        client.action('qiqete', utils.msToTime(Date.now() - startTimeDate));
    }
}


function clearInteractions() {
    interactionsLastMinute = 0;
}



















// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });