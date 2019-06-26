const tmi = require('tmi.js');
const utils = require('./utils')
const https = require("https");
const fs = require("fs");


const rawjson = fs.readFileSync('options.json');
const optsraw = JSON.parse(rawjson);

let listOfViewers = [];

const opts = {
    identity: {
        username: 'qiqeteBot',
        password: optsraw.identity.password
    },
    channels: [
        optsraw.channels[0]
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);

// Connect to Twitch:
client.connect();

setTimeout(() => { updateWatcherList() }, 3000);
// setTimeout(() => { setInterval(updateWatcherList, 30000) }, 3000);

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log('QiqeteBot ready for action');
    client.action('qiqete', 'QiqeteBot ready for action');

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
            console.log(body.chatters.viewers);
            console.log(listOfViewers);
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
                    client.action('qiqete', greet);
                }
                listOfViewers = newListOfViewers;
            }
            else {
                client.action('qiqete', "I'm sorry qiqe, no new viewers joined your stream");
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
    if (message.startsWith("!help")) {
        client.action('qiqete', 'no help provided');
    }
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