require("dotenv").config();
let express = require('express')
let bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.listen(process.env.PORT||3000, () =>
  console.log('Example app listening on port 3000!'),
);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const Discord = require("discord.js");
const client = new Discord.Client({
  ws: { intents: Discord.Intents.ALL },
});

// const tile = require("./commands/tile");
const emoji = require("node-emoji");

const sentEmojis = [];

client.on("ready", () => {
  console.log("I am ready!");
});

app.post('/',(req,res) => {
  res.sendStatus(200);
  console.log(req.body);
})
client.on("message", async (message, guild) => {
  // I'm too lazy to figure out why imports aren't working.
  // if (message.content.startsWith("!")) {
  //   tile(message);
  // }
});

//on user join
client.on("guildMemberAdd", async (member) => {
  //gets channel info
  let channel = member.guild.channels.cache.get(member.guild.systemChannelID);

  // function to find emoji based on query
  const searchForRandomEmoji = (query) => {
    let emojiArray = emoji.search(query);

    if (emojiArray.length === 0) {
      emojiArray = emoji.search("");
    }

    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
  };

  //splits new member's username, removing special characters, into an array
  const re = "/[A-z]/g";

  let splitName = member.user.toString().replace(re, "").split("");
  let query;

  if (splitName.length > 0) {
    const count = Math.floor(
      Math.random() * Math.floor(splitName.length > 1 ? 2 : 1) + 1
    );
    query = splitName.sort(() => Math.random() - Math.random()).slice(0, count);
  } else {
    query = "";
  }

  //calls the emoji search function
  let randomEmoji = searchForRandomEmoji(query);
  if (sentEmojis.includes(randomEmoji.key)) {
    // Sends a completely random emoji if one has been sent before.
    console.log("Emoji already used");

    try {
      channel.messages.fetch({ limit: 1 }).then((messages) => {
        let lastMessage = messages.first();
        let newRandomEmoji = searchForRandomEmoji("");

        lastMessage.react(newRandomEmoji.emoji);
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    if (randomEmoji.key.includes("flag")) {
      // It should just send a smiley for crying out loud.
      console.log("Flag, flag.");
      try {
        channel.messages.fetch({ limit: 1 }).then((messages) => {
          let lastMessage = messages.first();
          let newRandomEmoji = searchForRandomEmoji("smile");

          lastMessage.react(newRandomEmoji.emoji);
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      // Get Channel ID then find last msg to react to (server message)
      channel.messages.fetch({ limit: 1 }).then((messages) => {
        let lastMessage = messages.first();

        lastMessage.react(randomEmoji.emoji);
      });

      //checks to see if length of tracked emojis is equal to 20
      //if so, removes first (oldest) emoji from array
      if (sentEmojis.length === 20) {
        sentEmojis = sentEmojis.shift();
      }
      sentEmojis.push(randomEmoji.key);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
