// src/app/negocios/page.js
'use client';
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/data/categories';
import { trackEvent } from '@/lib/analytics';

function ListadoNegocios() {
    const [negocios, setNegocios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const handleSearchTracking = () => {
        if (busqueda.trim()) {
            trackEvent('Busqueda', {
                termino: busqueda
            });
        }
    };



    const searchParams = useSearchParams();
    const filtroRubro = searchParams.get('rubro');

    useEffect(() => {
        const obtenerNegocios = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "negocios"));
                const lista = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNegocios(lista);
            } catch (error) {
                console.error("Error al bajar los negocios:", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerNegocios();
    }, []);

    const rubroMap = {
        'mecanizado': 'Mecanizado y CNC',
        'mantenimiento': 'Mantenimiento Industrial',
        'automatizacion': 'Automatización y Control',
        'suministros': 'Suministros Industriales',
        'servicios-tecnicos': 'Ingeniería y Consultoría'
    };

    const rubroNombre = rubroMap[filtroRubro] || filtroRubro;

    const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "") : "";

    const negociosA_Mostrar = negocios.filter(negocio => {
        let term = rubroNombre;
        // Compatibilidad nombres especiales
        if (rubroNombre === 'Salud / Belleza / Bienestar') term = 'salud';
        if (rubroNombre === 'Ropa / Calzado') term = 'ropa';
        // 'Negocios del Barrio' debe matchear datos viejos guardados como 'Comercios'
        if (rubroNombre === 'Negocios del Barrio') term = 'negocios del barrio';
        
        const rubroNegocio = normalize(negocio.rubro);
        const termNormalizado = normalize(term);
        const busquedaNormalizada = normalize(busqueda);

        const cumpleRubro = !rubroNombre || 
            rubroNegocio.includes(termNormalizado) || 
            (rubroNombre === 'Negocios del Barrio' && rubroNegocio.includes('comercios'));

        const cumpleBusqueda = !busqueda ||
            normalize(negocio.nombre).includes(busquedaNormalizada) ||
            rubroNegocio.includes(busquedaNormalizada);

        return cumpleRubro && cumpleBusqueda;
    });

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                {rubroNombre ? `Viendo: ${rubroNombre}` : '🏪 Todos los Negocios'}
            </h1>

            <div style={{ marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar negocio, rubro..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearchTracking();
                        }
                    }}
                    style={{ width: '100%', padding: '12px 20px', fontSize: '16px', borderRadius: '4px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
            </div>

            {/* FILTROS DE SUB-CATEGORÍAS DINÁMICOS */}
            {filtroRubro && categories.find(c => c.id === filtroRubro) && (
                <div style={{
                    display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px', justifyContent: 'center', flexWrap: 'wrap'
                }}>
                    {['Todos', ...categories.find(c => c.id === filtroRubro).subcategories].map((sub) => (
                        <button
                            key={sub}
                            onClick={() => {
                                setBusqueda(sub === 'Todos' ? '' : sub);
                                trackEvent('Filtro Categoria', {
                                    categoria: sub
                                });
                            }}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                background: busqueda === sub ? '#0F172A' : 'white',
                                color: busqueda === sub ? 'white' : '#64748B',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            )}

            {cargando ? (
                <p style={{ textAlign: 'center' }}>Cargando comercios...</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                    {negociosA_Mostrar.map((negocio) => (
                        <Link key={negocio.id} href={`/negocio/${negocio.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                backgroundColor: 'white',
                                transition: 'all 0.2s',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* ZONA DE IMAGEN 👇 */}
                                <div style={{ height: '150px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {negocio.imagen ? (
                                        <img src={negocio.imagen} alt={negocio.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: '40px' }}>🏪</span> // Icono por defecto si no hay foto
                                    )}
                                </div>

                                <div style={{ padding: '20px', flex: 1 }}>
                                    <h2 style={{ marginTop: 0, color: '#0F172A', fontSize: '1.2rem', marginBottom: '8px', fontWeight: '800' }}>{negocio.nombre}</h2>
                                    <span style={{ background: '#F0F9FF', padding: '4px 8px', borderRadius: '2px', fontSize: '11px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {negocio.rubro}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ListadoNegocios />
        </Suspense>
    );
}