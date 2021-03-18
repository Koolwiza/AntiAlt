const Discord = require('discord.js')

module.exports = {
    name: 'config',
    description: 'Configure settings for the guild',
    usage: 'config [type] [value]',
    async execute(client, message, args) {
        let [type, ...value] = args
        let allowedTypes = Object.keys(client.config.settings)
        let options = ['show', ...allowedTypes]
        if (!type) return message.channel.send(
            new Discord.MessageEmbed()
            .setTitle("Missing args")
            .setDescription("Please provide a type to configure.")
            .default(message.author)
        )

        type = type.toLowerCase()
        if(!options.includes(type)) return;
        
        if(type === "show") {
            let output = `\`\`\`asciidoc\n== Server Configurations ==\n`
            let props = Object.keys(client.config.settings)
            let a = client.config.settings
            const longest = props.reduce((long, str) => Math.max(long, str.length), 0)
            props.forEach(c => {
                if(c instanceof Array) c = c.join(", ")
                if (a[c] === null) {
                    output += `${c}${" ".repeat(longest - c.length)} :: None\n`
                } else {
                    output += `${c}${" ".repeat(longest - c.length)} :: ${a[c]}\n`
                }

            })
            return message.channel.send(output + "```");
        }


        if(!Object.keys(client.config.settings).includes(type)) return message.channel.send(new Discord.MessageEmbed()
            .setTitle("Invalid Type")
            .setDescription("Please provide a valid type")
            .setColor("RED")
            .default(message.author)
            )

        if(type === "punishment") {
            if(!['kick', 'ban'].includes(value.join(" "))) return message.channel.send(new Discord.MessageEmbed()
            .setTitle("Invalid Punishment")
            .setDescription("Punishment can only be kick or ban")
            .setColor("RED")
            .default(message.author))

            client.antiAlt.set(message.guild.id, value.join(" "), "punishment")
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Set \`punishment\` as \`${value.join(" ")}\``)
                    .setColor("GREEN")
                    .default(message.author)
            )
        }
        
        client.antiAlt.set(message.guild.id, value.join(" "), type)
        return message.channel.send(
            new Discord.MessageEmbed()
                .setTitle("Success")
                .setDescription(`Set \`${type}\` as \`${value.join(" ")}\``)
                .setColor("GREEN")
                .default(message.author)
        )
    }
}