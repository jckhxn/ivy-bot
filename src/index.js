const Discord = require("discord.js");
const client = new Discord.Client({
  ws: { intents: Discord.Intents.ALL },
});
require("dotenv").config();
const tile = require("./commands/tile");
const emoji = require("node-emoji");

const sentEmojis = [];

client.on("ready", () => {
  console.log("I am ready!");

});

client.on("message", async (message,guild) => {
  
  if (message.content.startsWith("!")) {
    tile(message);
  }
  
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
});

client.login(process.env.DISCORD_TOKEN);
