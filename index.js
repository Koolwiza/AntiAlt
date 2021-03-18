const fs = require('fs'),
    Enmap = require('enmap'),
    Discord = require('discord.js'),
    client = new Discord.Client(),
    humanize = require('humanize-duration')

client.commands = new Discord.Collection()
client.config = require('./config')
client.antiAlt = new Enmap({
    name: "antialt",
    fetchAll: true,
    autoFetch: true
})

let cmdFiles = fs.readdirSync('./Commands').filter(c => c.endsWith('.js'))

for (let file of cmdFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command); // Using discord.js guide command handler
}

client.on('ready', () => {
    console.log(`${client.user.username} is online!`)

    client.user.setActivity("alts", {
        type: "WATCHING"
    })
})

Discord.MessageEmbed.prototype.default = function (user) {
    this
        .setAuthor(user.tag, user.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setTimestamp()
    return this;
}

client.on('guildMemberAdd', async member => {

    let data = client.antiAlt.ensure(member.guild.id, {
        ...client.config.settings
    })

    let dataAge = data.age * 24 * 60 * 60 * 1000

    let minAge = Date.now() + dataAge
    let userCreate = member.user.createdTimestamp

    if (userCreate < minAge) {
        let userTime = humanize(Date.now() - userCreate, {
            conjunction: " and ",
            serialComma: false
        })

        let ageTime = humanize(dataAge, {
            conjunction: " and ",
            serialComma: false
        })

        let neededTime = humanize(minAge - userCreate, {
            conjunction: " and ",
            serialComma: false
        })

        await member.user.send(new Discord.MessageEmbed()
            .setTitle("You were detected")
            .setDescription(`You were **${data.punishment === "kick" ? "kicked" : "banned"}** from ${member.guild.name}.\nMinimum Account Age: ${ageTime}\nYour Account Age: ${userTime}. \n\n*PS. Your account needs to be ${neededTime} older!*`)
            .setColor("RED")
            .default(member.user)
        )

        if (data.punishment.toLowerCase() === "kick") {
            await member.kick('Did not meet account age requirement: ' + ageTime).catch(async e => {
                let ch = member.guild.channels.cache.get(data.logs)
                await ch.send(
                    new Discord.MessageEmbed()
                    .setTitle("Error!")
                    .setDescription(`:warning: I had an error kicking ${member ?? member.user.tag}`)
                    .setColor("RED")
                    .default(member.user)
                )
            })
        } else if (data.punishment.toLowerCase() === "ban") {
            member.guild.members.ban(member, {
                reason: "Did not meet account age requirement: " + ageTime
            }).catch(async e => {
                let ch = member.guild.channels.cache.get(data.logs)
                await ch.send(
                    new Discord.MessageEmbed()
                    .setTitle("Error!")
                    .setDescription(`:warning: I had an error banning ${member ?? member.user.tag}`)
                    .setColor("RED")
                    .default(member.user)
                )
            })
        }
    }
})

client.on('message', async message => {
    let args = message.content.trim()
        .slice(client.config.prefix.length)
        .trim()
        .split(/\s+/g)

    let command = args.shift().toLowerCase()

    if (!client.commands.get(command)) return;

    try {
        await client.commands.get(command).execute(client, message, args)
    } catch (e) {
        message.channel.send(":warning: An error occured, please try again.\n```" + e + '```')
        console.log("An error occured: " + e)
    }
})

client.login(client.config.token)

