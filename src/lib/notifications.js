// src/lib/notifications.js
/**
 * Sistema de notificaciones para nuevos negocios pendientes
 * Puedes llamar a estas funciones desde el formulario de publicar-negocio
 * o configurar Cloud Functions en Firebase para notificaciones automáticas
 */

/**
 * Obtiene el conteo de negocios pendientes
 */
export async function getPendientesCount(db) {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(collection(db, 'negocios'), where('estado', '==', 'pendiente'));
    const snapshot = await getDocs(q);
    return snapshot.size;
}

/**
 * Envía notificación por WhatsApp a los admins
 * Nota: Necesitas configurar una API de WhatsApp Business o usar wa.me links
 */
export function notificarAdminsPorWhatsApp(negocio, adminWhatsApps = ['3512163557', '3513552843']) {
    const mensaje = `🔔 *Nuevo negocio pendiente*\n\nNombre: ${negocio.nombre}\nRubro: ${negocio.rubro}\nWhatsApp: ${negocio.whatsapp}\n\nRevísalo en: ${window.location.origin}/admin`;

    // Abre WhatsApp para cada admin (el primer admin recibirá el mensaje)
    const url = `https://wa.me/${adminWhatsApps[0]}?text=${encodeURIComponent(mensaje)}`;
    console.log('Notificación WhatsApp generada:', url);
    // Puedes usar window.open(url, '_blank') para abrir automáticamente

    return mensaje;
}

/**
 * Muestra notificación en el navegador (Web Push)
 * Requiere permiso del usuario
 */
export async function mostrarNotificacionNavegador(titulo, opciones) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(titulo, opciones);
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification(titulo, opciones);
        }
    }
}

/**
 * Hook para mostrar notificación cuando hay nuevos pendientes
 * Úsalo en el panel admin
 */
export function useNuevosPendientes(db, ultimoConteo) {
    const [hayNuevos, setHayNuevos] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            const conteoActual = await getPendientesCount(db);
            if (conteoActual > ultimoConteo) {
                setHayNuevos(true);
                mostrarNotificacionNavegador('Nuevo negocio pendiente', {
                    body: 'Hay negocios esperando tu aprobación',
                    icon: '/logo.png'
                });
            }
        }, 60000); // Check cada minuto

        return () => clearInterval(interval);
    }, [db, ultimoConteo]);

    return hayNuevos;
}

/**
 * Función simple para enviar email a admins
 * Nota: Necesitas configurar un servicio de email (SendGrid, Resend, etc.)
 * o usar Firebase Cloud Functions con Nodemailer
 */
export async function enviarEmailAdmin(negocio) {
    // Ejemplo usando fetch a una Cloud Function o API endpoint
    try {
        await fetch('/api/notify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'nuevo_negocio',
                negocio: negocio
            })
        });
    } catch (error) {
        console.error('Error enviando email:', error);
    }
}
