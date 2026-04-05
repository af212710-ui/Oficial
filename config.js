// La IP de tu bot para guardar cosas
const BOT_API_URL = 'http://toby.hidencloud.com:25191/api';

window.onload = async () => {
    // 1. Obtener la ID del servidor desde la URL (ej. config.html?id=123456)
    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('id');

    if (!serverId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // 2. Extraer el token de Discord de localStorage (tenemos que guardarlo en app.js primero)
    const token = localStorage.getItem('discord_token');
    
    try {
        // Obtenemos información básica del servidor desde Discord para poner el nombre y logo
        const resGuilds = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const guilds = await resGuilds.json();
        const currentGuild = guilds.find(g => g.id === serverId);

        if (currentGuild) {
            document.getElementById('server-name').innerText = currentGuild.name;
            if (currentGuild.icon) {
                document.getElementById('server-icon').src = `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png`;
            }
        }
        
        // TODO: Aquí luego haremos un fetch(BOT_API_URL + '/get-canales') para llenar la lista de canales
        
    } catch (err) {
        console.error(err);
    }

    // Lógica para cambiar entre pestañas
    const botones = document.querySelectorAll('.nav-btn');
    const modulos = document.querySelectorAll('.module');

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quitar clase active a todos
            botones.forEach(b => b.classList.remove('active'));
            modulos.forEach(m => m.classList.remove('active'));

            // Poner clase active al clickeado
            boton.classList.add('active');
            const targetId = boton.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
};

// Función para guardar los datos (Mandará la info a tu bot)
async function guardarConfig(modulo) {
    const serverId = new URLSearchParams(window.location.search).get('id');
    const botonSave = event.target;
    botonSave.innerText = "Guardando...";
    
    let datosAGuardar = {};

    if (modulo === 'bienvenidas') {
        datosAGuardar = {
            modulo: 'bienvenidas',
            canal: document.getElementById('canal-bienvenida').value,
            mensaje: document.getElementById('mensaje-bienvenida').value
        };
    } else if (modulo === 'automod') {
        datosAGuardar = {
            modulo: 'automod',
            antiLinks: document.getElementById('anti-links').checked,
            antiInsultos: document.getElementById('anti-insultos').checked
        };
    }

    console.log("Datos listos para enviar al bot:", datosAGuardar);
    
    // Aquí mandaremos el misil a HidenCloud:
    /*
    await fetch(`${BOT_API_URL}/guardar/${serverId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAGuardar)
    });
    */

    setTimeout(() => {
        botonSave.innerText = "✅ ¡Guardado!";
        setTimeout(() => botonSave.innerText = "Guardar Cambios", 2000);
    }, 1000); // Simulamos el guardado por ahora
}
