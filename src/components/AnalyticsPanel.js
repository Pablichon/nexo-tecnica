'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

export default function AnalyticsPanel() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('mes'); // 'hoy', 'semana', 'mes'
    const [expanded, setExpanded] = useState(false);
    const [negocioNames, setNegocioNames] = useState({}); // ID → Nombre map

    const getPeriodStart = (p) => {
        const now = new Date();
        switch (p) {
            case 'hoy':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'semana':
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return weekAgo;
            case 'mes':
            default:
                return new Date(now.getFullYear(), now.getMonth(), 1);
        }
    };

    // Cargar mapa de nombres de negocios una sola vez
    useEffect(() => {
        const loadNegocioNames = async () => {
            try {
                const negociosSnap = await getDocs(collection(db, 'negocios'));
                const namesMap = {};
                negociosSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.nombre) {
                        namesMap[doc.id] = data.nombre;
                    }
                });
                setNegocioNames(namesMap);
            } catch (error) {
                console.error('Error loading negocio names:', error);
            }
        };
        loadNegocioNames();
    }, []);

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    // Función para reemplazar IDs de negocios por nombres en las URLs de páginas
    const resolvePageName = (page) => {
        // Detectar rutas tipo /negocio/[ID] o /comercio/[ID]
        const negocioMatch = page.match(/^\/(negocio|comercio)\/(.+)$/);
        if (negocioMatch) {
            const prefix = negocioMatch[1];
            const id = negocioMatch[2];
            const nombre = negocioNames[id];
            if (nombre) {
                return `/${prefix}/${nombre}`;
            }
        }
        return page;
    };

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const periodStart = getPeriodStart(period);

            // Query all analytics events in the period
            const eventsSnap = await getDocs(
                query(
                    collection(db, 'analytics_events'),
                    where('createdAt', '>=', periodStart.toISOString()),
                    orderBy('createdAt', 'desc')
                )
            );

            const events = [];
            eventsSnap.forEach(doc => {
                events.push({ id: doc.id, ...doc.data() });
            });

            // Calculate stats
            const whatsappClicksNegocios = events.filter(e => e.type === 'whatsapp_click');
            const whatsappClicksOfertas = events.filter(e => e.type === 'whatsapp_click_oferta');
            const pageViews = events.filter(e => e.type === 'page_view');
            const favoritos = events.filter(e => e.type === 'favorito');
            const busquedas = events.filter(e => e.type === 'busqueda');

            // Top negocios by WhatsApp clicks
            const negocioClicks = {};
            whatsappClicksNegocios.forEach(e => {
                const name = e.negocio || 'Sin nombre';
                negocioClicks[name] = (negocioClicks[name] || 0) + 1;
            });
            const topNegocios = Object.entries(negocioClicks)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            // Top ofertas by WhatsApp clicks
            const ofertaClicks = {};
            whatsappClicksOfertas.forEach(e => {
                const key = e.ofertaTitulo
                    ? `${e.ofertaTitulo} (${e.negocioNombre || ''})`
                    : 'Sin nombre';
                ofertaClicks[key] = (ofertaClicks[key] || 0) + 1;
            });
            const topOfertas = Object.entries(ofertaClicks)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            // Top pages visited
            const pageCounts = {};
            pageViews.forEach(e => {
                const page = e.page || e.url || 'desconocida';
                pageCounts[page] = (pageCounts[page] || 0) + 1;
            });
            const topPages = Object.entries(pageCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            setAnalyticsData({
                totalEvents: events.length,
                whatsappClicks: whatsappClicksNegocios.length,
                whatsappClicksOfertas: whatsappClicksOfertas.length,
                pageViews: pageViews.length,
                favoritos: favoritos.length,
                busquedas: busquedas.length,
                topNegocios,
                topOfertas,
                topPages,
                recentEvents: events.slice(0, 20)
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
            setAnalyticsData(null);
        } finally {
            setLoading(false);
        }
    };

    const periodLabels = {
        'hoy': 'Hoy',
        'semana': 'Últimos 7 días',
        'mes': 'Este mes'
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📊 Estadísticas
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['hoy', 'semana', 'mes'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: period === p ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
                                color: period === p ? '#764ba2' : 'white',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {periodLabels[p]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 8px'
                    }} />
                    <p style={{ opacity: 0.8 }}>Cargando estadísticas...</p>
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : !analyticsData || analyticsData.totalEvents === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', opacity: 0.8 }}>
                    <p style={{ fontSize: '40px', marginBottom: '8px' }}>📈</p>
                    <p>Todavía no hay datos para este período.</p>
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>Los eventos se registrarán automáticamente cuando los usuarios interactúen con la app.</p>
                </div>
            ) : (
                <>
                    {/* Main Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>{analyticsData.pageViews}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>👁️ Visitas</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>{analyticsData.whatsappClicks}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>📱 WA Negocios</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '32px', fontWeight: '900', margin: 0, color: '#f97316' }}>{analyticsData.whatsappClicksOfertas}</p>
                            <p style={{ fontSize: '12px', margin: 0, color: '#f97316', fontWeight: '700' }}>🔥 WA Ofertas</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>{analyticsData.favoritos}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>❤️ Favoritos</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>{analyticsData.busquedas}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>🔍 Búsquedas</p>
                        </div>
                    </div>

                    {/* Toggle Details */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {expanded ? '▲ Ocultar detalles' : '▼ Ver detalles por negocio'}
                    </button>

                    {expanded && (
                        <div style={{ marginTop: '16px' }}>
                            {/* Top Negocios by WhatsApp */}
                            {analyticsData.topNegocios.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                                        📱 Top WhatsApp por Negocio
                                    </h3>
                                    {analyticsData.topNegocios.map(([name, count], i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            marginBottom: '6px'
                                        }}>
                                            <span style={{ fontSize: '14px' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {name}
                                            </span>
                                            <span style={{
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                fontWeight: '700'
                                            }}>
                                                {count} clics
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Top Ofertas by WhatsApp */}
                            {analyticsData.topOfertas.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                                        🔥 Top Clicks en Ofertas
                                    </h3>
                                    {analyticsData.topOfertas.map(([name, count], i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            backgroundColor: 'rgba(249,115,22,0.25)',
                                            borderRadius: '8px',
                                            marginBottom: '6px',
                                            border: '1px solid rgba(249,115,22,0.4)'
                                        }}>
                                            <span style={{ fontSize: '13px', flex: 1, marginRight: '8px' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {name}
                                            </span>
                                            <span style={{
                                                backgroundColor: 'rgba(249,115,22,0.5)',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                flexShrink: 0
                                            }}>
                                                {count} clics
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Top Pages */}
                            {analyticsData.topPages.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                                        👁️ Páginas más visitadas
                                    </h3>
                                    {analyticsData.topPages.map(([page, count], i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            marginBottom: '6px'
                                        }}>
                                            <span style={{ fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {resolvePageName(page)}
                                            </span>
                                            <span style={{
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                fontWeight: '700'
                                            }}>
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
