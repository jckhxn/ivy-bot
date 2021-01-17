//  Issues
//  Stress testing it sometimes the bot reacts to the previous msg
//  I think this is a Discord cache issue, maybe enforce  w/ timestamp
// Flags sometimes show up???
const Discord = require("discord.js");
const client = new Discord.Client({
  ws: { intents: Discord.Intents.ALL },
});

let emoji = require("node-emoji");
let sentEmojis = [];

// require("dotenv").config();

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("guildMemberAdd", (member) => {
  // Do thing when a new user joins
  // Keeping track of emojis logic.
  if (sentEmojis.length == 20) {
    // Empty array
    sentEmojis = [];
  }

  // Find emoji based on username
  let firstLetters = member.user.username.substring(0, 1);
  let emojiArray = emoji.search(firstLetters);
  let defaultEmojiArray = emoji.search("");

  let randomEmoji = emojiArray[Math.floor(Math.random() * emojiArray.length)];
  let randomDefaultEmoji =
    defaultEmojiArray[Math.floor(Math.random() * defaultEmojiArray.length)];

  let channel = member.guild.channels.cache.get(member.guild.systemChannelID);

  if (sentEmojis.includes(randomEmoji.key)) {
    // Sends a completely random emoji if one has been sent before.
    console.log("Emoji already used");

    channel.messages.fetch({ limit: 1 }).then((messages) => {
      let lastMessage = messages.first();

      lastMessage.react(randomDefaultEmoji.emoji);
    });
  } else {
    // Get Channel ID then find last msg to react to (server message)

    channel.messages.fetch({ limit: 1 }).then((messages) => {
      let lastMessage = messages.first();

      lastMessage.react(randomEmoji.emoji);
    });
    sentEmojis.push(randomEmoji.key);
  }
});

client.login(process.env.DISCORD_TOKEN);
