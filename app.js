const API_BOT = 'http://toby.hidencloud.com:25191/api/servidores-bot';
const INVITE_LINK = 'https://discord.com/oauth2/authorize?client_id=1488409630978736158&permissions=8&integration_type=0&scope=bot+applications.commands';

async function init() {
    // 1. Obtener Token de la URL
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Pedir datos del usuario
        const userData = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json());

        document.getElementById('user-profile').innerHTML = `
            <img src="https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png" style="width:32px; border-radius:50%">
            <span>${userData.username}</span>
        `;

        // 3. Pedir servidores del usuario y del bot (en paralelo)
        const [userGuilds, botData] = await Promise.all([
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
            fetch(API_BOT).then(res => res.json()).catch(() => ({ botGuilds: [] }))
        ]);

        const botGuildsIds = botData.botGuilds;
        const divCon = document.getElementById('servers-con-bot');
        const divSin = document.getElementById('servers-sin-bot');

        divCon.innerHTML = ''; 
        divSin.innerHTML = '';

        userGuilds.forEach(guild => {
            // Permiso 0x8 es ADMINISTRADOR
            const isAdmin = (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8);

            if (isAdmin) {
                const icon = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
                const card = `
                    <div class="server-card">
                        <img src="${icon}" class="server-icon">
                        <div class="server-name">${guild.name}</div>
                        ${botGuildsIds.includes(guild.id) 
                            ? `<a href="config.html?id=${guild.id}" class="btn-action">Configurar</a>` 
                            : `<a href="${INVITE_LINK}" target="_blank" class="btn-action btn-invite">Invitar</a>`}
                    </div>
                `;

                if (botGuildsIds.includes(guild.id)) divCon.innerHTML += card;
                else divSin.innerHTML += card;
            }
        });

        if (!divCon.innerHTML) divCon.innerHTML = '<p style="color:gray">No hay servidores configurados.</p>';

    } catch (err) {
        console.error("Error cargando dashboard:", err);
        alert("Error de conexión con el bot.");
    }
}

init();
