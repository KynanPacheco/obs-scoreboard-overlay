import './style.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import tmi from "tmi.js";

const params = new URLSearchParams(location.search);
const channel = params.get("channel") || "mistahanman";

function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function fetchTrivia() {
  const params = new URLSearchParams({
    amount: 1,
    type: "multiple"
  });

  const res = await fetch(`https://opentdb.com/api.php?${params}`);
  const data = await res.json();

  if (data.response_code !== 0) {
    throw new Error("OpenTDB returned error code " + data.response_code);
  }

  return data.results[0];
}

async function addQuestion(){
  let triviaQuestion = await fetchTrivia();

  const docRoot = document.getElementById("content");

  const details = triviaQuestion["difficulty"] + " - " + triviaQuestion["category"];
  let answers = triviaQuestion["incorrect_answers"];
  answers.push(triviaQuestion["correct_answer"]);
  answers = shuffleArray(answers);
  let answer = answers.indexOf(triviaQuestion["correct_answer"]);

  const q = document.createElement("h1");
  const d = document.createElement("p");
  const a = document.createElement("ul");
  const questionContainer = document.createElement("div");

  q.innerHTML = triviaQuestion["question"];
  d.innerHTML = details

  for(let i = 0; i < answers.length; i++){
    const li = document.createElement("li");
    li.innerHTML = answers[i];
    a.append(li);
  }

  questionContainer.append(q);
  questionContainer.append(d);
  questionContainer.append(a);

  docRoot.append(questionContainer);

  return answer;
}

function removeQuestion(){
  const docRoot = document.getElementById("content");
  docRoot.replaceChildren();
}

const client = new tmi.Client({
  connection: { secure: true, reconnect: true },
  channels: [channel]
});

client.connect().catch(console.error);

client.on("connected", (addr, port) => {
  console.log("Connected to", addr, port);
});

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  const isPrivileged = tags.badges?.moderator === "1" || tags.badges?.broadcaster === "1";

  if (isPrivileged && message.includes("!q")){
    console.log("A Moderator has triggered a question");
  }

  let guess = -1;
  if(message.includes("!a")){
    switch(message[3]){
      case "a":
        guess = 0;
        break;
      case "b":
        guess = 1;
        break;
      case "c":
        guess = 2;
        break;
      case "d":
        guess = 3;
        break;
      default:
        console.log("Error, invalid selection");
    }
    console.log(tags.username + " guessed " + guess)
  }
});

client.on("cheer", (channel, userstate, message) =>{

});

let quest = await addQuestion();

console.log(quest);
