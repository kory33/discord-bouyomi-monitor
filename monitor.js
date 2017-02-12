"use strict";

const Discordie = require("Discordie");
const BouyomiGateway = require("./bouyomi-gateway");

const token = require("./.settings.json");
const bouyomiOption = require("./bouyomi.json");

const discordieClient = new Discordie();
const bouyomiGateway = new BouyomiGateway(bouyomiOption);

discordieClient.Dispatcher.on(Discordie.Events.GATEWAY_READY, e => {
    bouyomiGateway.pipeMessage("Discordから棒読みちゃんに接続しました。");
});

discordieClient.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, e => {
    if (discordieClient.User.id !== e.message.author.id) {
        return;
    }
    
    if (discordieClient.User.getVoiceChannel(e.message.guild) === null) {
        return;
    }

    bouyomiGateway.pipeMessage(e.message.content);
});


discordieClient.connect(token);

process.stdin.resume();
process.stdin.on("data", (data) => bouyomiGateway.pipeMessage(data));