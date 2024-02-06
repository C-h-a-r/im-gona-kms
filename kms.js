const Discord = require('discord.js')
const database = require('@atlas-bot/database')

var reaction_roles = []
var channel_id;

async function create(message, original) {
    reaction_roles = []
    const CollectorFilter = m => m.author.id === original.author.id;
    
    
    


   




const main_embed = new Discord.EmbedBuilder()
.setColor("#2f3136")
      .setAuthor({
        name: "Reaction Role: Create",
        iconURL: message.author.displayAvatarURL({ size: 4096 }),
      })
      .setTitle("Which Channel Should I Send The Reaction Role To?")

      const channel_msg = await message.edit({ embeds: [main_embed], components: []})

const channelCollector = await channel_msg.channel.createMessageCollector({ filter: CollectorFilter, time: 15_000, max: 1 });



// Channel Message Collector Collect
channelCollector.on('collect', async ch_m => {
ch_m.delete()
    // Get Channel Id
    if (ch_m.content.includes("<#")) {
        channel_id = ch_m.content.replace(/<#|>/g, '');
 } else {
        channel_id = ch_m.content
         }

    // Get Channel
    const channel = message.guild.channels.cache.get(`${channel_id}`);

    // Return Error If No Channel Found
    
    if (!channel) {
        main_embed.setColor("Red").setTitle(`Unable To Find Channel With Id: ${channel_id}`)
        return channel_msg.edit({ embeds: [main_embed]})
    }

    // Update Embed With Channel
    main_embed.addFields({ name: "Channel", value: `<#${channel_id}>`, inline: true}).setTitle("Mention A Role And Emoji To Use").setDescription("*Example: @TestRole 😂*")
    const role_reaction_msg = await channel_msg.edit({ embeds: [main_embed]})

    // Create Collector For Role And
    addNewRR(role_reaction_msg, original, main_embed)



    


})


}


async function addNewRR(message, original, embed) {
    const CollectorFilter = m => m.author.id === original.author.id;
    const Collector = await message.channel.createMessageCollector({ filter: CollectorFilter, time: 15_000, max: 1 });

    Collector.on('collect', async msg => {
        var role_id;
        var emoji;


        const args = msg.content.split(" ");
        const role_arg = args[0]
        const emoji_arg = args[1]
        if (!role_arg) {
            embed.setColor("Red").setTitle(`Enter A Valid Role`).setDescription("*Example: @TestRole 😂*").setFields()
        return message.edit({ embeds: [embed]})
        }

        if (!emoji_arg) {
            embed.setColor("Red").setTitle(`Enter A Valid Emoji`).setDescription("*Example: @TestRole 😂*").setFields()
        return message.edit({ embeds: [embed]})
        }



       if (role_arg.includes("<@")) {
        role_id = role_arg.replace(/<@&|>/g, '');

       } else {
        role_id = role_arg
       }

       const role = message.guild.roles.cache.get(`${role_id}`);

       if (!role) {
        embed.setColor("Red").setTitle(`Unable To Find Role With Id: ${role_id}`).setDescription("*Example: @TestRole 😂*").setFields()
        return message.edit({ embeds: [embed]})
       }


       if (emoji_arg.includes("<:")) {
        emoji = emoji_arg
       } else {
        const testReg = /[a-zA-Z\d!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/;
        if (testReg.test(emoji_arg)) {
            embed.setColor("Red").setTitle(`Enter A Valid Emoji`).setDescription("*Example: @TestRole 😂*").setFields()
            return message.edit({ embeds: [embed]})
        }
        emoji = emoji_arg
       }

       embed.setTitle("Add Another Role?").setDescription("Current Reaction Roles").addFields({ name: '\u200B' , value: emoji + " **-** " + `<@&${role_id}>`})
       const added_msg = await message.edit({ embeds: [embed]})

       msg.delete()
       let json = {
        "role": role_id,
        "emoji": emoji
       }
       reaction_roles.push(json)
       addNewQ(added_msg, original, embed)

    })


}

async function addNewQ(message, original, embed) {
    embed.setTitle("Add Another Role?")
    const row = new Discord.ActionRowBuilder()
    .addComponents(
        new Discord.ButtonBuilder()
        .setCustomId('add-new')
        .setLabel('Yes')
        .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
        .setCustomId('build_rr')
        .setLabel('No')
        .setStyle(Discord.ButtonStyle.Danger)
    )

    const msg = await message.edit({ embeds: [embed], components: [row] })
    const collector = msg.createMessageComponentCollector({
        componentType: Discord.ComponentType.Button,
        time: 15_000,
      });

      collector.on("collect", async (i) => {
        
        if (i.user.id !== original.author.id) return;
        if (i.customId === "build_rr" ) {
  buildRR(msg, original)

        } else if (i.customId === "add-new") {
            addNewRR(message, original, embed)

        }

        })


  
}

async function buildRR(message, original) {
const des = reaction_roles.map(item => `${item.emoji} - <@&${item.role}>`).join('\n\n')
const embed = new Discord.EmbedBuilder()
.setDescription(des)

const channel = message.guild.channels.cache.get(`${channel_id}`);

const msg = await channel.send({ embeds: [embed]})
reaction_roles.forEach(data => {
    msg.react(data.emoji)
})


}

module.exports = {
    create
}
