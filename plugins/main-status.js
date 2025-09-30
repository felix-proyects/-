import ws from 'ws'

let handler = async (m, { conn, usedPrefix }) => {
  let _muptime;
  let totalreg = Object.keys(global.db.data.users).length;
  let totalchats = Object.keys(global.db.data.chats).length;
  let vs = global.vs || '1.0.0';

  // Tiempo de actividad
  if (process.send) {
    process.send('uptime');
    _muptime = await new Promise(resolve => {
      process.once('message', resolve);
      setTimeout(resolve, 1000);
    }) * 1000;
  }

  let muptime = clockString(_muptime || 0);

  // SubBots activos
  let users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws?.socket?.readyState !== ws.CLOSED)])];
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
  const totalUsers = users.length;

  // Velocidad
  let old = performance.now();
  let neww = performance.now();
  let speed = neww - old;

  // Mensaje principal
  let makimabot = `
「✦」𝖤𝗌𝗍𝖺𝖽𝗈 𝖽𝖾 𝗗𝗲𝘆𝗺𝗼𝗼𝗻 𝗖𝗹𝘂𝗯 [MAIN m1-a06]

❒ RAM [MAIN]: *1505.28 MB*
❒ CPU (×12): *1726.1773.22*
✿ Bots Activos: *${totalUsers || '0'}*
❒ Usuarios Registrados: ${totalreg}
❒ Grupos Registrados: *${groupsIn.length}*
✐ Versión *${vs}*

◤ Hosts:
  ✦ *[Deymoon Club]* » 60 Sessiones
> 1,9,2,9,3,9,4,9,5
> 1,9,2,9,3,9,4,9,5
> ${muptime}
  ✦ *[Deymoon Bot]* » 12 Sessiones
> 1,9,2,9,0,9,4,9,1
> 7,5,2,9,3,9,4,2,5
> ${muptime}
  ✦ *[Deymoon ×21]* » 23 Sessiones
> 1,11,2,9,389,4,9,5
> 1,9,66,9,3,9,4,89,5
> ${muptime}
  ✦ *[Mitsuri]* » 0 Sessiones
> 1,9,2,9,3,9,4,9,5
> 1,9,2,9,3,9,4,9,5
> ${muptime}
  ✦ *[Makima +2]* » 176 Sessiones
> 12,9,2,39,3,9,94,9,5
> 90,19,2,9,83,9,33,9,22
> ${muptime}
`.trim();

  await conn.sendMessage(m.chat, { text: makimabot }, { quoted: m });
};

handler.help = ['status'];
handler.tags = ['info'];
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats'];
handler.register = true;

export default handler;

// Función para convertir milisegundos a hh:mm:ss
function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}