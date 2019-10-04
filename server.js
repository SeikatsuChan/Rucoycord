const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

/*
  THE ABOVE CODE IS SPECIFIC FOR THOSE USING GLITCH.COM TO HOST
*/

const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const cheerio = require("cheerio");
const Enmap = require("enmap");
client.players = new Enmap({name: "players"});
const prefix = process.env.PREFIX;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function rucoyToObject(str) {
  var obj = {
    'name': 0,
    'level': 0,
    'guild': 0,    
    'last_online': 0,
    'born': 0,
  };
  var newStr = str.split("\n")
    .map(x => x.trim())
    .filter(function(x){return x != null;})
    .filter(function(x){return x != "";});
    newStr.forEach(function(v){
    if(v === 'Name'){obj['name'] = 1;}
    else if(obj['name'] == 1){obj['name'] = v;}
    else if(v === 'Level'){obj['level'] = 1;}
    else if(obj['level'] == 1){obj['level'] = v;}
    else if(v === 'Guild'){obj['guild'] = 1;}
    else if(obj['guild'] == 1){obj['guild'] = v;}
    else if(v === 'Last online'){obj['last_online'] = 1;}
    else if(obj['last_online'] == 1){obj['last_online'] = v;}
    else if(v === 'Born'){obj['born'] = 1;}
    else if(obj['born'] == 1){obj['born'] = v;}
  });
  return obj;
}

client.on("ready", () => 
{
  const mainGuild = client.guilds.get(process.env.SERVER.toString());
  console.log(`Logged in! ${client.user.username} is active in ${client.guilds.size} server(s)`);
  client.user.setActivity(`${client.users.size} members! | ${prefix}help`, { type: 'WATCHING' });
  setInterval( ()=> {
  if(process.env.AUTOROLE === "true") 
  {
    client.players.forEach((values, user) => {
      let charname = client.players.get(user, "ign")
      let currentlevel =  client.players.get(user, "levelrole")
      let supporterStatus = client.players.get(user, "supporter")
      if(charname !== "not-linked") 
      {
        request(`https://www.rucoyonline.com/characters/${charname}`, (error, response, html)=> {
          if(!error && response.statusCode == 200) 
          {
            const $ = cheerio.load(html);
            const charHeading = $('h3').text()
            const charInfo = $('tbody').first()
            const pvpInfo = $('tbody').last()
          
            let character = rucoyToObject(charInfo.text());
            if(charHeading.includes("Supporter") && client.players.get(user, "supporter") == false) 
            {
              client.players.set(user, true, "supporter")
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.SUPPORTERROLE)
              if(process.env.SUPPORTER_NOTIFS === "true") {
                mainGuild.channels.get(process.env.SUPPORTER_NOTIF_CHANNEL).send(`<@${user}> gained supporter status.`)
              }
            }
            let lvl = Math.floor(character.level/100)*100
            if(lvl >= 600 &&  client.players.get(user, "levelrole") != 600)
            {
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.LEVEL600ROLE)
              client.players.set(user, 600, "levelrole")
            } else if(lvl == 500 &&  client.players.get(user, "levelrole") != 500)
            {
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.LEVEL500ROLE)
              client.players.set(user, 500, "levelrole")
            } else if(lvl == 400 &&  client.players.get(user, "levelrole") != 400)
            {
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.LEVEL400ROLE)
              client.players.set(user, 400, "levelrole")
            } else if(lvl == 300 &&  client.players.get(user, "levelrole") != 300)
            {
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.LEVEL300ROLE)
              client.players.set(user, 300, "levelrole")
            } else if(lvl == 200 &&  client.players.get(user, "levelrole") != 200)
            {
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.LEVEL200ROLE)
              client.players.set(user, 200, "levelrole")
            } else if(lvl == 100 &&  client.players.get(user, "levelrole") != 100)
            {
              mainGuild.members.get(client.players.get(user, "user")).addRole(process.env.LEVEL100ROLE)
              client.players.set(user, 100, "levelrole")
            }
          }
        })
      }
    });
  }
    console.log("Players refreshed!")
  }, 900000)
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if(process.env.VCROLE === "true") {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel
    if(oldUserChannel === undefined && newUserChannel !== undefined) 
    {
      newMember.addRole(process.env.VCROLEID) 
    } 
    else if(newUserChannel === undefined)
    {
      newMember.removeRole(process.env.VCROLEID)
    }
  }
})

