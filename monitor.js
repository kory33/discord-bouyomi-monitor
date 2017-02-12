"use strict";

const Discordie = require("Discordie");
const BouyomiGateway = require("./bouyomi-gateway");

const token = require("./.settings.json");
const bouyomiOption = require("./bouyomi.json");

const discordieClient = new Discordie();
const bouyomiGateway = new BouyomiGateway(bouyomiOption);

discordieClient.Dispatcher.on(Discordie.Events.GATEWAY_READY, ( ) => {
    console.log("Discordから棒読みちゃんに接続しました。");
});

function replaceIdMention(event) {
    return event.message.content.replace(/<@!?(\d+)>/g, (match, id) => {
        const memberArray = event.message.guild.members;
        const targetMember = memberArray.find((member) => member.id === id);

        if (targetMember === undefined) {
            return match;
        }

        return targetMember.name;
    });
}

discordieClient.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, e => {
    if (discordieClient.User.id !== e.message.author.id) {
        return;
    }
    
    if (discordieClient.User.getVoiceChannel(e.message.guild) === null) {
        return;
    }

    bouyomiGateway.pipeMessage(replaceIdMention(e));
});


discordieClient.connect(token);

process.stdin.resume();
process.stdin.on("data", (data) => bouyomiGateway.pipeMessage(data));