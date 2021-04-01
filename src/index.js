require("dotenv").config();
let express = require("express");
let bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.listen(process.env.PORT || 3000, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);

const Discord = require("discord.js");
const client = new Discord.Client({
  ws: { intents: Discord.Intents.ALL },
});

const commandsEmbed = new Discord.MessageEmbed()
  .setTitle("List of Commands")
  .addField({
    name: "/ivy",
    value: "Lists Commands",
  });

const createAPIMessage = async (interaction, content) => {
  const { data, files } = await Discord.APIMessage.create(
    client.channels.resolve(interaction.channel_id),
    content
  )
    .resolveData()
    .resolveFiles();
  return { ...data, files };
};

const reply = async (interaction, response) => {
  let data = {
    content: response,
  };
  // If reply is object, make it an embed.
  if (typeof response === "object") {
    data = await createAPIMessage(interaction, response);
  }
  client.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: 4,
      data,
    },
  });
};
// const tile = require("./commands/tile");
const emoji = require("node-emoji");

const sentEmojis = [];

client.on("ready", () => {
  console.log("I am ready!");
});

client.ws.on("INTERACTION_CREATE", async (interaction) => {
  const command = interaction.data.name.toLowerCase();
  if (command === "ivy") {
    // Default commands list.
    reply(interaction, commandsEmbed);
  }
});
// app.post('/',(req,res) => {
//   Holy shit change this to something more secure.

//   Get channel ID by text.
//   let generalChannel = client.channels.cache.find(channel => channel.name.toLowerCase() == 'general');
//   let {content} = req.body;
//   Here you can destruct anything off the JSON sent
//   by IFTTT.
//   console.log(req.body);
//   console.log(content)
//   if(generalChannel)
//   {
//      generalChannel.send(content);
//   }
//   res.sendStatus(200);

// })

app.get("/guilds", (req, res) => {
  // Return some FUCKING CHANNEL IDS BOIII
  let allChannels = client.guilds.cache.map((g) => g.id).join("\n");
  res.send(allChannels);
});

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
