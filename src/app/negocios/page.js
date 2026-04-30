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
        'gastronomia': 'Gastronomía',
        'servicios': 'Servicios',
        'ropa-calzado': 'Ropa / Calzado',
        'salud-belleza': 'Salud / Belleza / Bienestar',
        'hogar-automotor': 'Hogar y Automotor',
        'comercios': 'Negocios del Barrio'
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
                    style={{ width: '100%', padding: '12px 20px', fontSize: '16px', borderRadius: '50px', border: '1px solid #ddd', outline: 'none' }}
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
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                background: busqueda === sub ? '#0070f3' : 'white',
                                color: busqueda === sub ? 'white' : '#666',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
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
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                overflow: 'hidden', // Importante para que la imagen no se salga
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                backgroundColor: 'white',
                                transition: 'transform 0.2s',
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
                                    <h2 style={{ marginTop: 0, color: '#0070f3', fontSize: '1.2rem', marginBottom: '5px' }}>{negocio.nombre}</h2>
                                    <span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
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