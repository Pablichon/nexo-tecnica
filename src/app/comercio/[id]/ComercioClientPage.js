'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, Heart } from 'lucide-react';
import styles from './page.module.css';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { trackEvent } from '@/lib/analytics';

export default function ComercioClientPage({ id }) {
    console.log('🚀 COMPONENTE CARGADO - ID:', id);

    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    // Cargar negocio
    useEffect(() => {
        const fetchBusiness = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'negocios', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setBusiness({ id: docSnap.id, ...docSnap.data() });
                } else {
                    if (id === '1') {
                        setBusiness({
                            id: '1',
                            name: 'Verdulería El Pepe',
                            category: 'Alimentos',
                            address: 'Yofre Norte',
                            hours: 'Lun a Sab 8:00 - 20:00',
                            description: 'Verduras y frutas frescas del día. Atención personalizada y delivery por WhatsApp.',
                            whatsapp: '3511234567',
                            logo: null,
                            publications: [
                                { id: 1, text: '🍅 Oferta: Tomate x kilo $800', date: '2024-01-08' },
                                { id: 2, text: '🥬 Lechuga criolla fresca', date: '2024-01-07' },
                            ]
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching business:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusiness();
    }, [id]);

    // Verificar si está en favoritos al cargar
    useEffect(() => {
        if (!business) return;

        try {
            const stored = localStorage.getItem('yofre_favoritos');
            if (stored) {
                const favoritos = JSON.parse(stored);
                const exists = favoritos.some(fav => fav.id === business.id);
                setIsFavorite(exists);
            }
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    }, [business]);

    const handleWhatsAppClick = () => {
        if (!business) return;

        trackEvent('Click WhatsApp', {
            comercio: business.nombre || business.name
        });

        const message = encodeURIComponent('Hola, Vi tu perfil en YOFRE AL TOQUE y quería consultarte...');
        window.open(`https://wa.me/${business.whatsapp}?text=${message}`, '_blank');
    };

    const handleToggleFavorite = () => {
        if (!business) return;

        try {
            const stored = localStorage.getItem('yofre_favoritos');
            let favoritos = stored ? JSON.parse(stored) : [];

            if (isFavorite) {
                // Quitar de favoritos
                favoritos = favoritos.filter(fav => fav.id !== business.id);
                console.log('❌ Quitando de favoritos');
            } else {
                // Tracking
                trackEvent('Favorito Agregado', {
                    comercio: business.nombre || business.name
                });

                // Agregar a favoritos
                favoritos.push({
                    id: business.id,
                    nombre: business.nombre || business.name,
                    rubro: business.rubro || business.category,
                    imagen: business.imagen || business.logo,
                    direccion: business.direccion || business.address,
                    whatsapp: business.whatsapp,
                    fechaAgregado: new Date().toISOString()
                });
                console.log('✅ Agregando a favoritos');
            }

            localStorage.setItem('yofre_favoritos', JSON.stringify(favoritos));
            setIsFavorite(!isFavorite);

            // Disparar evento para actualizar el navbar
            window.dispatchEvent(new Event('favoritesChanged'));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (loading) {
        console.log('⏳ Loading...');
        return <div className="min-h-screen bg-white flex justify-center items-center">Cargando...</div>;
    }

    if (!business) {
        console.log('❌ No business found');
        return <div className="min-h-screen bg-white flex justify-center items-center">Negocio no encontrado</div>;
    }

    console.log('✅ Rendering business:', business);
    console.log('❤️ isFavorite:', isFavorite);

    return (
        <div className={styles.container}>
            {/* Header con logo/foto */}
            <div className={styles.header}>
                <div className={styles.logoContainer}>
                    {business.logo || business.imagen ? (
                        <img src={business.logo || business.imagen} alt={business.name || business.nombre} className={styles.logo} />
                    ) : (
                        <div className={styles.logoPlaceholder}>
                            <span className={styles.logoInitial}>
                                {(business.name || business.nombre || '?').charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Botón de favorito flotante (pequeño, arriba a la derecha) */}
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

            {/* Información del comercio */}
            <div className={styles.infoSection}>
                <h1 className={styles.businessName}>{business.name || business.nombre}</h1>
                <p className={styles.category}>{business.category || business.rubro}</p>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <MapPin className={styles.detailIcon} />
                        <span>{business.address || business.direccion}</span>
                    </div>

                    <div className={styles.detailItem}>
                        <Clock className={styles.detailIcon} />
                        <span>{business.hours || 'Horario a confirmar'}</span>
                    </div>
                </div>

                <p className={styles.description}>{business.description || business.descripcion}</p>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    {/* Botón de Favorito grande y visible */}
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
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Heart
                            size={20}
                            fill={isFavorite ? 'currentColor' : 'none'}
                        />
                        <span>{isFavorite ? 'En Favoritos' : 'Guardar'}</span>
                    </button>

                    {/* Botón WhatsApp */}
                    <button
                        className={styles.whatsappBtn}
                        onClick={handleWhatsAppClick}
                        style={{ flex: 2 }}
                    >
                        <MessageCircle className={styles.whatsappIcon} />
                        Contactar por WhatsApp
                    </button>
                </div>
            </div>

            {/* Publicaciones del comercio */}
            <div className={styles.publicationsSection}>
                <h2 className={styles.publicationsTitle}>Publicaciones</h2>

                {business.publications && business.publications.length > 0 ? (
                    <div className={styles.publicationsList}>
                        {business.publications.map((pub) => (
                            <div key={pub.id} className={styles.publicationCard}>
                                <p className={styles.publicationText}>{pub.text}</p>
                                <span className={styles.publicationDate}>
                                    {new Date(pub.date).toLocaleDateString('es-AR')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noPublications}>
                        Este comercio aún no tiene publicaciones
                    </p>
                )}
            </div>
        </div>
    );
}
