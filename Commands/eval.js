const Discord = require('discord.js')

module.exports = {
  name: 'eval',
  description: 'Eval code',
  usage: 'eval <code>',
  async execute(client, message, args) {
    if(!client.config.owners.includes(message.author.id)) return;

    let code = args.join(" ")

    try {
        const hrStart = process.hrtime();
        evaled = eval(code);

        if (evaled instanceof Promise) evaled = await evaled;
        const hrStop = process.hrtime(hrStart);

        let response = '';

        response += `\`\`\`js\n${await clean(evaled)}\n\`\`\`\n`;
        response += `• Discord.js ${Discord.version}\n`;
        response += ` • Type: \`${typeof evaled}\`\n`;
        response += ` • Time taken: \`${(((hrStop[0] * 1e9) + hrStop[1])) / 1e6}ms\``;

        if (response.length > 0) {
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Success")
                .setDescription(response)
                .setColor("BLUE")
                .default(message.author))
        }
    } catch (err) {
        return message.channel.send(`Error: \`\`\`${await clean(err.message)}\`\`\``)
    }

    async function clean(text) {
        if (text && text.constructor.name == "Promise")
          text = await text;
        if (typeof text !== "string")
          text = require("util").inspect(text, {
            depth: 1
          });
    
        text = text
          .replace(/`/g, `\`${String.fromCharCode(8203)}`)
          .replace(/@/g, `@${String.fromCharCode(8203)}`)
          .replace(client.config.token, "mfa.VkO_2G4Qv3T--NOt--lWetW_--A--tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");
    
        return text;
      }


  }
}