client.on("message", async(message) => 
{
  if(!message.guild) return;
  const key = message.author.id;
  client.players.ensure(key, {
      user: message.author.id,
      ign: "not-linked",
      levelrole: 0,
      supporter: false,
      kills: 0,
      deaths: 0
  });
  if(message.content.startsWith(prefix))
  {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    function clean(text) {
      if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      else
        return text;
    }
    if (message.content.startsWith(prefix + "eval")) {
      const evalargs = message.content.split(" ").slice(1);
      if(message.author.id !== process.env.OWNER) return;
      try {
        const code = evalargs.join(" ");
        let evaled = eval(code);
 
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
 
          message.channel.send(clean(evaled), {code:"xl"});
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
    }
    const command = args.shift().toLowerCase();
  
    if(command === "ping")
    {
      const msg = await message.channel.send("**Pinging...**");
      msg.edit(`**Ping:** ${msg.createdTimestamp - message.createdTimestamp}ms\n**API Latency:** ${Math.round(client.ping)}ms`);
    }
    if(command === "link") {
    if (!message.guild.members.get(message.author.id).roles.has(process.env.ADMIN_ROLE) && process.env.FREE_LINKING === "false") return message.channel.send("You don't have permission to use this command.")
    {
      let member = "none"
      if(process.env.FREE_LINKING === "true") 
      {
        member = message.author.id
      } 
      else 
      {
        member = message.mentions.users.first().id
        args.shift()
      }
      if(member === "none" || !args[0]) return message.channel.send("No player specified.")
      try { 
        client.players.ensure(member, {
          user: member,
          ign: "not-linked",
          levelrole: 0,
          supporter: false,
          kills: 0,
          deaths: 0
        });
        client.players.set(member, args.join(" "), "ign");
        message.channel.send(`Successfully linked **${args.join(" ")}** to <@${member}>`)
      }
      catch(error) 
      {
        message.channel.send(`There was an issue linking:\n\`\`\`js\n${error}\`\`\``)
      }
    }
    }
    if(command === "player")
    {
      if(!args) 
      {
        let embed = new Discord.RichEmbed()
        .setTitle("No player specified!")
        .setDescription("Proper usage is `" + prefix + "player Name`, where \"Name\" is the name of the player you're looking for.")
        return message.channel.send(embed);
      }
      let char = args.join(" ")
      if(message.mentions.users.first()) {
        if(!client.players.has(message.mentions.users.first().id) || client.players.get(message.mentions.users.first().id, "ign") === "not-linked") return message.channel.send(`**${message.mentions.users.first().username}** has no linked account.`)
        char = client.players.get(message.mentions.users.first().id, "ign")
      }
      request(`https://www.rucoyonline.com/characters/${char}`, (error, response, html)=> {
        if(!error && response.statusCode == 200) 
        {
          const $ = cheerio.load(html);
          const charHeading = $('h3')
          const charInfo = $('tbody').first()
          const pvpInfo = $('tbody').last()
          
          let character = rucoyToObject(charInfo.text());
          if(character.name == 0) return message.channel.send("Character not found...");
          let urlname = character.name.replaceAll(" ", "%20")
          let color = "#00ff00"
          if(charHeading.text().includes("Supporter")) color = "#00bfff"
          if(charHeading.text().includes("Game Master")) {
            var charEmbed = new Discord.RichEmbed()
            .setTitle(character.name)
            .setURL(`https://www.rucoyonline.com/characters/${urlname}`)
            .setColor("#ffff00")
            .addField("Guild", character.guild)
            .addField("Born", character.born, true)
          } else if(character.guild != 0) {
          var charEmbed = new Discord.RichEmbed()
            .setTitle(character.name)
            .setURL(`https://www.rucoyonline.com/characters/${urlname}`)
            .setColor(color)
            .addField("Level", character.level)
            .addField("Guild", character.guild)
            .addField("Last Online", character.last_online, true)
            .addField("Born", character.born, true)
          } else {
            var charEmbed = new Discord.RichEmbed()
              .setTitle(character.name)
              .setURL(`https://www.rucoyonline.com/characters/${urlname}`)
              .setColor(color)
              .addField("Level", character.level)
              .addField("Last Online", character.last_online, true)
              .addField("Born", character.born, true)
          }
          
          message.channel.send(charEmbed)
        } else 
        {
          message.channel.send("There was an error fetching the character:\n```js\n" + error + "\n```");
        }
      });
    }
    if(command === "help") 
    {
      let helpEmbed = new Discord.RichEmbed()
      .setTitle(client.user.username)
      .setDescription("Created by [Seikatsu](https://github.com/SeikatsuChan)\n\n**DM server staff to link your account!**\n\n**__Commands__**\n`ping` - Check the bot's ping\n`player` - Search any player from [rucoyonline.com](https://www.rucoyonline.com)\n`link` - (ADMIN ONLY) link a player to a discord account")
      .setURL("https://github.com/SeikatsuChan/Rucoycord")
      .setColor("#ff0000")
      .setThumbnail(client.user.avatarURL)
      
      message.channel.send(helpEmbed)
    }
    if(command === "pvptest" && message.author.id == process.env.OWNER) 
    {
      let char = args.join(" ")
      if(message.mentions.users.first()) {
        if(!client.players.has(message.mentions.users.first().id) || client.players.get(message.mentions.users.first().id, "ign") === "not-linked") return message.channel.send(`**${message.mentions.users.first().username}** has no linked account.`)
        char = client.players.get(message.mentions.users.first().id, "ign")
      }
      request(`https://www.rucoyonline.com/characters/${char}`, (error, response, html)=> {
        if(!error && response.statusCode == 200) 
        {
          const $ = cheerio.load(html);
          const charHeading = $('h3')
          const charInfo = $('tbody').first()
          const pvpInfo = $('tbody').last()
          
          var character = rucoyToObject(char)
          var newStr = pvpInfo.text().split("\n")
          .map(x => x.trim())
          .filter(function(x){return x != null;})
          .filter(function(x){return x != "";});
          console.log(newStr[newStr.indexOf("killed")+1])
          if(newStr.indexOf("killed") > -1) 
          {
            if(newStr[newStr.indexOf("killed")+1].includes(character.name))
            {
              message.channel.send("killed")
            } else {
              message.channel.send("kill")
            }
          }
        }
      })
    }
  }
});
 
client.login(process.env.TOKEN);
