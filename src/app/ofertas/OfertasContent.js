'use client';
import { useOfertas } from '@/hooks/useOfertas';
import { ChevronLeft, X, MessageCircle, Heart, Flame, TrendingUp, MapPin, Tag, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { categories } from '@/data/categories';
import { trackEvent } from '@/lib/analytics';
import { trackToFirebase } from '@/lib/firebaseTracking';

// Modal Component
function OfferModal({ oferta, onClose, revelados, toggleRevelado }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    if (!oferta) return null;

    const imageUrl = oferta.imagen || oferta.imagenUrl || '/logo.png';

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'background-color 0.2s'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '24px 24px 0 0', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src={imageUrl}
                        alt={oferta.titulo}
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '350px',
                            objectFit: 'contain'
                        }}
                        onError={(e) => {
                            e.target.src = '/logo.png';
                        }}
                    />
                </div>

                <div style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px', color: '#111827' }}>
                        {oferta.titulo}
                    </h2>
                    <p style={{ color: '#2563eb', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                        {oferta.negocioNombre}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', minHeight: '48px' }}>
                        {oferta.revelarPrecioClick && !revelados[oferta.id] ? (
                            <button
                                onClick={(e) => toggleRevelado(e, oferta.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#f0fdf4',
                                    color: '#15803d',
                                    padding: '10px 20px',
                                    borderRadius: '24px',
                                    border: '1px solid #bcf0da',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                <Eye size={18} /> Ver Precio
                            </button>
                        ) : (
                            <>
                                <span style={{ color: '#22c55e', fontWeight: '800', fontSize: '32px' }}>
                                    ${oferta.precioOferta?.toLocaleString()}
                                </span>
                                {oferta.precioOriginal && (
                                    <span style={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: '20px' }}>
                                        ${oferta.precioOriginal.toLocaleString()}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>
                            ✨ Descripción del Beneficio
                        </h3>
                        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#6b7280' }}>
                            {oferta.descripcion || `¡Aprovechá esta increíble oferta de ${oferta.titulo}! Válido por tiempo limitado. Contactá por WhatsApp para más detalles.`}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

const DEMO_OFFERS = [
    {
        id: 'demo-1',
        titulo: 'Mantenimiento Preventivo CNC',
        negocioNombre: 'INGENIERÍA METALÚRGICA S.A.',
        imagen: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop',
        descripcion: 'Servicio completo de mantenimiento preventivo para centros de mecanizado. Incluye calibración y limpieza de guías.',
        precioOferta: 450000,
        precioOriginal: 600000,
        diasRestantes: 15,
        whatsapp: '5493515555555',
        vistas: 45,
        stock: 5
    },
    {
        id: 'demo-2',
        titulo: 'Tablero Eléctrico Industrial',
        negocioNombre: 'SOLUCIONES ELÉCTRICAS S.R.L.',
        imagen: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop',
        descripcion: 'Diseño y armado de tablero eléctrico bajo normas IEC. Incluye componentes de primera marca.',
        precioOferta: 850000,
        precioOriginal: 1100000,
        diasRestantes: 20,
        whatsapp: '5493515555555',
        vistas: 32
    },
    {
        id: 'demo-3',
        titulo: 'Corte Láser de Precisión',
        negocioNombre: 'CORTE Y PLEAGADO CÓRDOBA',
        imagen: 'https://images.unsplash.com/photo-1530124560676-4fbc912f7160?q=80&w=1000&auto=format&fit=crop',
        descripcion: 'Servicio de corte láser en chapa de hasta 12mm. Presupuesto sin cargo. Entrega en 48hs.',
        precioOferta: 15000,
        precioOriginal: 22000,
        diasRestantes: 5,
        whatsapp: '5493515555556',
        vistas: 58
    },
    {
        id: 'demo-4',
        titulo: 'Auditoría de Eficiencia Energética',
        negocioNombre: 'ENERGY SOLUTIONS',
        imagen: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000&auto=format&fit=crop',
        descripcion: 'Análisis detallado del consumo energético en planta. Informe con plan de ahorro garantizado.',
        precioOferta: 120000,
        precioOriginal: 180000,
        diasRestantes: 30,
        whatsapp: '5493515555557',
        vistas: 24
    }
];

export default function OfertasContent() {
    const searchParams = useSearchParams();
    const { ofertas: rawOfertas, loading } = useOfertas();
    const [selectedOferta, setSelectedOferta] = useState(null);
    const [revelados, setRevelados] = useState({});
    
    // Si viene por query param, lo usamos como inicial
    const initialFilter = searchParams.get('filter') || 'hoy';
    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [businessMap, setBusinessMap] = useState({});

    // Cargar rubros Y whatsapp de los negocios
    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "negocios"));
                const mapping = {};
                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    mapping[doc.id] = {
                        rubro: data.rubro || 'Varios',
                        whatsapp: data.whatsapp || data.telefono || null
                    };
                });
                setBusinessMap(mapping);
            } catch (error) {
                console.error("Error loading business data:", error);
            }
        };
        loadBusinesses();
    }, []);

    const rawOfertasList = rawOfertas.length > 0 ? rawOfertas : [];
    const baseOfertas = rawOfertasList.length > 0 ? rawOfertasList : (loading ? [] : DEMO_OFFERS);

    const calcularDescuento = (precioOriginal, precioOferta) => {
        if (!precioOriginal || !precioOferta) return 0;
        return Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100);
    };

    // Separar destacadas para el carrusel (solo en filtro 'hoy' o sin filtro)
    const canShowFeatured = (activeFilter === 'hoy' || !activeFilter) && !selectedCategory;
    const featuredItems = baseOfertas.filter(o => o.destacada);
    
    let filteredOfertas = [...baseOfertas];

    if (activeFilter === 'rubro' && selectedCategory) {
        filteredOfertas = filteredOfertas.filter(oferta => {
            const negocioData = businessMap[oferta.negocioId];
            const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "") : "";
            const rubroActual = normalize(oferta.rubro || (typeof negocioData === 'object' ? negocioData?.rubro : negocioData) || '');
            const catBuscada = normalize(selectedCategory);

            if (catBuscada.includes('ropa')) return rubroActual.includes('ropa');
            if (catBuscada.includes('salud')) return rubroActual.includes('salud');
            if (catBuscada.includes('negociosdelbarrio')) return rubroActual.includes('comercios') || rubroActual.includes('negociosdelbarrio');

            return rubroActual.includes(catBuscada);
        });
    }

    if (activeFilter === 'hoy') {
        // Ordenar: primero destacadas, luego normales
        filteredOfertas.sort((a, b) => {
            if (a.destacada && !b.destacada) return -1;
            if (!a.destacada && b.destacada) return 1;
            return 0;
        });
    } else if (activeFilter === 'descuento') {
        filteredOfertas.sort((a, b) => {
            const descA = calcularDescuento(a.precioOriginal, a.precioOferta);
            const descB = calcularDescuento(b.precioOriginal, b.precioOferta);
            return descB - descA;
        });
    } else if (activeFilter === 'rubro' && !selectedCategory) {
        // Ordenar por rubro si está en la pestaña "Por rubro" pero sin categoría seleccionada
        filteredOfertas.sort((a, b) => {
            const rubroA = (a.rubro || businessMap[a.negocioId]?.rubro || 'Varios').toLowerCase();
            const rubroB = (b.rubro || businessMap[b.negocioId]?.rubro || 'Varios').toLowerCase();
            return rubroA.localeCompare(rubroB);
        });
    }

    // Si mostramos carrusel, filtramos las destacadas de la lista principal para no duplicar (opcional)
    // En este caso, las dejamos en la lista pero como normales
    const ofertas = filteredOfertas;

    const handleWhatsApp = (phone, title, businessName, negocioId) => {
        const negocioData = businessMap[negocioId];
        const negocioWhatsapp = typeof negocioData === 'object' ? negocioData?.whatsapp : null;
        const finalPhone = phone || negocioWhatsapp;

        trackEvent('Click WhatsApp', {
            comercio: businessName || 'Desconocido',
            oferta: title
        });

        trackToFirebase('whatsapp_click_oferta', {
            ofertaTitulo: title,
            negocioNombre: businessName || 'Desconocido',
            negocioId: negocioId || '',
            whatsapp: finalPhone || 'sin_numero'
        });

        if (!finalPhone) {
            alert('No hay número de WhatsApp disponible para esta oferta.');
            return;
        }

        const message = `¡Hola! Me interesa el servicio de "${title}" que vi en NEXO TÉCNICA.`;
        window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const toggleRevelado = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setRevelados(prev => ({ ...prev, [id]: true }));
    };

    if (loading && rawOfertas.length === 0) {
        return (
            <div className="min-h-screen bg-[#F9F7F2] flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const filters = [
        { id: 'hoy', label: '🔥 Hoy', icon: Flame },
        { id: 'descuento', label: '$ ✨ Mayor descuento', icon: TrendingUp },
        { id: 'cerca', label: '📍 Cerca tuyo', icon: MapPin },
        { id: 'rubro', label: '🏷️ Por rubro', icon: Tag }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9F7F2', paddingBottom: '100px' }}>
            <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 16px', position: 'sticky', top: 0, zIndex: 40 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                            <ChevronLeft size={28} />
                        </Link>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚙️ NEXO TÉCNICA <span style={{ color: '#0284C7' }}>OFERTAS</span>
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: activeFilter === 'rubro' ? '12px' : '0' }}>
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => {
                                    setActiveFilter(filter.id);
                                    if (filter.id !== 'rubro') setSelectedCategory(null);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '24px',
                                    border: activeFilter === filter.id ? '2px solid #f97316' : '1px solid #e5e7eb',
                                    backgroundColor: activeFilter === filter.id ? '#fff7ed' : 'white',
                                    color: activeFilter === filter.id ? '#f97316' : '#6b7280',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {activeFilter === 'rubro' && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '12px',
                                        border: selectedCategory === cat.name ? '1px solid #f97316' : '1px solid #e5e7eb',
                                        backgroundColor: selectedCategory === cat.name ? '#f97316' : 'white',
                                        color: selectedCategory === cat.name ? 'white' : '#4b5563',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>{cat.emoji}</span> {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
                {/* --- SECCIÓN DESTACADOS CON CARRUSEL AUTOMÁTICO --- */}
                {canShowFeatured && featuredItems.length > 0 && (
                    <FeaturedCarousel 
                        offers={featuredItems} 
                        onSelect={setSelectedOferta}
                        onWhatsApp={handleWhatsApp}
                        revelados={revelados}
                        toggleRevelado={toggleRevelado}
                        calcularDescuento={calcularDescuento}
                    />
                )}

                {ofertas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #ccc' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌵</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151' }}>No se encontraron ofertas</h3>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>
                            {activeFilter === 'rubro' && selectedCategory
                                ? `Probá con otra categoría o volvé a "Hoy" para ver todo.`
                                : '¡Volvé más tarde! Estamos buscando las mejores ofertas para vos.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Título para el resto de ofertas si hay carrusel */}
                        {canShowFeatured && featuredItems.length > 0 && (
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '16px', marginTop: '12px' }}>
                                🛍️ Más Ofertas del Día
                            </h3>
                        )}
                        
                        {ofertas
                            // Filtramos de la lista principal las destacadas si ya están en el carrusel para no repetirlas justo debajo
                            .filter(o => !canShowFeatured || !o.destacada)
                            .map((oferta) => {
                            const descuento = calcularDescuento(oferta.precioOriginal, oferta.precioOferta);
                            
                            return (
                                <div key={oferta.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                                    <div onClick={() => setSelectedOferta(oferta)} style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={oferta.imagen || oferta.imagenUrl || '/logo.png'} alt={oferta.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.target.src = '/logo.png'} />
                                        {descuento > 0 && <div style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#0284C7', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>-{descuento}%</div>}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>{oferta.titulo}</h3>
                                            <p style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '8px' }}>{oferta.negocioNombre}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', minHeight: '28px' }}>
                                                {oferta.revelarPrecioClick && !revelados[oferta.id] ? (
                                                    <button onClick={(e) => toggleRevelado(e, oferta.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '16px', border: '1px solid #bcf0da', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}><Eye size={12} /> Ver Precio</button>
                                                ) : (
                                                    <><span style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e' }}>${oferta.precioOferta?.toLocaleString()}</span>{oferta.precioOriginal && <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>${oferta.precioOriginal.toLocaleString()}</span>}</>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleWhatsApp(oferta.whatsapp, oferta.titulo, oferta.negocioNombre, oferta.negocioId)} style={{ padding: '8px 16px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>Aprovechar oferta <span>›</span></button>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 30 }}>
                <button style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#0284C7', border: 'none', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: 'white' }}>
                    <TrendingUp size={24} />
                    <span style={{ fontSize: '9px', fontWeight: '700' }}>Ofertas</span>
                </button>
            </div>

            {selectedOferta && (
                <OfferModal
                    oferta={selectedOferta}
                    onClose={() => setSelectedOferta(null)}
                    revelados={revelados}
                    toggleRevelado={toggleRevelado}
                />
            )}
        </div>
    );
}
