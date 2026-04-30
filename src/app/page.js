'use client';

import Link from 'next/link';
import OfferCarousel from '@/components/OfferCarousel';
import CampaignBanner from '@/components/CampaignBanner';
import styles from './page.module.css';
import { categories } from '@/data/categories';
import { trackEvent } from '@/lib/analytics';
import { useOfertas } from '@/hooks/useOfertas';
import { useState, useEffect } from 'react';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { X, MessageCircle, ChevronRight } from 'lucide-react';

export default function Home() {
  const { ofertas, loading: loadingOfertas } = useOfertas();
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  const featuredOffers = ofertas.filter(o => o.destacada);

  const handleCategoryClick = (categoryName) => {
    trackEvent('Filtro Categoria', {
      categoria: categoryName
    });
  };

  const handleWhatsApp = (phone, title, businessName) => {
    trackEvent('Click WhatsApp Home', {
        comercio: businessName || 'Desconocido',
        oferta: title
    });

    const message = `Hola! Me pongo en contacto a través de Nexo Técnica. Me interesa el servicio/producto: "${title}".`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <main className={styles.mainContainer}>
      {/* 1. CABECERA */}
      <header className={styles.header}>
        <h1 style={{ display: 'none' }}>Nexo Técnica - Proveedores y Servicios Industriales</h1>
        <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
          NEXO <span style={{ color: '#0284C7' }}>TÉCNICA</span>
        </div>
        <p className={styles.subtitle}>Conectando la industria con soluciones técnicas expertas</p>
      </header>

      {/* COMPONENTE DINÁMICO DE CAMPAÑAS MENSUALES — MODO HERO (CLICK PARA VER MÁS) */}
      <CampaignBanner campaignId="actual" isHeroOnly={true} />

      {/* 2. CARRUSEL DE OFERTAS DESTACADAS (DINÁMICO) */}
      <section style={{ padding: '0 16px', marginTop: '10px' }}>
        {featuredOffers.length > 0 ? (
          <>
            <FeaturedCarousel 
              offers={featuredOffers} 
              onSelect={setSelectedOffer}
              onWhatsApp={handleWhatsApp}
            />
            <Link href="/ofertas?filter=rubro" className={styles.viewAllButton}>
              Ver todas las ofertas
              <ChevronRight size={20} />
            </Link>
          </>
        ) : (
          <div className={styles.bannerContainer}>
            <Link href="/negocios" className={styles.bannerCard} style={{ textDecoration: 'none', display: 'block' }}>
              <div className={styles.bannerOverlay}>
                <span className={styles.tag} style={{ backgroundColor: '#0284C7' }}>EXPERTOS TÉCNICOS</span>
                <h2 className={styles.bannerTitle}>Red de Proveedores</h2>
                <p className={styles.bannerText}>Encontrá la solución técnica que tu planta necesita hoy</p>
                <button className={styles.bannerButton} style={{ backgroundColor: '#0284C7' }}>Ver Rubros</button>
              </div>
              <img
                src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
                alt="Industria"
                className={styles.bannerImage}
              />
            </Link>
          </div>
        )}
      </section>

      <h2 className={styles.sectionTitle}>¿Qué estás buscando?</h2>

      {/* 3. GRILLA DE CATEGORÍAS (DINÁMICA) */}
      <div className={styles.grid}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/negocios?rubro=${cat.id}`}
            className={styles.card}
            onClick={() => handleCategoryClick(cat.name)}
          >
            <div
              className={styles.cardImage}
              style={{ backgroundImage: `url('${cat.unsplashImage}')` }}
            >
              <div className={styles.cardIcon}>{cat.emoji}</div>
            </div>
            <span className={styles.cardTitle}>{cat.name}</span>
          </Link>
        ))}
      </div>
      {selectedOffer && (
        <HomeOfferModal 
          offer={selectedOffer} 
          onClose={() => setSelectedOffer(null)} 
          onWhatsApp={() => handleWhatsApp(selectedOffer.whatsapp, selectedOffer.titulo, selectedOffer.negocioNombre)}
        />
      )}
    </main>
  );
}

// Modal simple para la Home
function HomeOfferModal({ offer, onClose, onWhatsApp }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '28px', maxWidth: '500px',
          width: '100%', maxHeight: '90vh', overflow: 'auto',
          position: 'relative', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} color="#374151" />
        </button>
        
        <div style={{ height: '300px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <img src={offer.imagen || offer.imagenUrl} alt={offer.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '20px' }} />
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{offer.negocioNombre}</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', lineHeight: '1.2', marginBottom: '16px' }}>{offer.titulo}</h2>
          <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' }}>{offer.descripcion || 'Sin descripción disponible.'}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', display: 'block', textTransform: 'uppercase' }}>Precio Especial</span>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#22c55e' }}>${offer.precioOferta?.toLocaleString()}</span>
            </div>
            <button onClick={onWhatsApp} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '50px', padding: '14px 24px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)' }} className="active:scale-95">
              <MessageCircle size={20} fill="white" /> Pedir
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}