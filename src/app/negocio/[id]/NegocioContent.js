'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function NegocioContent({ negocioInicial }) {
    const [negocio] = useState(negocioInicial);
    const [isFavorite, setIsFavorite] = useState(false);

    // Verificar si está en favoritos
    useEffect(() => {
        if (!negocio) return;
        try {
            const stored = localStorage.getItem('nexo_favoritos');
            if (stored) {
                const favoritos = JSON.parse(stored);
                setIsFavorite(favoritos.some(fav => fav.id === negocio.id));
            }
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    }, [negocio]);

    const handleWhatsAppClick = () => {
        if (!negocio) return;
        trackEvent('Click WhatsApp', {
            comercio: negocio.nombre
        });
    };

    const handleToggleFavorite = () => {
        if (!negocio) return;

        try {
            const stored = localStorage.getItem('nexo_favoritos');
            let favoritos = stored ? JSON.parse(stored) : [];

            if (isFavorite) {
                favoritos = favoritos.filter(fav => fav.id !== negocio.id);
            } else {
                trackEvent('Favorito Agregado', {
                    comercio: negocio.nombre
                });

                favoritos.push({
                    id: negocio.id,
                    nombre: negocio.nombre,
                    rubro: negocio.rubro,
                    imagen: negocio.imagen,
                    direccion: negocio.direccion,
                    whatsapp: negocio.whatsapp,
                    fechaAgregado: new Date().toISOString()
                });
            }

            localStorage.setItem('nexo_favoritos', JSON.stringify(favoritos));
            setIsFavorite(!isFavorite);
            window.dispatchEvent(new Event('favoritesChanged'));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (!negocio) return <div style={{ textAlign: 'center' }}>Negocio no encontrado</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>

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

            <div style={{ minHeight: '300px', maxHeight: '500px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {negocio.media && negocio.media.length > 0 ? (
                    <div style={{ width: '100%', display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: '10px', padding: '10px' }}>
                        {negocio.media.map((item, index) => (
                            <div key={index} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.type === 'video' ? (
                                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                                ) : (
                                    <img src={item.url} alt={`${negocio.nombre} ${index}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                )}
                            </div>
                        ))}
                    </div>
                ) : negocio.imagen ? (
                    <img src={negocio.imagen} alt={negocio.nombre} style={{ width: '100%', height: '300px', objectFit: 'contain' }} />
                ) : (
                    <span style={{ fontSize: '80px' }}>🏪</span>
                )}
            </div>

            <div style={{ padding: '30px', backgroundColor: '#ffffff' }}>
                <h1 style={{ color: '#0F172A', marginBottom: '10px', fontSize: '2.5rem', fontWeight: '800' }}>{negocio.nombre}</h1>
                <span style={{ backgroundColor: '#F0F9FF', color: '#0369a1', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {negocio.rubro}
                </span>

                <div style={{ marginTop: '30px', display: 'grid', gap: '20px' }}>
                    <div>
                        <h3 style={{ color: '#555', marginBottom: '5px' }}>📍 Dirección</h3>
                        <p style={{ fontSize: '18px' }}>{negocio.direccion}</p>
                    </div>
                    <div>
                        <h3 style={{ color: '#555', marginBottom: '5px' }}>📝 Sobre nosotros</h3>
                        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{negocio.descripcion || 'Sin descripción disponible.'}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button
                            onClick={handleToggleFavorite}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: isFavorite ? '#F0F9FF' : 'white',
                                color: isFavorite ? '#0284C7' : '#64748B',
                                border: `2px solid ${isFavorite ? '#0284C7' : '#e2e8f0'}`,
                                padding: '15px 20px',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                            <span>{isFavorite ? 'Guardado' : 'Guardar'}</span>
                        </button>

                        {negocio.whatsapp && (
                            <a
                                href={`https://wa.me/549${negocio.whatsapp}?text=${encodeURIComponent('Hola, te contacto desde Nexo Técnica. Vi tu perfil industrial y quería consultarte por...')}`}
                                target="_blank"
                                onClick={handleWhatsAppClick}
                                style={{
                                    flex: 2,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#0F172A',
                                    color: 'white',
                                    padding: '15px 30px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                }}
                            >
                                💬 Enviar WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
