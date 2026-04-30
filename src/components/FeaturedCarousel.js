'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Eye } from 'lucide-react';

export default function FeaturedCarousel({ offers, onSelect, onWhatsApp, revelados = {}, toggleRevelado }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!offers || offers.length <= 1 || isPaused) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % offers.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [offers?.length, isPaused]);

    if (!offers || offers.length === 0) return null;

    const oferta = offers[currentIndex];

    // URL de respaldo industrial
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80";
    
    // Calcular descuento si no viene pre-calculado
    const calcularDescuento = (orig, promo) => {
        if (!orig || !promo) return 0;
        return Math.round(((orig - promo) / orig) * 100);
    };
    const descuento = calcularDescuento(oferta.precioOriginal, oferta.precioOferta);

    return (
        <div 
            style={{ marginBottom: '24px', position: 'relative' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                key={oferta.id}
                style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', 
                    cursor: 'pointer',
                    animation: 'fadeIn 0.7s ease-out',
                    border: '1px solid rgba(0,0,0,0.05)',
                    position: 'relative'
                }}
            >
                {/* Badge flotante de Destacado */}
                <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    left: '12px', 
                    zIndex: 10,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #fef3c7'
                }}>
                    <span style={{ fontSize: '14px' }}>✨</span>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destacado</span>
                </div>

                <div 
                    onClick={() => onSelect(oferta)} 
                    style={{ 
                        position: 'relative', 
                        paddingTop: '60%', 
                        backgroundColor: '#f8fafc', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <img 
                        src={oferta.imagen || oferta.imagenUrl || '/images/logo-yofre.png'} 
                        alt={oferta.titulo} 
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            padding: '12px'
                        }} 
                        onError={(e) => e.target.src = '/images/logo-yofre.png'} 
                    />
                    
                    {/* Progress Bar */}
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '4px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                        <div style={{ 
                            height: '100%', 
                            backgroundColor: '#0284C7', 
                            width: `${((currentIndex + 1) / offers.length) * 100}%`,
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {oferta.negocioNombre}
                        </p>
                    </div>
                    
                    <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '16px', color: '#111827', lineHeight: '1.2' }}>
                        {oferta.titulo}
                    </h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', minHeight: '44px' }}>
                        {oferta.revelarPrecioClick && !revelados[oferta.id] ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleRevelado(e, oferta.id); }} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    backgroundColor: '#f0fdf4', 
                                    color: '#15803d', 
                                    padding: '12px 24px', 
                                    borderRadius: '50px', 
                                    border: '1px solid #bcf0da', 
                                    fontSize: '14px', 
                                    fontWeight: '800', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="active:scale-95"
                            >
                                <Eye size={18} /> Ver Precio Especial
                            </button>
                        ) : (
                            <>
                                <span style={{ fontSize: '32px', fontWeight: '900', color: '#22c55e' }}>
                                    ${oferta.precioOferta?.toLocaleString()}
                                </span>
                                {oferta.precioOriginal && (
                                    <span style={{ fontSize: '20px', color: '#9ca3af', textDecoration: 'line-through', fontWeight: '600' }}>
                                        ${oferta.precioOriginal.toLocaleString()}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onWhatsApp(oferta.whatsapp, oferta.titulo, oferta.negocioNombre, oferta.negocioId); }} 
                        style={{ 
                            width: '100%', 
                            padding: '16px 24px', 
                            backgroundColor: '#25D366', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '50px', 
                            fontSize: '16px', 
                            fontWeight: '900', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.25)',
                            transition: 'all 0.2s'
                        }}
                        className="active:scale-95"
                    >
                        <MessageCircle size={22} fill="white" />
                        Aprovechar Ahora
                    </button>
                </div>
            </div>

            {/* Dots Indicadores */}
            {offers.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    {offers.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            style={{
                                width: i === currentIndex ? '32px' : '10px',
                                height: '10px',
                                borderRadius: '5px',
                                backgroundColor: i === currentIndex ? '#0284C7' : '#d1d5db',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                padding: 0
                            }}
                            aria-label={`Ir a oferta ${i + 1}`}
                        />
                    ))}
                </div>
            )}
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
