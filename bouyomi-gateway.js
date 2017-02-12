"use strict";

const net = require("net");

module.exports = class BouyomiGateway {
    constructor(option) {
        this.option = option;
    }

    pipeMessage(message) {
        const socket = new net.Socket();
        socket.connect(this.option.connection.port, this.option.connection.host, () => {
            const writeOrder = ["command", "speed", "tone", "volume", "voice"];
            for (let i in writeOrder) {
                const writeTerm = writeOrder[i];

                const buffer = new Buffer(2);
                
                let writeValue = this.option.style[writeTerm];
                if (writeValue === undefined) {
                    writeValue = -1;
                }

                buffer.writeInt16LE(writeValue, 0);

                socket.write(buffer);
            }

            const bufferEncoding = new Buffer(1);
            bufferEncoding.writeInt8(0, 0);
            socket.write(bufferEncoding);

            const bufferedMessage = new Buffer(message, "utf-8");
            const bufferedMsgLen = new Buffer(4);
            bufferedMsgLen.writeInt32LE(bufferedMessage.length, 0);
            socket.write(bufferedMsgLen);
            socket.write(bufferedMessage);

            socket.end();
            console.log(`read message: ${message}`);
        });
        return socket;
    }
};