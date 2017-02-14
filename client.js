"use strict";

const Discordie = require("Discordie");

const commandMessages = {
    toggle  : "b>toggle",
    on      : "b>on",
    off     : "b>off",
    noRead  : "b>noread"
};

module.exports = (bouyomiGateway) => {
    const discordieClient = new Discordie();
    let useBouyomi = true;

    discordieClient.Dispatcher.on(Discordie.Events.GATEWAY_READY, ( ) => {
        console.log("Discordに接続しました。");
    });

    function notifyBouyomiToggle(toggleMessageChannel) {
        return toggleMessageChannel.sendMessage(`\`\`\`棒読みちゃんを${useBouyomi ? "有効化" : "無効化"}しました。\`\`\``)
        .then((sentMessage) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    sentMessage.delete();
                    resolve();
                }, 2000);
            });
        });
    }

    function renewState(message) {
        if (message === commandMessages.toggle) {
            useBouyomi = !useBouyomi;
            return true;
        }
        if (message === commandMessages.on) {
            useBouyomi = true;
            return true;
        }
        if (message === commandMessages.off) {
            useBouyomi = false;
            return true;
        }
        return false;
    }

    discordieClient.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, e => {
        if (discordieClient.User.id !== e.message.author.id) {
            return;
        }
    
        if (renewState(e.message.content)) {
            e.message.delete();
            return notifyBouyomiToggle(e.message.channel);
        }

        if (discordieClient.User.getVoiceChannel(e.message.guild) === null) {
            return;
        }

        if (!useBouyomi || e.message.content.startsWith(commandMessages.noRead) || e.message.content.startsWith("```")) {
            return;
        }

        bouyomiGateway.pipeMessage(e.message.resolveContent());
    });

    return discordieClient;
};