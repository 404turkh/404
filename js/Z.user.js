// ==UserScript==
// @name         @5harambro
// @version      1
// @description  Bots for Agar.io - Working on Delta extension
// @icon         https://raw.githubusercontent.com/404turkh/404/main/icon.png
// @match        *://agar.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let fixedMode = false;
    let fixedInterval = null;

    const CLIENTS_MAX_BOTS = 9999;

    class Entity {
        constructor() {
            this.id = 0;
            this.x = 0;
            this.y = 0;
            this.extraData = 0;
            this.flags = 0;
            this.size = 0;
            this.name = "";
            this.isVirus = false;
            this.isPellet = false;
            this.isFriend = false;
        }
    }

    class Reader {
        constructor(buffer) {
            this.dataView = new DataView(buffer);
            this.byteOffset = 0;
        }
        readUint8() { return this.dataView.getUint8(this.byteOffset++); }
        readUint16() { const value = this.dataView.getUint16(this.byteOffset, true); this.byteOffset += 2; return value; }
        readInt32() { const value = this.dataView.getInt32(this.byteOffset, true); this.byteOffset += 4; return value; }
        readUint32() { const value = this.dataView.getUint32(this.byteOffset, true); this.byteOffset += 4; return value; }
        readFloat32() { const value = this.dataView.getFloat32(this.byteOffset, true); this.byteOffset += 4; return value; }
        readFloat64() { const value = this.dataView.getFloat64(this.byteOffset, true); this.byteOffset += 8; return value; }
        readString() {
            let result = "";
            for (;;) {
                const charCode = this.readUint8();
                if (charCode === 0) break;
                result += String.fromCharCode(charCode);
            }
            return result;
        }
        readUTF8String() {
            let bytes = [];
            let byte;
            for (; (byte = this.readUint8()) !== 0;) bytes.push(byte);
            return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
        }
    }

    class Writer {
        constructor(size) {
            this.size = size || 1000;
            this.dataView = new DataView(new ArrayBuffer(this.size));
            this.byteOffset = 0;
        }
        ensureCapacity(additionalSize) {
            if (this.byteOffset + additionalSize > this.dataView.buffer.byteLength) {
                const newBuffer = new ArrayBuffer(this.dataView.buffer.byteLength * 2);
                new Uint8Array(newBuffer).set(new Uint8Array(this.dataView.buffer));
                this.dataView = new DataView(newBuffer);
                this.size = newBuffer.byteLength;
            }
        }
        writeUint8(value) {
            this.ensureCapacity(1);
            this.dataView.setUint8(this.byteOffset++, value);
        }
        writeInt16(value) {
            this.ensureCapacity(2);
            this.dataView.setInt16(this.byteOffset, value, true);
            this.byteOffset += 2;
        }
        writeUint16(value) {
            this.ensureCapacity(2);
            this.dataView.setUint16(this.byteOffset, value, true);
            this.byteOffset += 2;
        }
        writeInt32(value) {
            this.ensureCapacity(4);
            this.dataView.setInt32(this.byteOffset, value, true);
            this.byteOffset += 4;
        }
        writeUint32(value) {
            this.ensureCapacity(4);
            this.dataView.setUint32(this.byteOffset, value, true);
            this.byteOffset += 4;
        }
        writeFloat64(value) {
            this.ensureCapacity(8);
            this.dataView.setFloat64(this.byteOffset, value, true);
            this.byteOffset += 8;
        }
        writeString(str) {
            this.ensureCapacity(str.length + 1);
            for (let i = 0; i < str.length; i++) {
                this.writeUint8(str.charCodeAt(i));
            }
            this.writeUint8(0);
        }
        writeString16(str) {
            this.ensureCapacity((str.length + 1) * 2);
            for (let i = 0; i < str.length; i++) {
                this.writeUint16(str.charCodeAt(i));
            }
            this.writeUint16(0);
        }
        toBuffer() {
            return this.dataView.buffer.slice(0, this.byteOffset);
        }
    }

    class Bot {
        constructor(config) {
            this.config = config;
            this.ws = null;
            this.offsetX = 0;
            this.offsetY = 0;
            this.moveInt = null;
            this.stopped = false;
            this.isAlive = false;
            this.connected = false;
            this.playerCells = [];
            this.encryptionKey = 0;
            this.decryptionKey = 0;
            this.serverVersion = null;
            this.followMouse = false;
            this.myCellIDs = [];
            this.errorTimeout = null;
            this.clientVersion = 31116;
            this.protocolVersion = 23;
            this.reconnectTimeout = null;
            this.followMouseTimeout = null;
            this.playerPos = { x: 0, y: 0 };
            this.isReconnecting = false;
            this.lastActiveTime = Date.now();
            this.connectionAttempts = 0;
            this.maxConnectionAttempts = 8;
            this.ghostCells = [];
            this.targetX = null;
            this.targetY = null;
            const nameInput = document.querySelector(".harambro-nick-input");
            const savedName = localStorage.getItem("harambro-bot-name");
            this.name = nameInput ? (nameInput.value.trim() || savedName || "5harambro") : (savedName || "5harambro");
            if (!nameInput && !savedName) {
                localStorage.setItem("harambro-bot-name", "5harambro");
            }
            this.connect();
        }

        reset() {
            this.ws = null;
            this.offsetX = 0;
            this.offsetY = 0;
            this.isAlive = false;
            this.connected = false;
            this.playerCells = [];
            this.encryptionKey = 0;
            this.decryptionKey = 0;
            this.serverVersion = null;
            this.followMouse = false;
            this.myCellIDs = [];
            this.errorTimeout = null;
            this.followMouseTimeout = null;
            this.targetX = null;
            this.targetY = null;
        }

        connect() {
            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                this.stop();
                return;
            }
            this.connectionAttempts++;
            this.reset();
            if (!this.stopped) {
                this.ws = new WebSocket(this.config.agarServer);
                this.ws.binaryType = "arraybuffer";
                this.ws.onopen = this.onopen.bind(this);
                this.ws.onclose = this.onclose.bind(this);
                this.ws.onerror = this.onerror.bind(this);
                this.ws.onmessage = this.onmessage.bind(this);
                this.connected = true;
                this.lastActiveTime = Date.now();
            }
        }

        onopen() {
            this.lastActiveTime = Date.now();
            this.connectionAttempts = 0;
            this.sendProtocolVersion();
            this.sendClientVersion();
        }

        onclose() {
            this.connected = false;
            this.handleReconnection();
        }

        onerror() {
            this.errorTimeout = setTimeout(() => {
                if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.close();
                }
            }, 1000);
        }

        send(data) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                if (this.encryptionKey) {
                    data = this.xorBuffer(data, this.encryptionKey);
                    this.encryptionKey = this.rotateKey(this.encryptionKey);
                }
                this.ws.send(data);
                this.lastActiveTime = Date.now();
            } else {
                console.warn('WebSocket not open, cannot send data');
            }
        }

        onmessage(event) {
            this.lastActiveTime = Date.now();
            let data = event.data;
            if (this.decryptionKey) {
                data = this.xorBuffer(data, this.decryptionKey ^ this.clientVersion);
            }
            this.handleBuffer(data);
        }

        handleBuffer(buffer) {
            const reader = new Reader(buffer);
            switch (reader.readUint8()) {
                case 32:
                    this.myCellIDs.push(reader.readUint32());
                    if (!this.isAlive) {
                        this.isAlive = true;
                        if (!this.config.startedBots && this.config.stoppedBots) {
                            this.config.startedBots = true;
                        }
                    }
                    this.moveInt = setInterval(() => {
                        this.move(this.config.cords);
                    }, 17);
                    if (!this.followMouseTimeout) {
                        this.followMouseTimeout = setTimeout(() => {
                            if (this.isAlive) {
                                this.followMouse = true;
                            }
                        }, 16000);
                    }
                    break;
                case 241:
                    this.decryptionKey = reader.readUint32();
                    this.serverVersion = reader.readString();
                    this.encryptionKey = this.murmur2("" + this.config.agarServer.match(/wss:\/\/(web-arenas-live-[\w-]+\.agario\.miniclippt\.com\/[\w-]+\/[\d-]+)/)[1] + this.serverVersion, 255);
                    break;
                case 242:
                    this.sendSpawn();
                    break;
                case 255:
                    this.handleMessage(this.uncompressMessage(new Uint8Array(reader.dataView.buffer.slice(5)), new Uint8Array(reader.readUint32())).buffer);
                    break;
            }
        }

        handleMessage(buffer) {
            const reader = new Reader(buffer);
            switch (reader.readUint8()) {
                case 16:
                    this.updateNodes(reader);
                    break;
                case 64:
                    this.updateOffset(reader);
                    break;
            }
        }

        updateOffset(reader) {
            const minX = reader.readFloat64();
            const minY = reader.readFloat64();
            const maxX = reader.readFloat64();
            const maxY = reader.readFloat64();
            if (maxX - minX > 14000) {
                this.offsetX = (maxX + minX) / 2;
            }
            if (maxY - minY > 14000) {
                this.offsetY = (maxY + minY) / 2;
            }
        }

        updateNodes(reader) {
            const nodeCount = reader.readUint16();
            for (let i = 0; i < nodeCount; i++) {
                reader.byteOffset += 8;
            }
            for (;;) {
                const entityId = reader.readUint32();
                if (entityId === 0) break;
                const entity = new Entity();
                entity.id = entityId;
                entity.x = reader.readInt32();
                entity.y = reader.readInt32();
                entity.size = reader.readUint16();
                const flags = reader.readUint8();
                const extendedFlags = flags & 128 ? reader.readUint8() : 0;
                if (flags & 1) entity.isVirus = true;
                if (flags & 2) reader.byteOffset += 3;
                if (flags & 4) reader.readString();
                if (flags & 8) entity.name = decodeURIComponent(escape(reader.readString()));
                if (extendedFlags & 1) entity.isPellet = true;
                if (extendedFlags & 2) entity.isFriend = true;
                if (extendedFlags & 4) reader.byteOffset += 4;
                this.playerCells[entity.id] = entity;
            }
            const removedNodeCount = reader.readUint16();
            for (let i = 0; i < removedNodeCount; i++) {
                const removedId = reader.readUint32();
                if (this.myCellIDs.includes(removedId)) {
                    this.myCellIDs.splice(this.myCellIDs.indexOf(removedId), 1);
                }
                delete this.playerCells[removedId];
            }
            if (this.isAlive && this.myCellIDs.length === 0) {
                this.isAlive = false;
                if (this.followMouseTimeout) {
                    clearTimeout(this.followMouseTimeout);
                    this.followMouseTimeout = null;
                }
                this.followMouse = false;
                this.sendSpawn();
            }
        }

        calculateDistance(x1, y1, x2, y2) {
            return Math.hypot(x2 - x1, y2 - y1);
        }

        move({x, y}) {
            if (this.lastMoveTime && Date.now() - this.lastMoveTime < 100) return;
            this.lastMoveTime = Date.now();
            const averageCell = { x: 0, y: 0, size: 0 };
            const {minAvoidDistance, escapeDistance, virusAvoidDistance} = this.config;
            this.myCellIDs.forEach(cellId => {
                const cell = this.playerCells[cellId];
                if (cell) {
                    averageCell.x += cell.x / this.myCellIDs.length;
                    averageCell.y += cell.y / this.myCellIDs.length;
                    averageCell.size += cell.size;
                }
            });

            let closestPellet = null;
            let closestPelletDistance = Infinity;
            let closestVirus = null;
            let closestVirusDistance = Infinity;
            let closestBiggerPlayer = null;
            let closestBiggerPlayerDistance = Infinity;
            for (const entity of Object.values(this.playerCells)) {
                let shouldAvoid = false;
                let distance = this.calculateDistance(averageCell.x, averageCell.y, entity.x, entity.y);
                if (!entity.isFriend && !entity.isVirus && entity.isPellet && !entity.name) {
                    shouldAvoid = true;
                } else if (!entity.isPellet && !entity.isFriend && entity.isVirus && !entity.name) {
                    if (distance < closestVirusDistance) {
                        closestVirusDistance = distance;
                        closestVirus = entity;
                    }
                } else if (!entity.isVirus && !entity.isPellet && !entity.isFriend && entity.name.length > 0 && entity.size > averageCell.size * 1.15) {
                    shouldAvoid = true;
                } else if (!entity.isFriend && !entity.isVirus && !entity.isPellet && entity.name.length === 0 && entity.size > averageCell.size && distance < closestBiggerPlayerDistance) {
                    closestBiggerPlayerDistance = distance;
                    closestBiggerPlayer = entity;
                }
                if (shouldAvoid && distance < closestPelletDistance) {
                    closestPelletDistance = distance;
                    closestPellet = entity;
                }
            }

            const detectionRange = averageCell.size * 1.5;

            if (this.config.vShield && averageCell.size >= 133 && closestVirus) {
                this.moveTo(closestVirus.x, closestVirus.y, this.decryptionKey);
                return;
            }

            if (!this.targetX || !this.targetY) {
                this.targetX = averageCell.x;
                this.targetY = averageCell.y;
            }

            if (closestBiggerPlayer && closestBiggerPlayerDistance < 300 + detectionRange) {
                const angle = Math.atan2(averageCell.y - closestBiggerPlayer.y, averageCell.x - closestBiggerPlayer.x);
                const avoidX = averageCell.x + Math.floor(escapeDistance * Math.cos(angle));
                const avoidY = averageCell.y + Math.floor(escapeDistance * Math.sin(angle));
                this.targetX = this.targetX * 0.7 + avoidX * 0.3;
                this.targetY = this.targetY * 0.7 + avoidY * 0.3;
                this.moveTo(this.targetX, this.targetY, this.decryptionKey);
                return;
            }

            if (!this.followMouse && !this.config.vShield && this.config.botAi && closestVirus && closestVirusDistance < virusAvoidDistance && averageCell.size >= closestVirus.size * minAvoidDistance) {
                const angle = Math.atan2(averageCell.y - closestVirus.y, averageCell.x - closestVirus.x);
                const avoidX = averageCell.x + Math.floor(virusAvoidDistance * Math.cos(angle));
                const avoidY = averageCell.y + Math.floor(virusAvoidDistance * Math.sin(angle));
                this.targetX = this.targetX * 0.7 + avoidX * 0.3;
                this.targetY = this.targetY * 0.7 + avoidY * 0.3;
                this.moveTo(this.targetX, this.targetY, this.decryptionKey);
                return;
            }

            if (this.followMouse && !this.config.botAi && averageCell.size >= 85) {
                this.targetX = this.targetX * 0.7 + (x + this.offsetX) * 0.3;
                this.targetY = this.targetY * 0.7 + (y + this.offsetY) * 0.3;
                this.moveTo(this.targetX, this.targetY, this.decryptionKey);
                return;
            }

            if (closestPellet && closestPellet.isPellet) {
                if (
                    this.config.botAi &&
                    closestVirus &&
                    this.calculateDistance(closestPellet.x, closestPellet.y, closestVirus.x, closestVirus.y) < virusAvoidDistance &&
                    averageCell.size >= closestVirus.size * minAvoidDistance
                ) {
                    let alternativePellet = null;
                    let alternativeDist = Infinity;
                    for (const pellet of Object.values(this.playerCells)) {
                        if (!pellet.isFriend && !pellet.isVirus && pellet.isPellet && !pellet.name) {
                            const distToVirus = this.calculateDistance(pellet.x, pellet.y, closestVirus.x, closestVirus.y);
                            if (distToVirus >= virusAvoidDistance) {
                                const distToCell = this.calculateDistance(averageCell.x, averageCell.y, pellet.x, pellet.y);
                                if (distToCell < alternativeDist) {
                                    alternativeDist = distToCell;
                                    alternativePellet = pellet;
                                }
                            }
                        }
                    }
                    if (alternativePellet) {
                        this.targetX = this.targetX * 0.7 + alternativePellet.x * 0.3;
                        this.targetY = this.targetY * 0.7 + alternativePellet.y * 0.3;
                        this.moveTo(this.targetX, this.targetY, this.decryptionKey);
                    } else {
                        const randomX = Math.floor(Math.random() * 1337);
                        const randomY = Math.floor(Math.random() * 1337);
                        const randomDirection = Math.random() > 0.5;
                        this.targetX = this.targetX * 0.7 + (averageCell.x + (randomDirection ? randomX : -randomX)) * 0.3;
                        this.targetY = this.targetY * 0.7 + (averageCell.y + (randomDirection ? -randomY : randomY)) * 0.3;
                        this.moveTo(this.targetX, this.targetY, this.decryptionKey);
                    }
                } else {
                    this.targetX = this.targetX * 0.7 + closestPellet.x * 0.3;
                    this.targetY = this.targetY * 0.7 + closestPellet.y * 0.3;
                    this.moveTo(this.targetX, this.targetY, this.decryptionKey);
                }
                return;
            }

            const randomX = Math.floor(Math.random() * 1337);
            const randomY = Math.floor(Math.random() * 1337);
            const randomDirection = Math.random() > 0.5;
            this.targetX = this.targetX * 0.7 + (averageCell.x + (randomDirection ? randomX : -randomX)) * 0.3;
            this.targetY = this.targetY * 0.7 + (averageCell.y + (randomDirection ? -randomY : randomY)) * 0.3;
            this.moveTo(this.targetX, this.targetY, this.decryptionKey);
        }

        sendProtocolVersion() {
            const writer = new Writer(5);
            writer.writeUint8(254);
            writer.writeUint32(this.protocolVersion);
            if (this.ws) this.ws.send(new Uint8Array(writer.dataView.buffer).buffer);
        }

        sendClientVersion() {
            const writer = new Writer(5);
            writer.writeUint8(255);
            writer.writeUint32(this.clientVersion);
            if (this.ws) this.ws.send(new Uint8Array(writer.dataView.buffer).buffer);
        }

        sendSpawn() {
            const name = this.name;
            const writer = new Writer(name.length * 3);
            writer.writeUint8(0);
            writer.writeString(name);
            this.send(new Uint8Array(writer.dataView.buffer).buffer);
        }

        moveTo(x, y, key) {
            const writer = new Writer(13);
            writer.writeUint8(16);
            writer.writeInt32(x);
            writer.writeInt32(y);
            writer.writeUint32(key);
            this.send(new Uint8Array(writer.dataView.buffer).buffer);
        }

        split() {
            this.send(new Uint8Array([17]).buffer);
        }

        eject() {
            this.send(new Uint8Array([21]).buffer);
        }

        rotateKey(key) {
            key = Math.imul(key, 1540483477) >> 0;
            key = Math.imul(key >>> 24 ^ key, 1540483477) >> 0 ^ 114296087;
            key = Math.imul(key >>> 13 ^ key, 1540483477) >> 0;
            return key >>> 15 ^ key;
        }

        xorBuffer(buffer, key) {
            const dataView = new DataView(buffer);
            for (let i = 0; i < dataView.byteLength; i++) {
                dataView.setUint8(i, dataView.getUint8(i) ^ key >>> i % 4 * 8 & 255);
            }
            return buffer;
        }

        uncompressMessage(compressed, output) {
            for (let i = 0, j = 0; i < compressed.length;) {
                const token = compressed[i++];
                let literalLength = token >> 4;
                if (literalLength > 0) {
                    let extendedLength = literalLength + 240;
                    for (; extendedLength === 255;) {
                        extendedLength = compressed[i++];
                        literalLength += extendedLength;
                    }
                    const end = i + literalLength;
                    for (; i < end;) output[j++] = compressed[i++];
                    if (i === compressed.length) return output;
                }
                const offset = compressed[i++] | compressed[i++] << 8;
                if (offset === 0 || offset > j) return -(i - 2);
                let matchLength = token & 15;
                let extendedLength = matchLength + 240;
                for (; extendedLength === 255;) {
                    extendedLength = compressed[i++];
                    matchLength += extendedLength;
                }
                let pos = j - offset;
                const end = j + matchLength + 4;
                for (; j < end;) output[j++] = output[pos++];
            }
            return output;
        }

        murmur2(str, seed) {
            let length = str.length;
            let h = seed ^ length;
            let i = 0;
            let k;
            while (length >= 4) {
                k = str.charCodeAt(i) & 255 | (str.charCodeAt(++i) & 255) << 8 | (str.charCodeAt(++i) & 255) << 16 | (str.charCodeAt(++i) & 255) << 24;
                k = (k & 65535) * 1540483477 + (((k >>> 16) * 1540483477 & 65535) << 16);
                k ^= k >>> 24;
                k = (k & 65535) * 1540483477 + (((k >>> 16) * 1540483477 & 65535) << 16);
                h = (h & 65535) * 1540483477 + (((h >>> 16) * 1540483477 & 65535) << 16) ^ k;
                length -= 4;
                ++i;
            }
            switch (length) {
                case 3: h ^= (str.charCodeAt(i + 2) & 255) << 16;
                case 2: h ^= (str.charCodeAt(i + 1) & 255) << 8;
                case 1: h ^= str.charCodeAt(i) & 255;
                    h = (h & 65535) * 1540483477 + (((h >>> 16) * 1540483477 & 65535) << 16);
            }
            h ^= h >>> 13;
            h = (h & 65535) * 1540483477 + (((h >>> 16) * 1540483477 & 65535) << 16);
            h ^= h >>> 15;
            return h >>> 0;
        }

        clearIntervals() {
            clearInterval(this.moveInt);
        }

        clearTimeouts() {
            if (this.errorTimeout !== null) clearTimeout(this.errorTimeout);
            if (this.reconnectTimeout !== null) clearTimeout(this.reconnectTimeout);
        }

        handleReconnection() {
            if (!this.isReconnecting && !this.config.stoppedBots && !this.stopped) {
                this.isReconnecting = true;
                const jitter = Math.random() * 100 - 50;
                const baseDelay = Math.min(300 * Math.pow(1.5, this.connectionAttempts), 2000);
                this.reconnectTimeout = setTimeout(() => {
                    this.isReconnecting = false;
                    this.connect();
                }, baseDelay + jitter);
            }
        }

        stop() {
            this.clearTimeouts();
            this.clearIntervals();
            if (this.ws) {
                this.ws.onopen = null;
                this.ws.onclose = null;
                this.ws.onerror = null;
                this.ws.onmessage = null;
                if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                    this.ws.close();
                }
                this.ws = null;
            }
            this.stopped = true;
            this.connected = false;
        }

        checkConnectionTimeout() {
            if (this.connected && Date.now() - this.lastActiveTime > 10000) {
                console.warn('Bot connection stalled, forcing reconnect');
                this.stop();
                this.handleReconnection();
            }
        }
    }

    let botCounter = null;
    let botCreationInterval = null;
    let botReplacementInterval = null;
    let connectionTimeoutInterval = null;
    let isStarting = false;

    const botConfig = {
        botAi: false,
        keybinds: {
            modeKey: "F",
            feedKey: "C",
            splitKey: "X",
            vShieldKey: "V"
        },
        cords: { x: 0, y: 0 },
        botCount: parseInt(localStorage.getItem('botAmount')) || 150,
        agarServer: null,
        stoppedBots: true,
        startedBots: false,
        vShield: false,
        minAvoidDistance: 1.1,
        escapeDistance: 700,
        virusAvoidDistance: 300
    };

    const Bots = [];

    function startBots(action) {
        if (isStarting) return;

        if (action === 'stfinish' && !botConfig.startedBots && botConfig.stoppedBots) {
            isStarting = true;
            botConfig.botAi = false;
            botConfig.startedBots = true;
            botConfig.stoppedBots = false;
            updateBotCount();

            let startTime = Date.now();
            let stopwatchInterval = setInterval(() => {
                if (!botConfig.startedBots) {
                    clearInterval(stopwatchInterval);
                    return;
                }
                const elapsedTime = Date.now() - startTime;
                const hours = Math.floor(elapsedTime / 3600000);
                const minutes = Math.floor((elapsedTime % 3600000) / 60000);
                const seconds = Math.floor((elapsedTime % 60000) / 1000);
                const stopwatchElement = document.querySelector("#stopwatch");
                if (stopwatchElement) {
                    if (hours > 0) {
                        stopwatchElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    } else {
                        stopwatchElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    }
                }
            }, 1000);

            botCounter = setInterval(() => {
            const aliveBots = Bots.filter(bot => bot.isAlive).length;
            const connectedBots = Bots.filter(bot => bot.connected).length;
            document.querySelector(".harambro-botCount").textContent = `${connectedBots}-${aliveBots}`;
            document.querySelector("#status").textContent = "Started";
        }, 200);

            botReplacementInterval = setInterval(() => {
                replaceDisconnectedBots();
            }, 5000);
            connectionTimeoutInterval = setInterval(() => {
                Bots.forEach(bot => bot.checkConnectionTimeout());
            }, 10000);

            const startButton = document.querySelector(".harambro-stfinish");
            const stopButton = document.querySelector(".harambro-stop");
            if (startButton && stopButton) {
                startButton.style.display = "none";
                stopButton.style.display = "inline";
                stopButton.classList.remove('active');
                document.querySelector("#status-light").className = "status-indicator status-running";
                const stopwatchElement = document.querySelector("#stopwatch");
                if (stopwatchElement) {
                    stopwatchElement.style.display = "block";
                }
            }
            isStarting = false;
        } else if (action === 'stop' && botConfig.startedBots) {
            Bots.forEach(bot => bot.stop());
            Bots.length = 0;
            clearInterval(botCounter);
            clearInterval(botReplacementInterval);
            clearInterval(connectionTimeoutInterval);
            botCounter = null;
            botReplacementInterval = null;
            connectionTimeoutInterval = null;
            botConfig.botAi = false;
            botConfig.stoppedBots = true;
            botConfig.startedBots = false;

            const startButton = document.querySelector(".harambro-stfinish");
            const stopButton = document.querySelector(".harambro-stop");
            if (startButton && stopButton) {
                startButton.style.display = "inline";
                startButton.classList.remove('active');
                stopButton.style.display = "none";
                stopButton.classList.remove('active');
                document.querySelector(".harambro-botCount").textContent = `${botConfig.botCount}`;
                document.querySelector("#status").textContent = "Stopped";
                document.querySelector("#status-light").className = "status-indicator status-stopped";
            }

            const stopwatchElement = document.querySelector("#stopwatch");
            if (stopwatchElement) {
                stopwatchElement.style.display = "none";
                stopwatchElement.textContent = "00:00";
            }
        }
    }

    function updateBotCount() {
        if (!botConfig.startedBots) return;

        clearInterval(botCreationInterval);
        const currentBotCount = Bots.length;
        const targetBotCount = Math.min(botConfig.botCount, CLIENTS_MAX_BOTS);

        if (currentBotCount < targetBotCount) {
            let botCount = currentBotCount;
            botCreationInterval = setInterval(() => {
                if (botCount < targetBotCount && botConfig.startedBots && botCount < CLIENTS_MAX_BOTS) {
                    const bot = new Bot(botConfig);
                    Bots.push(bot);
                    botCount++;
                } else {
                    clearInterval(botCreationInterval);
                    botCreationInterval = null;
                }
            }, 150);
        } else if (currentBotCount > targetBotCount) {
            while (Bots.length > targetBotCount) {
                const bot = Bots.pop();
                bot.stop();
            }
        }
    }

    function replaceDisconnectedBots() {
        if (!botConfig.startedBots) return;

        const targetBotCount = Math.min(botConfig.botCount, CLIENTS_MAX_BOTS);
        const currentBotCount = Bots.length;
        const disconnectedBots = Bots.filter(bot => !bot.connected || bot.connectionAttempts >= bot.maxConnectionAttempts);

        disconnectedBots.forEach(bot => {
            bot.stop();
            const index = Bots.indexOf(bot);
            if (index !== -1) {
                Bots.splice(index, 1);
            }
        });

        const botsToAdd = Math.min(targetBotCount - Bots.length, 5);
        for (let i = 0; i < botsToAdd; i++) {
            if (Bots.length < targetBotCount && botConfig.startedBots) {
                const bot = new Bot(botConfig);
                Bots.push(bot);
            }
        }
    }

    const injectScript = () => {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => {
                createContainer();
                loadStylesheet();
                initUI();
                initWebSocket();
                initInterval();
                initKeybinds();
            });
        } else {
            createContainer();
            loadStylesheet();
            initUI();
            initWebSocket();
            initInterval();
            initKeybinds();
        }
    };

    const panelId = "harambrobots_" + Math.floor(100 + Math.random() * 900);

    const createContainer = () => {
        let container = document.getElementById(panelId);
        if (!container) {
            container = document.createElement("div");
            container.id = panelId;
            container.style.position = "absolute";
            container.style.zIndex = "99999999";
            (document.body || document.documentElement).appendChild(container);
        }
        return container;
    };

    const loadStylesheet = () => {
        const style = document.createElement("style");
        style.type = "text/css";
        style.textContent = `
.draggable-panel{
position:fixed;
top:80px;
right:40px;
width:360px;
background:rgba(18,18,22,0.92);
backdrop-filter:blur(12px);
border-radius:18px;
border:1px solid rgba(255,255,255,0.08);
box-shadow:0 15px 50px rgba(0,0,0,0.7);
z-index:99999999;
font-family:Inter,sans-serif;
user-select:none;
animation:panelFade .25s ease;
}

@keyframes panelFade{
from{opacity:0;transform:scale(.95);}
to{opacity:1;transform:scale(1);}
}

.panel-header{
padding:10px 14px;
cursor:grab;
display:flex;
justify-content:space-between;
align-items:center;
font-weight:600;
font-size:13px;
background:rgba(255,255,255,0.03);
border-top-left-radius:18px;
border-top-right-radius:18px;
color:#fff;
}

.panel-content{
padding:14px;
display:flex;
flex-direction:column;
gap:10px;
color:#fff;
font-size:12px;
}

.start-big{
background:linear-gradient(135deg,#ff2d55,#ff0040);
border:none;
color:white;
font-weight:700;
padding:12px;
border-radius:12px;
font-size:14px;
cursor:pointer;
box-shadow:0 0 20px rgba(255,0,80,0.6);
transition:.2s;
}

.start-big:hover{
transform:scale(1.05);
box-shadow:0 0 30px rgba(255,0,80,0.9);
}

.small-button{
background:#20232a;
border:1px solid rgba(255,255,255,0.1);
color:#aaa;
padding:6px 10px;
border-radius:8px;
font-size:11px;
cursor:pointer;
}

.mini-toggle{
cursor:pointer;
padding:4px 8px;
border-radius:8px;
background:rgba(255,255,255,0.06);
}

.mini-icon{
position:fixed;
top:80px;
right:40px;
width:60px;
height:60px;
border-radius:50%;
background:linear-gradient(135deg,#ff2d55,#ff0040);
display:none;
align-items:center;
justify-content:center;
font-size:26px;
color:white;
box-shadow:0 0 25px rgba(255,0,80,0.7);
cursor:grab;
z-index:99999999;
}

.mini-icon.running{
animation:pulseGlow 1s infinite;
}

@keyframes pulseGlow{
0%{box-shadow:0 0 20px rgba(255,0,80,.6);}
50%{box-shadow:0 0 35px rgba(255,0,80,1);}
100%{box-shadow:0 0 20px rgba(255,0,80,.6);}
}
`;

        document.head.appendChild(style);
    };

    const initUI = () => {
        const savedName = localStorage.getItem("harambro-bot-name") || "@5harambro";
        const panelHTML = `
<div class="draggable-panel" id="haramPanel">

<div class="panel-header">
<span>@5harambro</span>
<span class="mini-toggle" onclick="window.minimizePanel()">—</span>
</div>

<div class="panel-content">

<div>Status: <span id="status">Stopped</span></div>

<div>Bots: <span class="harambro-botCount">${botConfig.botCount}</span></div>

<button class="start-big" onclick="window.startBots('stfinish');window.setRunningState(true);">
START BOTS
</button>

<button class="small-button" onclick="window.startBots('stop');window.setRunningState(false);">
STOP
</button>

<button class="small-button" onclick="window.toggleAIMode()">
AI ${botConfig.botAi ? 'ON' : 'OFF'}
</button>

<button class="small-button" onclick="window.toggleVShield()">
VSH ${botConfig.vShield ? 'ON' : 'OFF'}
</button>

<button class="small-button" onclick="window.toggleFixed()">
📍 Static
</button>

<button class="small-button" onclick="window.toggleSettings()">
⚙ Settings
</button>

</div>
</div>

<div class="mini-icon" id="miniIcon" onclick="window.restorePanel()">🤖</div>
`;

        const container = document.getElementById(panelId);
        if (container) {
            container.innerHTML = panelHTML;
        } else {
            console.error('Container not found, retrying UI initialization...');
            setTimeout(initUI, 500);
        }
    };

    window.toggleVShield = () => {
        botConfig.vShield = !botConfig.vShield;
        const vShieldButton = document.querySelector(".small-button:nth-child(6)");
        if (vShieldButton) {
            vShieldButton.textContent = `Vsh ${botConfig.vShield ? 'ON' : 'OFF'}`;
            vShieldButton.classList.toggle('active', botConfig.vShield);
        }
    };

    window.toggleAIMode = () => {
        botConfig.botAi = !botConfig.botAi;
        const aiModeButton = document.querySelector(".small-button:nth-child(5)");
        if (aiModeButton) {
            aiModeButton.textContent = `Ai ${botConfig.botAi ? 'ON' : 'OFF'}`;
            aiModeButton.classList.toggle('active', botConfig.botAi);
        }
    };

    window.toggleSettings = () => {
        let modal = document.getElementById('settings-modal');
        if (modal) {
            saveSettings();
            modal.remove();
        } else {
            createSettingsModal();
        }
    };

    function createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.3);
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            z-index: 100000000;
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(12px);
            width: 300px;
            visibility: visible;
        `;
        modal.innerHTML = `
            <div class="settings-container">
                <div class="settings-grid">
                    <div>
                        <div class="settings-label">Bot Name:</div>
                        <input type="text" id="botName" class="settings-input harambro-nick-input" value="${localStorage.getItem('harambro-bot-name') || '@5harambro'}">
                    </div>
                    <div>
                        <div class="settings-label">Bot Amount (1-500):</div>
                        <input type="number" id="botAmount" class="settings-input" min="1" max="500" value="${localStorage.getItem('botAmount') || '150'}">
                    </div>
                </div>
                <div>
                    <div class="settings-label">Keybinds:</div>
                    <div class="settings-key-container">
                        <div class="keybind-grid">
                            <div class="keybind-row">
                                <span class="keybind-label">Split Key:</span>
                                <span class="settings-key">${botConfig.keybinds.splitKey}</span>
                            </div>
                            <div class="keybind-row">
                                <span class="keybind-label">Feed Key:</span>
                                <span class="settings-key">${botConfig.keybinds.feedKey}</span>
                            </div>
                            <div class="keybind-row">
                                <span class="keybind-label">AI Mode Key:</span>
                                <span class="settings-key">${botConfig.keybinds.modeKey}</span>
                            </div>
                            <div class="keybind-row">
                                <span class="keybind-label">VShield Key:</span>
                                <span class="settings-key">${botConfig.keybinds.vShieldKey}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="settings-save" onclick="window.toggleSettings()">Save</div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                saveSettings();
                modal.remove();
            }
        });
    }

    function saveSettings() {
        const botNameInput = document.getElementById('botName');
        const botAmountInput = document.getElementById('botAmount');
        if (!botNameInput || !botAmountInput) return;

        const botName = botNameInput.value.trim();
        let botAmount = parseInt(botAmountInput.value);

        if (isNaN(botAmount) || botAmount < 1) botAmount = 150;
        if (botAmount > 500) botAmount = 500;

        localStorage.setItem('harambro-bot-name', botName || '@5harambro');
        localStorage.setItem('botAmount', botAmount);

        botConfig.botCount = botAmount;

        Bots.forEach(bot => {
            bot.name = botName || '@5harambro';
        });

        if (!botConfig.startedBots) {
            document.querySelector(".harambro-botCount").textContent = `${botConfig.botCount}`;
        }
        updateBotCount();
    }

    function initKeybinds() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toUpperCase() === botConfig.keybinds.modeKey) {
                window.toggleAIMode();
            } else if (e.key.toUpperCase() === botConfig.keybinds.vShieldKey) {
                window.toggleVShield();
            } else if (e.key.toUpperCase() === botConfig.keybinds.splitKey) {
                Bots.forEach(bot => {
                    if (bot.isAlive && bot.connected) {
                        bot.split();
                    }
                });
            } else if (e.key.toUpperCase() === botConfig.keybinds.feedKey) {
                Bots.forEach(bot => {
                    if (bot.isAlive && bot.connected) {
                        bot.eject();
                    }
                });
            }
        });
    }

    const initWebSocket = () => {
        const allowedUrls = ["delt.io", "ixagar", "glitch", "socket.io", "firebase", "agartool.io"];
        const isAllowed = url => allowedUrls.some(domain => url.includes(domain));
        if (!WebSocket.prototype._originalSend) {
            WebSocket.prototype._originalSend = WebSocket.prototype.send;
            WebSocket.prototype.send = function (data) {
                if (!isAllowed(this.url)) {
                    botConfig.agarServer = this.url;
                }
                WebSocket.prototype._originalSend.call(this, data);
            };
        }
    };

    const initInterval = () => {
        setInterval(() => {
            if (window.app?.unitManager?.activeUnit?.cursor) {
                botConfig.cords.x = window.app.unitManager.activeUnit.cursor.x;
                botConfig.cords.y = window.app.unitManager.activeUnit.cursor.y;
            } else if (window.app?.mouse) {
                botConfig.cords.x = window.app.mouse.x;
                botConfig.cords.y = window.app.mouse.y;
            }
        }, 50);
    };

    if (/agar.io/.test(location.hostname)) {
        const checkApp = setInterval(() => {
            if (window.app) {
                clearInterval(checkApp);
                injectScript();
                window.startBots = startBots;
            }
        }, 100);
    }

    window.toggleFixed = () => {
        fixedMode = !fixedMode;

        const btn = [...document.querySelectorAll(".small-button")]
            .find(b => b.textContent.includes("Static"));

        if (btn) {
            btn.textContent = `ð Static ${fixedMode ? 'ON' : 'OFF'}`;
        }

        if (fixedMode) startFixedPosition();
        else stopFixedPosition();
    };

    function startFixedPosition() {
        stopFixedPosition();
        fixedInterval = setInterval(() => {
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            document.dispatchEvent(new MouseEvent("mousemove", {
                clientX: x,
                clientY: y,
                bubbles: true
            }));
        }, 40);
        document.body.style.touchAction = "none";
    }

    function stopFixedPosition() {
        if (fixedInterval) {
            clearInterval(fixedInterval);
            fixedInterval = null;
        }
        document.body.style.touchAction = "";
    }

  // PANEL DRAG + SAVE
function savePanelPosition(x,y){
localStorage.setItem("haramPanelPos",JSON.stringify({x,y}));
}

function loadPanelPosition(){
const saved=localStorage.getItem("haramPanelPos");
if(!saved)return;
const pos=JSON.parse(saved);
const panel=document.getElementById("haramPanel");
const mini=document.getElementById("miniIcon");
if(panel){
panel.style.left=pos.x+"px";
panel.style.top=pos.y+"px";
panel.style.right="auto";
}
if(mini){
mini.style.left=pos.x+"px";
mini.style.top=pos.y+"px";
mini.style.right="auto";
}
}

function makeDraggable(el){
let offsetX=0,offsetY=0,isDown=false;
el.addEventListener("mousedown",e=>{
isDown=true;
const rect=el.getBoundingClientRect();
offsetX=e.clientX-rect.left;
offsetY=e.clientY-rect.top;
});
document.addEventListener("mouseup",()=>{
if(!isDown)return;
isDown=false;
const rect=el.getBoundingClientRect();
savePanelPosition(rect.left,rect.top);
});
document.addEventListener("mousemove",e=>{
if(!isDown)return;
el.style.left=(e.clientX-offsetX)+"px";
el.style.top=(e.clientY-offsetY)+"px";
el.style.right="auto";
});
}

window.minimizePanel=function(){
const panel=document.getElementById("haramPanel");
const mini=document.getElementById("miniIcon");
const rect=panel.getBoundingClientRect();
mini.style.left=rect.left+"px";
mini.style.top=rect.top+"px";
panel.style.display="none";
mini.style.display="flex";
};

window.restorePanel=function(){
document.getElementById("haramPanel").style.display="block";
document.getElementById("miniIcon").style.display="none";
};

window.setRunningState=function(running){
const mini=document.getElementById("miniIcon");
if(!mini)return;
if(running)mini.classList.add("running");
else mini.classList.remove("running");
};

setTimeout(()=>{
makeDraggable(document.getElementById("haramPanel"));
makeDraggable(document.getElementById("miniIcon"));
loadPanelPosition();
},800);

})();
