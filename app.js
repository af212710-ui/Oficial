/**
 * 🧠 VEX DASHBOARD - LOGIC CORE
 * Configuración para Netlify + HidenCloud
 */

// ==========================================
// 🔴 CONFIGURACIÓN (CAMBIA LA IP AQUÍ)
// ==========================================
const IP_HIDENCLOUD = 'toby.hidencloud.com'; // Pon la IP numérica de tu server de HidenCloud
const PUERTO_BOT = '25191';
const BOT_API_URL = `http://${IP_HIDENCLOUD}:${PUERTO_BOT}/api/servidores-bot`;
const INVITE_LINK = 'https://discord.com/oauth2/authorize?client_id=1488409630978736158&permissions=8&integration_type=0&scope=bot+applications.commands';

async function inicializarDashboard() {
    // 1. EXTRAER TOKEN (De la URL o del almacenamiento local)
    const fragmento = new URLSearchParams(window.location.hash.slice(1));
    let token = fragmento.get('access_token');

    if (token) {
        // Si venimos de Discord, guardamos el token y limpiamos la URL para que se vea pro
        localStorage.setItem('discord_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        // Si ya estábamos logueados, lo sacamos del almacenamiento
        token = localStorage.getItem('discord_token');
    }

    // Si no hay token en ningún lado, regresamos al login
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. OBTENER DATOS DEL USUARIO (Nombre, Avatar)
        const resUser = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resUser.status === 401) {
            // Token expirado
            localStorage.removeItem('discord_token');
            window.location.href = 'index.html';
            return;
        }

        const userData = await resUser.json();
        document.getElementById('user-profile').innerHTML = `
            <img src="https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png" class="user-avatar">
            <span>${userData.username}</span>
        `;

        // 3. OBTENER SERVIDORES (Del Usuario y del Bot en paralelo)
        const [resGuilds, resBot] = await Promise.all([
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(BOT_API_URL).catch(() => null) // Si el bot está apagado, devolvemos null
        ]);

        const userGuilds = await resGuilds.json();
        let botGuildsIds = [];

        if (resBot && resBot.ok) {
            const dataBot = await resBot.json();
            botGuildsIds = dataBot.botGuilds;
        } else {
            console.warn("⚠️ No se pudo conectar con la API del Bot en HidenCloud.");
        }

        // 4. FILTRAR Y RENDERIZAR SERVIDORES
        const divCon = document.getElementById('servers-con-bot');
        const divSin = document.getElementById('servers-sin-bot');

        divCon.innerHTML = '';
        divSin.innerHTML = '';

        userGuilds.forEach(guild => {
            // VERIFICACIÓN DE ADMINISTRADOR (Bitwise 0x8)
            const isAdmin = (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8);

            if (isAdmin) {
                // Generar URL del Icono (Si no tiene, ponemos uno por defecto)
                const icon = guild.icon 
                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
                    : 'https://cdn.discordapp.com/embed/avatars/0.png';

                const estaElBot = botGuildsIds.includes(guild.id);

                const cardHTML = `
                    <div class="server-card">
                        <img src="${icon}" class="server-icon" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                        <div class="server-name">${guild.name}</div>
                        ${estaElBot 
                            ? `<a href="config.html?id=${guild.id}" class="btn-action">⚙️ Configurar</a>` 
                            : `<a href="${INVITE_LINK}&guild_id=${guild.id}" target="_blank" class="btn-action btn-invite">➕ Invitar Vex</a>`
                        }
                    </div>
                `;

                if (estaElBot) {
                    divCon.innerHTML += cardHTML;
                } else {
                    divSin.innerHTML += cardHTML;
                }
            }
        });

        // Mensajes por si no hay nada que mostrar
        if (divCon.innerHTML === '') divCon.innerHTML = '<p style="color:#80848e; grid-column: 1/-1; text-align:center;">Vex no está en ninguno de tus servidores administrados.</p>';
        if (divSin.innerHTML === '') divSin.innerHTML = '<p style="color:#80848e; grid-column: 1/-1; text-align:center;">Ya invitaste al bot a todos tus servidores.</p>';

    } catch (error) {
        console.error("❌ Error crítico en el Dashboard:", error);
        alert("Hubo un problema al cargar los servidores. Asegúrate de que el bot esté encendido en HidenCloud.");
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', inicializarDashboard);
