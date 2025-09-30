const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
const tokensFilePath = './src/database/sessions.json';
const jadiBotsDir = './JadiBots';

function loadTokens() {
    if (fs.existsSync(tokensFilePath)) {
        return JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'));
    }
    return [];
}
function saveTokens(data) {
    fs.writeFileSync(tokensFilePath, JSON.stringify(data, null, 2));
}
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "✿  *Vincula tu cuenta usando el código.*\n\nSigue las instrucciones:\n\n✎ *Mas opciones » Dispositivos vinculados » Vincular nuevo dispositivo » Vincular usando número.*\n\n↺ El codigo es valido por 45 segundos."
let rtx2 = "✿  *Vincula tu cuenta usando el código.*\n\nSigue las instrucciones:\n\n✎ *Mas opciones » Dispositivos vinculados » Vincular nuevo dispositivo » Vincular usando número.*\n\n↺ El codigo es valido por 45 segundos."

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const blackJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    return minutes + ' m y ' + seconds + ' s '
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date - global.db.data.users[m.sender].Subs < 120000) {
        return conn.reply(m.chat, `Espera ${msToTime(time - new Date())} para intentar Vincular un bot premium otra vez.`, m, fake)
    }
    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
    const subBotsCount = subBots.length
    if (subBotsCount === 30) {
        return m.reply(`❀ No hay más espacios para *Prem-Bots* disponible.`)
    }

    const userToken = args[0];
    if (!userToken) {
        return conn.reply(m.chat, `❀ Debes proporcionar un token para iniciar la sesión.\n> Ejemplo: *${usedPrefix + command} tu_token_aqui*`, m, fake);
    }

    let tokens = loadTokens();
    const userHasSession = tokens.find(s => s.estado === m.sender);
    if (userHasSession) {
        return conn.reply(m.chat, `❀ Ya tienes una sesión activa. Tu token es: *${userHasSession.token}*`, m, fake);
    }

    const validToken = tokens.find(s => s.token === userToken && s.estado === 'libre');
    if (!validToken) {
        return conn.reply(m.chat, '❀ El token proporcionado no es válido o ya está en uso.', m, fake);
    }

    // Asignar el token al usuario solo si es válido y libre
    validToken.estado = m.sender;
    saveTokens(tokens);

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathblackJadiBot = path.join(jadiBotsDir, id)

    if (!fs.existsSync(pathblackJadiBot)){
        fs.mkdirSync(pathblackJadiBot, { recursive: true })
    }

    // Determinar si es un método de código o QR
    const isCodeMethod = command === 'codeprem';

    blackJBOptions.pathblackJadiBot = pathblackJadiBot
    blackJBOptions.m = m
    blackJBOptions.conn = conn
    blackJBOptions.isCodeMethod = isCodeMethod
    blackJBOptions.fromCommand = true
    blackJBOptions.isPremiumFromToken = validToken.premium
    blackJadiBot(blackJBOptions)

    global.db.data.users[m.sender].Subs = new Date * 1
} 
handler.help = ['qrprem', 'codeprem']
handler.tags = ['serbot']
handler.command = ['qrprem', 'codeprem']
export default handler 

export async function blackJadiBot(options) {
    let { pathblackJadiBot, m, conn, isCodeMethod, isPremiumFromToken } = options
    let txtCode, codeBot, txtQR

    const pathCreds = path.join(pathblackJadiBot, "creds.json")
    if (!fs.existsSync(pathblackJadiBot)){
        fs.mkdirSync(pathblackJadiBot, { recursive: true })
    }

    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        const drmer = Buffer.from(drm1 + drm2, `base64`)
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = new NodeCache()
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathblackJadiBot)

        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
            msgRetry,
            msgRetryCache,
            browser: isCodeMethod ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Makima (Sub Bot)', 'Chrome','2.0.0'],
            version: version,
            generateHighQualityLinkPreview: true
        };

        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        let isInit = true

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            if (isNewLogin) sock.isInit = false
            if (qr && !isCodeMethod) {
                if (m?.chat) {
                    txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
                } else {
                    return 
                }
                if (txtQR && txtQR.key) {
                    setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
                }
                return
            } 
            if (qr && isCodeMethod) {
                let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
                secret = secret.match(/.{1,4}/g)?.join("-")
                txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
                codeBot = await m.reply(secret)
                console.log(secret)
            }
            if (txtCode && txtCode.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
            }

            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            if (connection === 'close') {
                if (reason === 428) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathblackJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    await creloadHandler(true).catch(console.error)
                }
                if (reason === 408) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathblackJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    await creloadHandler(true).catch(console.error)
                }
                if (reason === 440) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathblackJadiBot)}) fue reemplazada por otra sesión activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    try {
                        if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*' }, { quoted: m || null }) : ""
                    } catch (error) {
                        console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathblackJadiBot)}`))
                    }
                }
                if (reason == 405 || reason == 401) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión (+${path.basename(pathblackJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    try {
                        if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, {text : '*SESIÓN PENDIENTE*\n\n> *INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }) : ""
                    } catch (error) {
                        console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathblackJadiBot)}`))
                    }
                    fs.rmdirSync(pathblackJadiBot, { recursive: true })
                }
                if (reason === 500) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida en la sesión (+${path.basename(pathblackJadiBot)}). Borrando datos...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, {text : '*CONEXIÓN PÉRDIDA*\n\n> *INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }) : ""
                    return creloadHandler(true).catch(console.error)
                }
                if (reason === 515) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Reinicio automático para la sesión (+${path.basename(pathblackJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    await creloadHandler(true).catch(console.error)
                }
                if (reason === 403) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathblackJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    fs.rmdirSync(pathblackJadiBot, { recursive: true })
                }
            }

            if (global.db.data == null) loadDatabase()
            if (connection == `open`) {
                if (!global.db.data?.users) loadDatabase()

                const premiumPath = path.join(pathblackJadiBot, 'premium.json');
                const premiumConfig = { premiumBot: isPremiumFromToken };
                fs.writeFileSync(premiumPath, JSON.stringify(premiumConfig, null, 2));

                let userName, userJid 
                userName = sock.authState.creds.me.name || 'Anónimo'
                userJid = sock.authState.creds.me.jid || `${path.basename(pathblackJadiBot)}@s.whatsapp.net`
                console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathblackJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
                sock.isInit = true
                global.conns.push(sock)

                m?.chat ? await conn.sendMessage(m.chat, {text: `@${m.sender.split('@')[0]}, La conexión fue establecida con éxito...`, mentions: [m.sender]}, { quoted: m }) : ''

            }
        }

        setInterval(async () => {
            if (!sock.user) {
                try { sock.ws.close() } catch (e) {      
                }
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)                
                if (i < 0) return
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }, 60000)

        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler

            } catch (e) {
                console.error('⚠️ Nuevo error: ', e)
            }
            if (restatConn) {
                const oldChats = sock.chats
                try { sock.ws.close() } catch { }
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                isInit = true
            }
            if (!isInit) {
                sock.ev.off("messages.upsert", sock.handler)
                sock.ev.off("connection.update", sock.connectionUpdate)
                sock.ev.off('creds.update', sock.credsUpdate)
            }

            sock.handler = handler.handler.bind(sock)
            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock, true)
            sock.ev.on("messages.upsert", sock.handler)
            sock.ev.on("connection.update", sock.connectionUpdate)
            sock.ev.on("creds.update", sock.credsUpdate)
            isInit = false
            return true
        }
        creloadHandler(false)
    })
}