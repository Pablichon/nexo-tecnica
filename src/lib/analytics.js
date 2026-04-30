import { track } from '@vercel/analytics';
import * as gtag from './gtag';
import { trackToFirebase } from './firebaseTracking';

/**
 * Universal tracking function that sends events to:
 * 1. Vercel Analytics
 * 2. Google Analytics 4
 * 3. Firebase Firestore (datos propios)
 * 
 * @param {string} eventName - Name of the event (e.g., 'Click WhatsApp')
 * @param {Object} properties - Additional properties for the event
 */
export const trackEvent = (eventName, properties = {}) => {
    // 1. Vercel Analytics
    try {
        track(eventName, properties);
    } catch (error) {
        console.warn('Vercel Analytics track error:', error);
    }

    // 2. Google Analytics 4
    try {
        const { comercio, rubro, ...restProps } = properties;

        gtag.event({
            action: eventName,
            category: rubro || 'general',
            label: comercio || '',
            ...restProps
        });
    } catch (error) {
        console.warn('GA4 track error:', error);
    }

    // 3. Firebase Firestore (tracking propio)
    try {
        // Mapear nombres de eventos a tipos de Firebase
        const typeMap = {
            'Click WhatsApp': 'whatsapp_click',
            'Favorito Agregado': 'favorito',
            'Busqueda': 'busqueda',
            'Filtro Categoria': 'filtro_categoria',
            'Click Instagram': 'instagram_click'
        };

        const type = typeMap[eventName] || eventName.toLowerCase().replace(/\s+/g, '_');

        trackToFirebase(type, {
            negocio: properties.comercio || properties.negocio || '',
            negocioId: properties.negocioId || '',
            rubro: properties.rubro || '',
            oferta: properties.oferta || '',
            extra: properties
        });
    } catch (error) {
        console.warn('Firebase tracking error:', error);
    }
};
