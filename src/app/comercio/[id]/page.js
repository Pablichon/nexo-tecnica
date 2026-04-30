'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, Heart } from 'lucide-react';
import styles from './page.module.css';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

import { trackEvent } from '@/lib/analytics';

export default function ComercioPage({ params }) {
    const [id, setId] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    // Unwrap params
    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    // Cargar negocio
    useEffect(() => {
        if (!id) return;

        const fetchBusiness = async () => {
            try {
                const docRef = doc(db, 'negocios', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setBusiness({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching business:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusiness();
    }, [id]);

    // Verificar si está en favoritos
    useEffect(() => {
        if (!business) return;

        try {
            const stored = localStorage.getItem('yofre_favoritos');
            if (stored) {
                const favoritos = JSON.parse(stored);
                setIsFavorite(favoritos.some(fav => fav.id === business.id));
            }
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    }, [business]);

    const handleWhatsAppClick = () => {
        if (!business) return;

        trackEvent('Click WhatsApp', {
            comercio: business.nombre
        });

        const message = encodeURIComponent('Hola! Vi tu local en Yofre al Toque y quería hacerte una consulta.');
        window.open(`https://wa.me/${business.whatsapp}?text=${message}`, '_blank');
    };

    const handleToggleFavorite = () => {
        if (!business) return;

        try {
            const stored = localStorage.getItem('yofre_favoritos');
            let favoritos = stored ? JSON.parse(stored) : [];

            if (isFavorite) {
                favoritos = favoritos.filter(fav => fav.id !== business.id);
            } else {
                // Tracking
                trackEvent('Favorito Agregado', {
                    comercio: business.nombre || business.name
                });

                favoritos.push({
                    id: business.id,
                    nombre: business.nombre || business.name,
                    rubro: business.rubro || business.category,
                    imagen: business.imagen || business.logo,
                    direccion: business.direccion || business.address,
                    whatsapp: business.whatsapp,
                    fechaAgregado: new Date().toISOString()
                });
            }

            localStorage.setItem('yofre_favoritos', JSON.stringify(favoritos));
            setIsFavorite(!isFavorite);
            window.dispatchEvent(new Event('favoritesChanged'));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-white flex justify-center items-center">Cargando...</div>;
    }

    if (!business) {
        return <div className="min-h-screen bg-white flex justify-center items-center">Negocio no encontrado</div>;
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.logoContainer}>
                    {business.imagen ? (
                        <img src={business.imagen} alt={business.nombre} className={styles.logo} />
                    ) : (
                        <div className={styles.logoPlaceholder}>
                            <span className={styles.logoInitial}>
                                {business.nombre?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Botón de favorito flotante */}
                <button
                    onClick={handleToggleFavorite}
                    aria-label="Agregar a favoritos"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                >
                    <Heart
                        size={24}
                        color={isFavorite ? '#FF3B30' : '#999'}
                        fill={isFavorite ? '#FF3B30' : 'none'}
                    />
                </button>
            </div>

            {/* Info */}
            <div className={styles.infoSection}>
                <h1 style={{ color: 'red', fontSize: '2rem' }}>🚀 NUEVO CÓDIGO CARGADO 🚀</h1>
                <h1 className={styles.businessName}>{business.nombre}</h1>
                <p className={styles.category}>{business.rubro}</p>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <MapPin className={styles.detailIcon} />
                        <span>{business.direccion}</span>
                    </div>

                    {business.hours && (
                        <div className={styles.detailItem}>
                            <Clock className={styles.detailIcon} />
                            <span>{business.hours}</span>
                        </div>
                    )}
                </div>

                {business.descripcion && <p className={styles.description}>{business.descripcion}</p>}

                {/* Botones */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                        onClick={handleToggleFavorite}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: isFavorite ? '#FFF0F0' : 'white',
                            color: isFavorite ? '#FF3B30' : '#666',
                            border: `2px solid ${isFavorite ? '#FF3B30' : '#ddd'}`,
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                        <span>{isFavorite ? 'Guardado' : 'Guardar'}</span>
                    </button>

                    {business.whatsapp && (
                        <button
                            className={styles.whatsappBtn}
                            onClick={handleWhatsAppClick}
                            style={{ flex: 2 }}
                        >
                            <MessageCircle className={styles.whatsappIcon} />
                            Enviar WhatsApp
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
