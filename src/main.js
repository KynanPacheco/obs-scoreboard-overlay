import './style.scss'
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import tmi from "tmi.js";

const params = new URLSearchParams(location.search);
const channel = params.get("channel") || "ultravioletriot";
const goal = params.get("goal") || 10;

let participants = {};
let participantsCount = 0;

function addUser(username){
  if(username in participants){
    return false;
  }
  const scoreboard = document.getElementById("scoreboard");
  const participantsBox = document.getElementById("participants")
  const template = document.getElementById("user-template");
  let newUser = template.cloneNode(true);

  newUser.id = username;
  let newUsername = newUser.getElementsByClassName("username");
  newUsername[0].innerHTML = username;

  template.after(newUser);

  participants[username] = 0;
  participantsCount++;
  participantsBox.innerHTML = participantsCount;

  return true;
}

function addPoint(username){
  if(username in participants){
    participants[username]++;
  } else {
    addUser(username);
    participants[username]++;
  }

  console.log(participants[username]);

  const userRow = document.getElementById(username);
  const userScore = userRow.getElementsByClassName("score");
  userScore[0].innerHTML = participants[username];
}

const client = new tmi.Client({
  connection: { secure: true, reconnect: true },
  channels: [channel]
});

client.connect().catch(console.error);

client.on("connected", (addr, port) => {
  console.log("Connected to", addr, port);
  const goalBox = document.getElementById("goal");
  const channelBox = document.getElementById("channel");

  goalBox.innerHTML = "First to " + goal + " wins!";
  channelBox.innerHTML = "Connected Channel: " + channel;
});

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  const isPrivileged = tags.badges?.moderator === "1" || tags.badges?.broadcaster === "1";

  if (isPrivileged && message.includes("!point")){
    let username = message.slice(7);
    addPoint(username);
  }

  if (message.includes("!reset")){
    window.location.reload();
  }

  if (message.includes("!join")){
    addUser(tags.username);
  }
});

client.on("cheer", (channel, userstate, message) =>{

});
