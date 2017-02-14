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

    function userMentionReplacor(event) {
        return [/<@(\d+)>/g, (match, id) => {
            const memberArray = event.message.guild.members;
            const targetMember = memberArray.find((member) => member.id === id);

            if (targetMember === undefined) {
                return match;
            }

            return "@" + targetMember.name;
        }];
    }  
    
    function selfMentionReplacor(event) {
        return [new RegExp(`<@!${discordieClient.User.id}>`, "g"), () => {
            const selfName = event.message.guild.members
                .find((member) => member.id === discordieClient.User.id)
                .name;

            return "@" + selfName;
        }];
    }

    function chnlMentionReplacor(event) {
        return [/<#(\d+)>/g, (match, channelId) => {
            const textChannels = event.message.guild.textChannels;
            const targetChannel = textChannels.find((channel) => channel.id === channelId);

            if (targetChannel === undefined) {
                return match;
            }

            return "#" + targetChannel.name;
        }];
    }

    function roleMentionReplacor(event) {
        return [/<@&(\d+)>/, (match, roleId) => {
            const roles = event.message.guild.roles;
            const targetRole = roles.find((role) => role.id === roleId);

            if (targetRole === undefined) {
                return match;
            }
            
            return "@" + targetRole.name;
        }];
    }

    function getReadMessage(event) {
        return event.message.content
        .replace(...userMentionReplacor(event))
        .replace(...selfMentionReplacor(event))
        .replace(...chnlMentionReplacor(event))
        .replace(...roleMentionReplacor(event));
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