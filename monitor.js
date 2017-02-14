"use strict";

const BouyomiGateway = require("./bouyomi-gateway");

const token = require("./.settings.json");
const bouyomiOption = require("./bouyomi.json");

const bouyomiGateway = new BouyomiGateway(bouyomiOption);

const client = require("./client")(bouyomiGateway);
client.connect(token);

process.stdin.resume();
process.stdin.on("data", (data) => bouyomiGateway.pipeMessage(data));