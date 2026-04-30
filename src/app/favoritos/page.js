'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, MapPin, MessageCircle, Menu, Trash2, X } from 'lucide-react';

// Datos de ejemplo para demostración
const DEMO_FAVORITES = [
    {
        id: 'demo-1',
        nombre: 'Bicicletería don Ramon',
        rubro: 'SERVICIOS',
        imagen: '/images/yellow-door.jpg', // Imagen de ejemplo
        direccion: 'Alsina 258, Bº Yofre',
        whatsapp: '5493515555555'
    },
    {
        id: 'demo-2',
        nombre: 'Pizzería Don Pablo',
        rubro: 'GASTRONOMÍA',
        imagen: '/images/restaurant.jpg', // Imagen de ejemplo
        direccion: 'Av. Capdevila 1234',
        whatsapp: '5493515555556'
    }
];

export default function FavoritosPage() {
    const { favorites, isLoading, removeFavorite, clearFavorites, count } = useFavorites();
    const router = useRouter();

    // TEMPORAL: Usar siempre datos de ejemplo para visualizar el diseño
    // const displayFavorites = DEMO_FAVORITES;
    const displayFavorites = favorites;
    const displayCount = favorites.length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando favoritos...</p>
                </div>
            </div>
        );
    }

    const handleWhatsApp = (whatsapp, nombre) => {
        const message = encodeURIComponent(`Hola! Vi ${nombre} en Yofre al Toque y quería hacerte una consulta.`);
        window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FFFBF5] pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 mb-1">❤️ Mis Favoritos</h1>
                            <p className="text-gray-600 font-medium">
                                {displayCount === 0 ? 'No tenés favoritos guardados' : `${displayCount} ${displayCount === 1 ? 'negocio guardado' : 'negocios guardados'}`}
                            </p>
                        </div>
                        {displayCount > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm('¿Seguro que querés eliminar todos los favoritos?')) {
                                        clearFavorites();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">Limpiar todo</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {displayCount === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6">💔</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Aún no tenés favoritos
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Empezá a guardar tus negocios favoritos tocando el corazón ❤️ en cualquier comercio
                        </p>
                        <button
                            onClick={() => router.push('/negocios')}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-bold transition-colors"
                        >
                            Explorar Negocios
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {displayFavorites.map((negocio) => (
                                <div
                                    key={negocio.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                    style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                >
                                    {/* SECCIÓN SUPERIOR: Imagen e Información */}
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        {/* Imagen (Thumbnail) */}
                                        <div style={{ position: 'relative', flexShrink: 0, marginTop: '12px' }}>
                                            {negocio.imagen ? (
                                                <div
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        backgroundImage: `url(${negocio.imagen})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        borderRadius: '12px',
                                                        border: '1px solid #f3f4f6'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#fff7ed', // orange-50
                                                    borderRadius: '12px',
                                                    border: '1px solid #ffedd5' // orange-100
                                                }}>
                                                    <span style={{ fontSize: '30px' }}>🏪</span>
                                                </div>
                                            )}
                                            {/* Badge de Corazón */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '-6px',
                                                left: '-6px',
                                                backgroundColor: 'white',
                                                borderRadius: '50%',
                                                padding: '6px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Heart size={14} fill="#EF4444" stroke="#EF4444" />
                                            </div>
                                        </div>

                                        {/* Información del Negocio */}
                                        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                                            <div style={{ paddingRight: '30px' }}>
                                                <h3 className="font-bold text-gray-900" style={{ fontSize: '18px', lineHeight: '1.3', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {negocio.nombre}
                                                </h3>
                                                <Link
                                                    href={`/negocios?rubro=${negocio.rubro || ''}`}
                                                    className="inline-block bg-yellow-300 hover:bg-yellow-400 text-gray-900 rounded px-2 py-0.5 transition-colors"
                                                    style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', textDecoration: 'none' }}
                                                >
                                                    {negocio.rubro}
                                                </Link>
                                                {negocio.direccion && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
                                                        <MapPin size={14} style={{ flexShrink: 0 }} />
                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{negocio.direccion}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botón Eliminar */}
                                            <button
                                                onClick={() => removeFavorite(negocio.id)}
                                                style={{ position: 'absolute', top: 0, right: 0, color: '#9ca3af', padding: '4px' }}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* SECCIÓN INFERIOR: Botones de Acción */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <button
                                            onClick={() => router.push(`/negocio/${negocio.id}`)}
                                            className="hover:bg-gray-50 transition-colors"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '12px 16px',
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                color: '#374151',
                                                fontSize: '14px',
                                                fontWeight: '700'
                                            }}
                                        >
                                            Ver Detalles
                                        </button>

                                        {negocio.whatsapp ? (
                                            <button
                                                onClick={() => handleWhatsApp(negocio.whatsapp, negocio.nombre)}
                                                className="hover:brightness-95 transition-all active:scale-[0.98]"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px 16px',
                                                    backgroundColor: '#25D366', // WhatsApp green
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    border: 'none',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <MessageCircle size={18} strokeWidth={2.5} />
                                                Contactar
                                            </button>
                                        ) : (
                                            <div />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tip Banner */}
                        <div style={{ marginTop: '24px', backgroundColor: '#FFF4E6', border: '1px solid #ffedd5', borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '20px', flexShrink: 0 }}>💡</div>
                            <p style={{ fontSize: '14px', color: '#7c2d12', fontWeight: '500', lineHeight: '1.5', margin: 0 }}>
                                <span style={{ fontWeight: '800' }}>Tip:</span> Puedes organizar tus favoritos arrastrándolos o eliminarlos rápidamente deslizando hacia la izquierda.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
