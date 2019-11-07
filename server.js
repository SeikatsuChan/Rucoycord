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
function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }
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
  client.user.setActivity(`${prefix}help`, { type: 'WATCHING' });

  setInterval( ()=> {
  if(process.env.CLASS_ROLES === "true") {
    client.players.forEach((values, user) => {
      if(mainGuild.members.has(user)) {
      //if(client.players.get(user, "supporter") == true) {
        if(client.players.get(user, "supporter") == true && mainGuild.members.get(user).roles.has(process.env.STANDARD_KNIGHT)) {
          console.log(client.players.get(user, "user"))
          mainGuild.members.get(user).addRole(process.env.SUPPORTER_KNIGHT)
          mainGuild.members.get(user).removeRole(process.env.STANDARD_KNIGHT)
        } else if(client.players.get(user, "supporter") == true && mainGuild.members.get(user).roles.has(process.env.STANDARD_ARCHER)) {
          mainGuild.members.get(user).addRole(process.env.SUPPORTER_ARCHER)
          mainGuild.members.get(user).removeRole(process.env.STANDARD_ARCHER)
        } else if(client.players.get(user, "supporter") == true && mainGuild.members.get(user).roles.has(process.env.STANDARD_MAGE)) {
          mainGuild.members.get(user).addRole(process.env.SUPPORTER_MAGE)
          mainGuild.members.get(user).removeRole(process.env.STANDARD_MAGE)
        }
       // }
      }
    })
  }
  if(process.env.AUTOROLE === "true") 
  {
    client.players.forEach((values, user) => {
      if(mainGuild.members.has(user)) {
      let charname = client.players.get(user, "ign")
      let currentlevel =  client.players.get(user, "levelrole")
      let supporterStatus = client.players.get(user, "supporter")
      let subStatus = client.players.get(user, "sub")
      if(subStatus == true && process.env.ROLE_SUB === "true") {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        
        if(client.players.get(user, "sub_date") === today) {
          if(client.players.get(user, "diamonds") < Number(process.env.ROLE_COST)) {
            mainGuild.roles.get(client.players.get(user, "sub_role")).delete()
            client.players.set(user, "N/A", "sub_role")
            client.players.set(user, "N/A", "sub_date")
            client.players.set(user, false, "sub")
          } else {
            client.players.set(user, client.user.get(user, "diamonds")-1000, "diamonds")
            
            var Endday = new Date();
            var edd = String(Endday.getDate()).padStart(2, '0');
            var emm = Endday.getMonth() + 2
            if(emm == 13) emm = 1
            emm = String(emm).padStart(2, '0');
            var eyyyy = Endday.getFullYear();
            Endday = emm + '/' + edd + '/' + eyyyy;
            
            client.players.set(user, Endday, "sub_date")
          }
        }
      }
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
              if(process.env.ECONOMY === "true" && process.env.SUPPORTER_DIAMONDS === "true") {
                client.players.set(user, client.players.get(user, "diamonds")+parseInt(process.env.SUPPORTER_DIAMONDS_NUMBER), "diamonds")
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
      deaths: 0,
      diamonds: 0,
      sub: false,
      sub_date: "N/A",
      sub_role: "N/A"
  });
  if(process.env.ECONOMY === "true") client.players.math(key, "+", Math.floor(Math.random()*2), "diamonds")
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
          deaths: 0,
          sub: false,
          sub_date: "N/A",
          sub_role: "N/A"
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
          if(charHeading.text().includes("Banned")) color = "#ff0000"
          if(character.name === "Suguri") color = "#b273eb"
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
            .addField("Guild", `[${character.guild}](https://www.rucoyonline.com/guild/${character.guild.replaceAll(" ", "%20")})`)
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
      .setDescription("Created by [Seikatsu](https://github.com/SeikatsuChan)\n\n**DM server staff to link your account!**\n\n**__Commands__**\n`ping` - Check the bot's ping\n`player` - Search any player from [rucoyonline.com](https://www.rucoyonline.com)\n`link` - (ADMIN ONLY) link a player to a discord account\n`guild` - Search any guild from [rucoyonline.com](https://www.rucoyonline.com)\n`online` - Check how many players and servers are currently online")
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
    if(command === "guild")
    {
      if(!args)
      {
        let embed = new Discord.RichEmbed()
        .setTitle("No guild specified!")
        .setDescription("Proper usage is `" + prefix + "guild Name`, where \"Name\" is the name of the guild you're looking for.")

        return message.channel.send(embed)
      }
      let guild = toTitleCase(args.join(" "))
      let urlname = guild.replaceAll(" ", "%20")

      request(`https://www.rucoyonline.com/guild/${urlname}`, (error, response, html)=> {
        if(!error && response.statusCode == 200)
        {
          const $ = cheerio.load(html);
          const guildName = $("h3").text()
          const guildDescription = $("p").text().substring(0, $("p").text().indexOf("Founded on"))
          const guildFounded = $("p").text().substring($("p").text().indexOf("Founded on") + 11, $("p").text().length)
          const guildMembers = $("tbody").find("tr").length
          let leader = "no-leader?"
          $('tr').each(function(){
            $(this).find('td').each(function(){
              if($(this).text().includes("(Leader)"))
              leader = $(this).text().substring(0, $(this).text().indexOf("(")).trim()
            })
          })

          if(leader === "no-leader?") return message.channel.send("Guild not found...")
          let guildEmbed = new Discord.RichEmbed()
          .setTitle(guild)
          .setDescription(guildDescription)
          .addField("Founded", guildFounded, true)
          .addField("Members", guildMembers, true)
          .addField("Leader", `[${leader}](https://www.rucoyonline.com/characters/${leader.replaceAll(" ", "%20")})`, true)
          .setColor("#ff0000")
          .setURL(`https://www.rucoyonline.com/guild/${urlname}`)

          message.channel.send(guildEmbed)
        }
        else return message.channel.send("There was an error finding that guild:\n```" + error + "```")
      })
    }
    
    if(command === "online")
    {
      request("https://www.rucoyonline.com", (error, response, html)=> {
        if(!error && response.statusCode == 200) {
          const $ = cheerio.load(html);
          let onlineCount = "0"
          let serverCount = "0"
          $('p').each(function(){
            if($(this).text().includes("characters")) {
              onlineCount = $(this).text().substring(0, $(this).text().indexOf("characters")).trim()
              serverCount = $(this).text().substring($(this).text().indexOf("online")+10, $(this).text().indexOf("servers")).trim()
            }
          })
          let countEmbed = new Discord.RichEmbed()
          .setColor("#ff0000")
          .setTitle("Rucoy Online")
          .addField("Players Online", commaSeparateNumber(onlineCount), true)
          .addField("Servers", serverCount, true)
          .setURL("https://www.rucoyonline.com")
          .setThumbnail("https://www.rucoyonline.com/assets/favicon/favicon-32x32-b4cafe4c726eace2f4165a0f0d185266103ba79598a894886a312e9e6effaa9a.png")

          message.channel.send(countEmbed)
          } else {
            return message.channel.send("There was an error connecting to rucoyonline.com:\n```" + error + "```")
          }
        })
      }
      if((command === "balance" || command === "bal") && process.env.ECONOMY === "true") 
      {
        if(!message.mentions.users.first()) var player = message.author
        else var player = message.mentions.users.first()
        let ptsEmbed = new Discord.RichEmbed()
        .setTitle(player.username + "'s balance")
        .setDescription(`${process.env.CURRENCY}**${commaSeparateNumber(client.players.get(player.id, "diamonds"))}**`)
        .setColor("#ff0000")
        
        message.channel.send(ptsEmbed)
      }
      if(command === "give" && process.env.ECONOMY === "true") 
      {
        if(!message.mentions.users.first() || !args[1]) return message.channel.send("Missing args, proper usage is `" + prefix + "give @user 100`")
        let giveDiamonds = parseInt(args[1])
        let userOne = message.author.id
        let userTwo = message.mentions.users.first().id
        let notake = false
        if(message.content.includes("-admin") && message.guild.members.get(message.author.id).roles.has(process.env.ADMIN_ROLE)) notake = true
        if(giveDiamonds < 1 && !notake) return message.channel.send("You can't give an amount less than 1")
        if(giveDiamonds > client.players.get(message.author.id, "diamonds") && !notake) return message.channel.send("You don't have enough diamonds to give!")
        
        client.players.set(userTwo, client.players.get(userTwo, "diamonds")+giveDiamonds, "diamonds")
        if(!notake) client.players.set(userOne, client.players.get(userOne, "diamonds")-giveDiamonds, "diamonds")
        
        let giveEmbed = new Discord.RichEmbed()
        .setDescription(`<@${message.author.id}> gifted ${process.env.CURRENCY}**${commaSeparateNumber(giveDiamonds)}** to <@${userTwo}>!`)
        .setColor("#26CB7C")
        
        message.channel.send(giveEmbed)
      }
      if((command === "lb" || command === "leaderboard") && process.env.ECONOMY === "true")
      {
        const lb = client.players.array().sort((a, b) => b.diamonds - a.diamonds);
        const top10 = lb.splice(0, 10);
        const embed = new Discord.RichEmbed()
        .setTitle("__Leaderboard__")
        .setThumbnail(message.guild.iconURL)
        .setColor(0x00AE86);
        for(const data of top10) {
          embed.addField(client.users.get(data.user).tag, `${process.env.CURRENCY}${commaSeparateNumber(data.diamonds)}`);
        }
        return message.channel.send({embed});

      }
      if(command === "subscribe" && process.env.ROLE_SUB === "true")
      {
        if(client.players.get(message.author.id, "diamonds") < Number(process.env.ROLE_COST)) return message.channel.send("You don't have enough diamonds to subscribe! You need " + commaSeparateNumber(Number(process.env.ROLE_COST)))
        if(client.players.get(message.author.id, "sub") == true) return message.channel.send("You are already subscribed!")
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = today.getMonth() + 2
        if(mm == 13) mm = 1
        mm = String(mm).padStart(2, '0');
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        
        client.players.set(message.author.id, client.players.get(message.author.id, "diamonds")-Number(process.env.ROLE_COST), "diamonds")
        client.players.set(message.author.id, today, "sub_date")
        client.players.set(message.author.id, true, "sub")
        message.guild.createRole({
          name: `${message.author.username}'s custom role`
        })
        .then(role => {
          role.setPosition(29)
          message.guild.members.get(message.author.id).addRole(role)
          client.players.set(message.author.id, role.id, "sub_role")
        })
        
        message.channel.send("All done! You will be charged " + commaSeparateNumber(Number(process.env.ROLE_COST)) + " diamonds every month. To edit your role, type /subrole [name/color] (name/hex). To end your subscription, type /unsubscribe (NOTE: Your diamonds will not be refunded if you do this.)")
      }
      if(command === "unsubscribe" && process.env.ROLE_SUB === "true")
      {
        if(client.players.get(message.author.id, "sub") == false) return message.channel.send("You aren't subscribed!")
        
        message.guild.roles.get(client.players.get(message.author.id, "sub_role")).delete()
        client.players.set(message.author.id, "N/A", "sub_role")
        client.players.set(message.author.id, "N/A", "sub_date")
        client.players.set(message.author.id, false, "sub")
        
        message.channel.send("Subscription canceled.")
      }
      if(command === "subrole" && process.env.ROLE_SUB === "true") 
      {
        if(client.players.get(message.author.id, "sub") == false) return message.channel.send("You need to subscribe to use this command!")
        if(!args[1] || (args[0] !== "color" && args[0] !== "name")) {
          let missingArgs = new Discord.RichEmbed()
          .setColor("#ff0000")
          .setTitle("Improper usage!")
          .setDescription("Proper usage of the command:")
          .addField("/subrole [color] (hex)", "Ex. `/subrole color #ff00ff`")
          .addField("/subrole [name] (name)", "Ex. `/subrole name My role name`")
          
          return message.channel.send(missingArgs)
        }
        if(args[0] === "color") {
          try {
          message.guild.roles.get(client.players.get(message.author.id, "sub_role")).setColor(args[1])
          message.channel.send("Color set!")
          } catch(e) {message.channel.send("Error:\n```" + e + "```")}
        }
        else if(args[0] === "name") {
          try {
            args.shift()
            message.guild.roles.get(client.players.get(message.author.id, "sub_role")).setName(args.join(" "))
            message.channel.send("Name set!")
          } catch(e) {message.channel.send("Error:\n```" + e + "```")}
        }
        else return message.channel.send("There was an issue... ping Seikatsu.")
      }
  }
});
 
client.login(process.env.TOKEN);
