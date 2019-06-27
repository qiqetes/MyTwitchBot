const tmi = require('tmi.js');
const utils = require('./utils.js');
const https = require("https");
var request = require("request");
const fs = require("fs");

console.log("Bot getting ready...");

const rawjson = fs.readFileSync('secret.json');
const secret = JSON.parse(rawjson);
const rawdata = fs.readFileSync('data.json');
const data = JSON.parse(rawdata);
const followerdata = JSON.parse(fs.readFileSync('followerdata.json'));

let listOfViewers = [];
let interactionsLastMinute = 0;
const interactionLimit = 4;
let requestsLastMinute = 0;
const requestLimit = 20;

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

setTimeout(() => { setInterval(updateEveryMin, 5000) }, 3000);
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

function updateEveryMin() {
    updateWatcherList();
    updateFollowerList();
}

function updateFollowerList() {
    const options = {
        method: 'GET',
        url: 'https://api.twitch.tv/helix/users/follows',
        qs: { to_id: '49956791', first: '5' },
        headers:
        {
            'Client-ID': secret.client_id
        }
    };

    request(options, function (error, response, body) {
        if (error) return;
        let followers = JSON.parse(body);
        for (i = 0; i < 5; i++) {
            if (followerdata.data.filter(e => { return e.id === followers.data[i].from_name }).length === 0) {
                // TODO: add this new follower to the list
                var newFollower = {
                    id: followers.data[i].from_name,
                    bot: false,
                    start: followers.data[i].followed_at,
                    points: 0
                }
                followerdata.data.push(newFollower);
            }
        }
        fs.writeFileSync('followerdata.json', JSON.stringify(followerdata));
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

            console.log(listOfViewers.equals(newListOfViewers));
            if (!listOfViewers.equals(newListOfViewers)) {
                let newViewers = newElementsOnArr(newListOfViewers, listOfViewers);
                if (newViewers.length > 0) {
                    let greet = data.botGreets[utils.randomInt(data.botGreets.length)];
                    for (i = 0; i < newViewers.length; i++) {
                        if (i == newViewers - 1 && i != 0) {
                            greet += "and @" + newViewers[i];
                        } else
                            greet += '@' + newViewers[i] + ' ';
                    }
                    greet += '! ' + data.coolEmojis[utils.randomInt(data.coolEmojis.length)];;
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
            say('!uptime for uptime < 3');
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
            qs: { user_login: secret.user_login },
            headers: { 'Client-ID': secret.client_id }
        };

        request(options, function (error, response, body) {
            if (error) {
                client.action(secret.user_login + ' is not streaming atm');
                return;
            }
            else if (JSON.parse(body).data.length > 0) {
                startTime = new Date(JSON.parse(body).data[0].started_at);
                say(utils.msToTime(Date.now() - startTime));
            } else {
                say(secret.user_login + ' is not streaming atm');
            }
        });
    } else {
        let startTimeDate = Date.parse(startTime);
        say(ToTime(Date.now() - startTimeDate));
    }
}


function clearInteractions() {
    interactionsLastMinute = 0;
}

function say(message) {
    client.action(secret.user_login, message)
}



















// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    return utils.equalsArray(this, array);
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });