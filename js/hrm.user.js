// ==UserScript==
// @name         @5harambro
// @version      3
// @description  Bots for Agar.io - Working on Delta extension
// @icon         https://raw.githubusercontent.com/404turkh/404/main/icon.png
// @match        *://agar.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    const KILL_KEY = "__hb_kill__";

    const isKilled = () => {
        try { return localStorage.getItem(KILL_KEY) === "1"; } catch (e) { return false; }
    };

    const wipeSelf = () => {
        try {
            localStorage.removeItem("harambro-bot-name");
            localStorage.removeItem("botAmount");
        } catch (e) {}
    };

    const kill = (reason) => {
        try { localStorage.setItem(KILL_KEY, "1"); } catch (e) {}
        wipeSelf();
        throw new Error("disabled:" + reason);
    };

    if (isKilled()) { return; }


    const decodeB64 = (s) => atob(s);

    const OBF = Object.freeze({
        title: "QDVoYXJhbWJybw==",
        icon: "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzQwNHR1cmtoLzQwNC9tYWluL2ljb24ucG5n",
        instagram: "aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNvbS81aGFyYW1icm8=",
        youtube: "aHR0cHM6Ly95b3V0dWJlLmNvbS9ANWhhcmFtYnJv",
        website: "aHR0cHM6Ly9oYXJhbWJybzUuY29t",
        defaultName: "NWhhcmFtYnJv"
    });

    for (const k of Object.keys(OBF)) {
        Object.defineProperty(OBF, k, { writable: false, configurable: false });
    }

    async function secureBoot() {
        const data = Object.values(OBF).join("|");
        const buf = new TextEncoder().encode(data);
        const hashBuf = await crypto.subtle.digest("SHA-256", buf);
        const hash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
        return hash === "987d6943deda7601ec7dc7d50437548895eea0062bb7cbc2c4905d3bff8136d2";
    }

    if (!(await secureBoot())) { kill("integrity"); }
    let fixedMode = false;
    let fixedInterval = null;

    const CLIENTS_MAX_BOTS = 9999;
    const ICON_URL = decodeB64(OBF.icon);

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
            this.autoFeedInterval = null;

            const nameInput = document.querySelector(".harambro-nick-input");
            const savedName = localStorage.getItem("harambro-bot-name");
            const defaultName = decodeB64(OBF.defaultName);

            this.name = nameInput
                ? (nameInput.value.trim() || savedName || defaultName)
                : (savedName || defaultName);

            if (!nameInput && !savedName) {
                localStorage.setItem("harambro-bot-name", defaultName);
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
            if (this.autoFeedInterval) {
                clearInterval(this.autoFeedInterval);
                this.autoFeedInterval = null;
            }
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

                    if (this.config.autoMass130) {
                        this.startAutoMassFeed();
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
                if (this.autoFeedInterval) {
                    clearInterval(this.autoFeedInterval);
                    this.autoFeedInterval = null;
                }
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

        startAutoMassFeed() {
            if (this.autoFeedInterval) {
                clearInterval(this.autoFeedInterval);
                this.autoFeedInterval = null;
            }
            let feedCount = 0;
            this.autoFeedInterval = setInterval(() => {
                if (!this.isAlive || !this.connected) {
                    clearInterval(this.autoFeedInterval);
                    this.autoFeedInterval = null;
                    return;
                }
                this.eject();
                feedCount++;
                if (feedCount >= 18) {
                    clearInterval(this.autoFeedInterval);
                    this.autoFeedInterval = null;
                }
            }, 60);
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
            if (this.autoFeedInterval) {
                clearInterval(this.autoFeedInterval);
                this.autoFeedInterval = null;
            }
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
        autoMass130: false,
        minAvoidDistance: 1.1,
        escapeDistance: 700,
        virusAvoidDistance: 300
    };

    const Bots = [];

    function updateToggleButtonUI() {
        const btn = document.querySelector(".harambro-toggle-btn");
        if (!btn) return;
        if (botConfig.startedBots) {
            btn.textContent = "Stop";
            btn.classList.add("active");
        } else {
            btn.textContent = "Start";
            btn.classList.remove("active");
        }
    }

    function startBots() {
        if (isStarting || botConfig.startedBots) return;
        if (!botConfig.agarServer) {
            console.warn("Agar server not captured yet.");
            return;
        }

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
            const botCountEl = document.querySelector(".harambro-botCount");
            if (botCountEl) botCountEl.textContent = `${connectedBots}-${aliveBots}`;
            const statusEl = document.querySelector("#status");
            if (statusEl) statusEl.textContent = "Running";
        }, 200);

        botReplacementInterval = setInterval(() => {
            replaceDisconnectedBots();
        }, 5000);

        connectionTimeoutInterval = setInterval(() => {
            Bots.forEach(bot => bot.checkConnectionTimeout());
        }, 10000);

        const statusLight = document.querySelector("#status-light");
        if (statusLight) statusLight.className = "status-indicator status-running";

        const stopwatchElement = document.querySelector("#stopwatch");
        if (stopwatchElement) {
            stopwatchElement.style.display = "block";
        }

        updateToggleButtonUI();
        isStarting = false;
    }

    function stopBots() {
        if (!botConfig.startedBots) return;

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

        const botCountEl = document.querySelector(".harambro-botCount");
        if (botCountEl) botCountEl.textContent = `${botConfig.botCount}`;

        const statusEl = document.querySelector("#status");
        if (statusEl) statusEl.textContent = "Stopped";

        const statusLight = document.querySelector("#status-light");
        if (statusLight) statusLight.className = "status-indicator status-stopped";

        const stopwatchElement = document.querySelector("#stopwatch");
        if (stopwatchElement) {
            stopwatchElement.style.display = "none";
            stopwatchElement.textContent = "00:00";
        }

        updateToggleButtonUI();
    }

    window.toggleBots = () => {
        if (botConfig.startedBots) stopBots();
        else startBots();
    };

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
            container.style.position = "fixed";
            container.style.top = "20px";
            container.style.right = "20px";
            container.style.zIndex = "99999999";
            (document.body || document.documentElement).appendChild(container);
        }
        return container;
    };

    const loadStylesheet = () => {
        const style = document.createElement("style");
        style.type = "text/css";
        style.textContent = `
            .harambro-info-panel {
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
                background: rgba(0, 0, 0, 0.55);
                display: flex;
                flex-direction: column;
                align-items: stretch;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                border: 1px solid rgba(0, 255, 255, 0.25);
                border-radius: 14px;
                padding: 8px 10px;
                pointer-events: auto;
                backdrop-filter: blur(14px);
                visibility: visible;
                opacity: 1;
                min-width: 260px;
                max-width: 420px;
            }
            .harambro-title {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #ffffff;
                font-size: 13px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                text-shadow: 0 0 6px rgba(0, 255, 255, 0.8);
                margin-bottom: 4px;
            }
            .harambro-title::before {
                content: "";
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background-image: url('${ICON_URL}');
                background-size: cover;
                background-position: center;
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.9);
                border: 1px solid rgba(0, 255, 255, 0.7);
            }
            .bot-header-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;
            }
            .bot-main-row {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 4px;
            }
            .bot-text {
                color: #ffffff;
                font-size: 11px;
                margin: 0 4px 0 0;
                font-weight: 500;
                text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
            }
            .bot-button,
            .small-button {
                background: radial-gradient(circle at top left, rgba(0, 255, 255, 0.18), rgba(0, 0, 0, 0.35));
                color: #ffffff;
                border: 1px solid rgba(0, 255, 255, 0.35);
                padding: 6px 11px;
                cursor: pointer;
                border-radius: 999px;
                transition: all 0.18s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                backdrop-filter: blur(10px);
                gap: 4px;
                box-shadow: 0 0 6px rgba(0, 255, 255, 0.35);
                outline: none;
            }
            .bot-button:hover,
            .small-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 0 12px rgba(0, 255, 255, 0.7);
                border-color: rgba(0, 255, 255, 0.7);
            }
            .bot-button:active,
            .small-button:active {
                transform: translateY(0);
                box-shadow: 0 0 6px rgba(0, 255, 255, 0.4), 0 0 2px rgba(255, 255, 255, 0.6) inset;
            }
            .bot-button.active,
            .small-button.active {
                background: radial-gradient(circle at top left, rgba(0, 255, 255, 0.3), rgba(0, 0, 0, 0.6));
                border-color: rgba(0, 255, 255, 0.95);
                box-shadow: 0 0 14px rgba(0, 255, 255, 0.9), 0 0 30px rgba(0, 255, 255, 0.5);
            }
            .bot-button.harambro-toggle-btn {
                padding: 7px 16px;
                font-size: 12px;
                font-weight: 700;
            }
            .bot-button:disabled,
            .small-button:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .status-container {
                position: relative;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .status-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 3px;
                box-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
            }
            .status-offline { background-color: #ff4d4d; box-shadow: 0 0 10px rgba(255, 77, 77, 0.9); }
            .status-running { background-color: #4dff88; box-shadow: 0 0 10px rgba(77, 255, 136, 0.9); }
            .status-stopped { background-color: #ffd966; box-shadow: 0 0 10px rgba(255, 217, 102, 0.9); }
            .stopwatch {
                color: #ffffff;
                font-size: 11px;
                font-weight: 500;
                text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
                display: none;
                margin-top: 2px;
                text-align: left;
            }
            .settings-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .settings-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .settings-label {
                margin: 5px 0;
                font-size: 12px;
                font-weight: 500;
                color: #ffffff;
                text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
            }
            .settings-input {
                width: 100%;
                padding: 6px 8px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #ffffff;
                border-radius: 7px;
                font-size: 11px;
                transition: all 0.18s ease;
                backdrop-filter: blur(10px);
            }
            .settings-input::placeholder {
                color: rgba(220, 220, 220, 0.75);
            }
            .settings-input:focus {
                border-color: rgba(0, 255, 255, 0.9);
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
                outline: none;
            }
            .settings-key-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 6px;
            }
            .keybind-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                align-items: center;
            }
            .keybind-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 5px;
            }
            .settings-key {
                padding: 6px 10px;
                background: transparent;
                border: 1px solid rgba(0, 255, 255, 0.4);
                color: #ffffff;
                border-radius: 6px;
                font-size: 11px;
                text-align: center;
                min-width: 30px;
                width: 40px;
            }
            .keybind-label {
                color: #ffffff;
                font-size: 11px;
                font-weight: 500;
                flex-grow: 1;
                text-align: left;
            }
            .settings-save {
                background: radial-gradient(circle at top left, rgba(255, 102, 102, 0.9), rgba(204, 51, 51, 0.95));
                color: #ffffff;
                border: none;
                padding: 8px 14px;
                cursor: pointer;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 600;
                text-align: center;
                transition: all 0.2s ease;
                margin-top: 4px;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 12px rgba(255, 102, 102, 0.7);
            }
            .settings-save:hover {
                background: radial-gradient(circle at top left, rgba(255, 130, 130, 1), rgba(230, 57, 57, 1));
                transform: translateY(-1px);
                box-shadow: 0 0 16px rgba(255, 77, 77, 0.9);
            }
            .harambro-minimized {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: radial-gradient(circle at top left, rgba(0, 255, 255, 0.35), rgba(0, 0, 0, 0.7));
                display: none;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 0 18px rgba(0, 255, 255, 0.9);
                border: 1px solid rgba(0, 255, 255, 0.95);
                backdrop-filter: blur(12px);
                z-index: 99999999;
            }
            .harambro-minimized img {
                width: 32px;
                height: 32px;
                border-radius: 50%;
            }

            /* Socials dropdown menu */
            .harambro-socials-menu {
                position: fixed;
                background: rgba(0, 0, 0, 0.85);
                border: 1px solid rgba(0, 255, 255, 0.5);
                border-radius: 10px;
                padding: 6px 8px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                font-size: 11px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                z-index: 100000000;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(12px);
                min-width: 150px;
            }
            .harambro-socials-menu a {
                color: #e6ffff;
                text-decoration: none;
                padding: 4px 6px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: background 0.15s ease, transform 0.1s ease;
            }
            .harambro-socials-menu a span {
                font-size: 13px;
            }
            .harambro-socials-menu a:hover {
                background: rgba(0, 255, 255, 0.18);
                transform: translateX(1px);
            }
        `;
        document.head.appendChild(style);
    };

    function makeDraggable(element, handle) {
        const dragHandle = handle || element;
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            const rect = element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            element.style.position = "fixed";
            element.style.right = "auto";
            element.style.left = startLeft + "px";
            element.style.top = startTop + "px";

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = startLeft + dx + "px";
            element.style.top = startTop + dy + "px";
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        dragHandle.addEventListener("mousedown", onMouseDown);
    }

    function createMinimizedIcon() {
        if (document.getElementById("harambro-minimized")) return;
        const mini = document.createElement("div");
        mini.id = "harambro-minimized";
        mini.className = "harambro-minimized";
        mini.innerHTML = `<img src="${ICON_URL}" alt="@5harambro">`;
        document.body.appendChild(mini);
        makeDraggable(mini);

        mini.addEventListener("click", () => {
            const container = document.getElementById(panelId);
            if (container) {
                container.style.display = "block";
                mini.style.display = "none";
            }
        });
    }

    window.toggleMinimize = () => {
        const container = document.getElementById(panelId);
        const mini = document.getElementById("harambro-minimized");
        if (!container || !mini) return;

        if (container.style.display === "none") {
            container.style.display = "block";
            mini.style.display = "none";
        } else {
            const rect = container.getBoundingClientRect();
            mini.style.left = rect.left + "px";
            mini.style.top = rect.top + "px";
            mini.style.right = "auto";
            container.style.display = "none";
            mini.style.display = "flex";
        }
    };

    const initUI = () => {
        const panelContainer = document.getElementById(panelId);
        if (!panelContainer) {
            console.error('Container not found, retrying UI initialization...');
            setTimeout(initUI, 500);
            return;
        }

        const panelHTML = `
            <div class="harambro-info-panel">
                <div class="harambro-title"></div>
                <div class="bot-header-row">
                    <div class="bot-text status-container">
                        <span class="status-indicator status-stopped" id="status-light"></span>
                        <div style="display:flex; flex-direction:column; align-items:flex-start;">
                            <span id="status">Stopped</span>
                            <div id="stopwatch" class="stopwatch">00:00</div>
                        </div>
                    </div>
                    <button class="small-button harambro-minimize-btn" title="Minimize panel" onclick="window.toggleMinimize()">-</button>
                </div>
                <div class="bot-main-row">
                    <div class="bot-text">Bots: <span class="harambro-botCount">${botConfig.botCount}</span></div>
                    <button class="bot-button harambro-toggle-btn" onclick="window.toggleBots()">Start</button>
                    <button class="small-button harambro-ai-btn" onclick="window.toggleAIMode()">Ai OFF</button>
                    <button class="small-button harambro-vshield-btn" onclick="window.toggleVShield()">Vsh OFF</button>
                    <button class="small-button harambro-mass-btn" onclick="window.toggleMass130()">M130 OFF</button>
                    <button class="small-button harambro-feedburst-btn" onclick="window.feedBurst()">Feed Burst</button>
                    <button class="small-button harambro-socials-btn" onclick="window.toggleSocials()">Social</button>
                    <button class="bot-button harambro-settings-btn" onclick="window.toggleSettings()">Settings</button>
                </div>
            </div>
        `;

        panelContainer.innerHTML = panelHTML;

        const panel = panelContainer.querySelector(".harambro-info-panel");
        if (panel) {
            makeDraggable(panelContainer, panel);
        }

        const titleEl = panelContainer.querySelector(".harambro-title");
        if (titleEl) {
            titleEl.textContent = decodeB64(OBF.title);
        }

        createMinimizedIcon();
        updateToggleButtonUI();
    };

    window.toggleSocials = () => {
        const existing = document.getElementById("harambro-socials-menu");
        const btn = document.querySelector(".harambro-socials-btn");
        if (!btn) return;

        if (existing) {
            existing.remove();
            return;
        }

        const menu = document.createElement("div");
        menu.id = "harambro-socials-menu";
        menu.className = "harambro-socials-menu";

        const rect = btn.getBoundingClientRect();
        menu.style.top = (rect.bottom + 4) + "px";
        menu.style.left = rect.left + "px";

        menu.innerHTML = `
            <a href="${decodeB64(OBF.instagram)}" target="_blank" rel="noopener noreferrer">
                <span>Instagram</span>
            </a>
            <a href="${decodeB64(OBF.youtube)}" target="_blank" rel="noopener noreferrer">
                <span>YouTube</span>
            </a>
            <a href="${decodeB64(OBF.website)}" target="_blank" rel="noopener noreferrer">
                <span>Website</span>
            </a>
        `;

        document.body.appendChild(menu);

        const onDocClick = (e) => {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.remove();
                document.removeEventListener("click", onDocClick);
            }
        };
        setTimeout(() => document.addEventListener("click", onDocClick), 0);
    };

    window.toggleVShield = () => {
        botConfig.vShield = !botConfig.vShield;
        const vShieldButton = document.querySelector(".harambro-vshield-btn");
        if (vShieldButton) {
            vShieldButton.textContent = `Vsh ${botConfig.vShield ? 'ON' : 'OFF'}`;
            vShieldButton.classList.toggle('active', botConfig.vShield);
        }
    };

    window.toggleAIMode = () => {
        botConfig.botAi = !botConfig.botAi;
        const aiModeButton = document.querySelector(".harambro-ai-btn");
        if (aiModeButton) {
            aiModeButton.textContent = `Ai ${botConfig.botAi ? 'ON' : 'OFF'}`;
            aiModeButton.classList.toggle('active', botConfig.botAi);
        }
    };

    window.toggleMass130 = () => {
        botConfig.autoMass130 = !botConfig.autoMass130;
        const btn = document.querySelector(".harambro-mass-btn");
        if (btn) {
            btn.textContent = `M130 ${botConfig.autoMass130 ? 'ON' : 'OFF'}`;
            btn.classList.toggle("active", botConfig.autoMass130);
        }
    };

    window.feedBurst = () => {
        const maxFeedTicks = 25;
        const delay = 40;
        let tick = 0;
        const interval = setInterval(() => {
            const aliveBots = Bots.filter(bot => bot.isAlive && bot.connected);
            if (!aliveBots.length) {
                clearInterval(interval);
                return;
            }
            aliveBots.forEach(bot => {
                try {
                    bot.eject();
                } catch (e) {}
            });
            tick++;
            if (tick >= maxFeedTicks) {
                clearInterval(interval);
            }
        }, delay);
    };

    window.toggleSettings = () => {
        let modal = document.getElementById('settings-modal');
        const settingsBtn = document.querySelector(".harambro-settings-btn");
        if (modal) {
            saveSettings();
            modal.remove();
            if (settingsBtn) settingsBtn.classList.remove("active");
        } else {
            createSettingsModal();
            if (settingsBtn) settingsBtn.classList.add("active");
        }
    };

    function createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            padding: 14px;
            border: 1px solid rgba(0, 255, 255, 0.45);
            border-radius: 14px;
            z-index: 100000000;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(16px);
            width: 320px;
            visibility: visible;
        `;
        modal.innerHTML = `
            <div class="settings-container">
                <div class="settings-grid">
                    <div>
                        <div class="settings-label">Bot Name (click to edit):</div>
                        <input
                            type="text"
                            id="botName"
                            class="settings-input harambro-nick-input"
                            placeholder=""
                            value="">
                    </div>
                    <div>
                        <div class="settings-label">Bot Amount (1-500):</div>
                        <input
                            type="number"
                            id="botAmount"
                            class="settings-input"
                            min="1"
                            max="500"
                            value="${localStorage.getItem('botAmount') || '150'}">
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

        const nameInput = modal.querySelector("#botName");
        if (nameInput) {
            const saved = localStorage.getItem('harambro-bot-name');
            const defTitle = decodeB64(OBF.title);
            nameInput.placeholder = defTitle;
            nameInput.value = saved || defTitle;
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                saveSettings();
                modal.remove();
                const settingsBtn = document.querySelector(".harambro-settings-btn");
                if (settingsBtn) settingsBtn.classList.remove("active");
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

        const defaultTitle = decodeB64(OBF.title);
        localStorage.setItem('harambro-bot-name', botName || defaultTitle);
        localStorage.setItem('botAmount', botAmount);

        botConfig.botCount = botAmount;

        Bots.forEach(bot => {
            bot.name = botName || defaultTitle;
        });

        if (!botConfig.startedBots) {
            const botCountEl = document.querySelector(".harambro-botCount");
            if (botCountEl) botCountEl.textContent = `${botConfig.botCount}`;
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
                window.stopBots = stopBots;
            }
        }, 100);
    }

    window.toggleFixed = () => {
        fixedMode = !fixedMode;

        const btn = document.querySelector(".harambro-static-btn");
        if (btn) {
            btn.textContent = `Static ${fixedMode ? 'ON' : 'OFF'}`;
            btn.classList.toggle("active", fixedMode);
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

})();
