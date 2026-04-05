// La IP de tu HidenCloud con el puerto
const BOT_API_URL = 'http://toby.hidencloud.com:25191/api/servidores-bot';

// El link exacto de invitación que me pasaste
const INVITE_LINK = 'https://discord.com/oauth2/authorize?client_id=1488409630978736158&permissions=8&integration_type=0&scope=bot+applications.commands';

window.onload = async () => {
    // 1. Extraemos el Token secreto de la URL que nos dio Discord
    const fragmento = new URLSearchParams(window.location.hash.slice(1));
    const token = fragmento.get('access_token');

    if (!token) {
        window.location.href = 'index.html'; // Si no hay token, lo regresamos al login
        return;
    }

    // 2. Le pedimos a Discord los datos del usuario
    const resUser = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const user = await resUser.json();
    document.getElementById('bienvenida').innerText = `Bienvenido, ${user.username}`;

    // 3. Le pedimos a Discord la lista de servidores del usuario
    const resGuilds = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const userGuilds = await resGuilds.json();

    // 4. Le preguntamos a TU BOT en qué servidores está metido
    const resBot = await fetch(BOT_API_URL);
    const dataBot = await resBot.json();
    const botGuilds = dataBot.botGuilds; // Array con las IDs de los servers del bot

    // 5. Filtramos y mostramos en pantalla
    const divConBot = document.getElementById('servers-con-bot');
    const divSinBot = document.getElementById('servers-sin-bot');

    userGuilds.forEach(guild => {
        // Checamos si el usuario tiene permisos de Administrador (Permiso 8)
        const isAdmin = (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8);
        
        if (isAdmin) {
            const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            // Creamos la cajita visual del servidor
            let cajita = `<div class="server-box">
                            <img src="${iconUrl}" alt="Logo">
                            <h3>${guild.name}</h3>`;

            if (botGuilds.includes(guild.id)) {
                // EL BOT ESTÁ: Botón para ir a configurar
                cajita += `<a href="config.html?server=${guild.id}" class="btn-config">⚙️ Configurar</a></div>`;
                divConBot.innerHTML += cajita;
            } else {
                // EL BOT NO ESTÁ: Botón con tu link de invitación
                cajita += `<a href="${INVITE_LINK}" target="_blank" class="btn-invite">➕ Invitar Bot</a></div>`;
                divSinBot.innerHTML += cajita;
            }
        }
    });

    if (divConBot.innerHTML === '') divConBot.innerHTML = '<p>No compartes servidores con el bot donde seas Admin.</p>';
    if (divSinBot.innerHTML === '') divSinBot.innerHTML = '<p>Ya invitaste al bot a todos tus servidores.</p>';
};
