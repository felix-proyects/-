import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';
import fs from 'fs';
import { join } from 'path';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false;
    try {
        let nombreBot = 'Escanor'; 
        const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '');
        const configPath = join('./JadiBots', botActual || '', 'config.json');

        if (botActual && fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                if (config.name) {
                    nombreBot = config.name;
                }
            } catch (e) {
                console.error('Error al leer la configuración del sub-bot:', e);
            }
        }

        const usuario = m.pushName || 'Desconocido';

        const authorDinamico = `⊹ 🐬 Deymoon🧠 Club\n↳ Deymoon.club/\n\n👹 Info:\n deymoon-club.vercel.app/\n⊹ 👑Bot:\n⊹ ↳ @${nombreBot}\n\n👑 Usuario:\n⊹ ↳ @${usuario}`;

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || '';

        if (/webp|image|video/g.test(mime)) {
            if (/video/g.test(mime) && (q.msg || q).seconds > 8) {
                return m.reply(`✿ *¡El video no puede durar más de 8 segundos!*`);
            }

            let img = await q.download();
            if (!img) {
                return m.reply(`✿ *_No se pudo descargar el archivo. Por favor, intenta de nuevo._*`);
            }

            try {
                stiker = await sticker(img, false, global.packname, authorDinamico);
            } catch (e) {
                console.error(e);
                let out;
                if (/webp/g.test(mime)) out = await webp2png(img);
                else if (/image/g.test(mime)) out = await uploadImage(img);
                else if (/video/g.test(mime)) out = await uploadFile(img);

                if (typeof out !== 'string') {
                    out = await uploadImage(img);
                }
                stiker = await sticker(false, out, global.packname, authorDinamico);
            }

        } else if (args[0]) {
            if (isUrl(args[0])) {
                stiker = await sticker(false, args[0], global.packname, authorDinamico);
            } else {
                return m.reply(`✿ La URL proporcionada no es válida.`);
            }

        } else {
            return m.reply(`✿ Responde a una imagen, video, GIF o sticker con el comando *${usedPrefix + command}*`);
        }
    } catch (e) {
        console.error(e);
        stiker = `*Ocurrió un error al intentar crear el sticker. Por favor, inténtalo de nuevo.*`;
    } finally {
        if (stiker) {
            conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
        } else {
            conn.reply(m.chat, '✿ *_Debes responder a un Video, Foto o Gif, para generar su sticker._*', m, fake);
        }
    }
};

handler.help = ['stiker <img>', 'sticker <url>'];
handler.tags = ['sticker'];
handler.command = ['s', 'sticker', 'stiker'];
handler.group = false;
handler.register = true;

export default handler;

const isUrl = (text) => {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/gi;
    return urlRegex.test(text);
};