import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Track an event directly to Firebase Firestore
 * @param {string} type - Event type (e.g., 'whatsapp_click', 'page_view', 'favorito')
 * @param {Object} data - Additional event data
 */
export const trackToFirebase = async (type, data = {}) => {
    try {
        await addDoc(collection(db, 'analytics_events'), {
            type,
            ...data,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            url: typeof window !== 'undefined' ? window.location.pathname : ''
        });
    } catch (error) {
        // Silently fail - don't break UX for analytics
        console.warn('Firebase tracking error:', error);
    }
};
