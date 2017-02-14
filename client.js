"use strict";

const Discordie = require("Discordie");

const commandMessages = {
    toggle: "b>toggle",
    noRead: "b>noread"
};

module.exports = (bouyomiGateway) => {
    const discordieClient = new Discordie();
    let useBouyomi = true;

    discordieClient.Dispatcher.on(Discordie.Events.GATEWAY_READY, ( ) => {
        console.log("Discordに接続しました。");
    });

    function replaceIdMention(messageContent, event) {
        return messageContent.replace(/<@!?(\d+)>/g, (match, id) => {
            const memberArray = event.message.guild.members;
            const targetMember = memberArray.find((member) => member.id === id);

            if (targetMember === undefined) {
                return match;
            }

            return "@" + targetMember.name;
        });
    }

    function getReadMessage(event) {
        return replaceIdMention(event.message.content, event);
    }

    discordieClient.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, e => {
        if (discordieClient.User.id !== e.message.author.id) {
            return;
        }
    
        if (e.message.content === commandMessages.toggle) {
            useBouyomi = !useBouyomi;
            return e.message.delete()
            .then(() => e.message.channel.sendMessage(`\`\`\`棒読みちゃんを${useBouyomi ? "有効化" : "無効化"}しました。\`\`\``))
            .then((sentMessage) => {
                setTimeout(() => {
                    sentMessage.delete();
                }, 2000);
            });
        }

        if (discordieClient.User.getVoiceChannel(e.message.guild) === null) {
            return;
        }

        if (!useBouyomi || e.message.content.startsWith(commandMessages.noRead) || e.message.content.startsWith("```")) {
            return;
        }

        bouyomiGateway.pipeMessage(getReadMessage(e));
    });

    return discordieClient;
};