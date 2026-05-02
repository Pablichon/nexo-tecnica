"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { trackEvent } from "@/lib/analytics";
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, X, MessageCircle } from "lucide-react";

// URL de respaldo confiable (vaciada porque mostraba hamburguesa en campañas no relacionadas)
const FALLBACK_IMAGE = "";

// Componente Modal para mostrar la oferta en grande
function CampaignOfferModal({ offer, onClose, accentColor, onWhatsApp }) {
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

  if (!offer) return null;

  const parts = (offer.description || "").split("–");
  const productTitle = parts[0]?.trim() || offer.description;
  const productDesc = parts.length > 1 ? parts.slice(1).join("–").trim() : null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '28px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header con Imagen */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '320px', 
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#374151" />
          </button>
          
          {offer.imagen && (
            <Image 
              src={offer.imagen} 
              alt={productTitle}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, 500px"
            />
          )}
        </div>

        {/* Contenido */}
        <div style={{ padding: '24px' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '800', 
            color: '#9ca3af', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            marginBottom: '8px' 
          }}>
            {offer.businessName}
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '900', 
            color: '#111827', 
            lineHeight: '1.2', 
            marginBottom: '16px' 
          }}>
            {productTitle}
          </h2>
          
          {productDesc && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
                Detalles del beneficio
              </h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
                {productDesc}
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: '8px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', display: 'block', textTransform: 'uppercase' }}>Precio Especial</span>
              <span style={{ fontSize: '32px', fontWeight: '900', color: accentColor }}>
                {offer.price}
              </span>
            </div>
            
            <button 
              onClick={onWhatsApp}
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                transition: 'transform 0.2s ease',
              }}
              className="active:scale-95"
            >
              <MessageCircle size={20} fill="white" />
              Pedir
            </button>
          </div>
        </div>
      </div>
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function CampaignBanner({ campaignId = "actual", isHeroOnly = false, initialData = null }) {
  const [campaign, setCampaign] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [imgError, setImgError] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    if (initialData) return; // Si ya tenemos datos del servidor, no hace falta el fetch inicial o caché
    
    const CACHE_KEY = `nexo-campaign-${campaignId}`;
    const CACHE_TIME = 1000 * 60 * 5; // 5 minutos de caché (para que cambios desde admin se reflejen rápido)

    // 1. Intentar cargar desde localStorage inmediatamente para una respuesta instantánea
    const checkCache = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isStale = Date.now() - timestamp > CACHE_TIME;
          
          if (data && data !== "NOT_FOUND") {
            setCampaign(data);
          }
          
          // Si el caché es reciente, podemos quitar el loader de inmediato
          if (!isStale) {
            setLoading(false);
            return true; // Caché válido y reciente
          }
          return false; // Caché existe pero es viejo, necesitamos refrescar
        }
      } catch (err) {
        console.error("Error al leer caché:", err);
        // Limpiar caché corrupto
        try { localStorage.removeItem(CACHE_KEY); } catch(e) {}
      }
      return false;
    };

    const hasRecentCache = checkCache();

    const fetchCampaign = async () => {
      try {
        console.log("🔍 CampaignBanner: Buscando campaña:", campaignId);
        const docRef = doc(db, "campaigns", campaignId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          // Construir objeto limpio sin Timestamps (que no serializan bien en JSON)
          const newData = { 
            id: docSnap.id, 
            title: rawData.title || '',
            subtitle: rawData.subtitle || '',
            backgroundImage: rawData.backgroundImage || '',
            accentColor: rawData.accentColor || '#f97316',
            offers: (rawData.offers || []).map(o => ({
              id: o.id || '',
              businessName: o.businessName || '',
              description: o.description || '',
              price: o.price || '',
              whatsappLink: o.whatsappLink || '',
              imagen: o.imagen || ''
            }))
          };
          
          console.log("✅ CampaignBanner: Campaña encontrada:", newData.title, "- Ofertas:", newData.offers.length);
          setCampaign(newData);
          
          // Guardamos en caché la versión limpia
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: newData,
            timestamp: Date.now()
          }));
        } else {
          console.warn("⚠️ CampaignBanner: No existe el documento", campaignId);
          setCampaign("NOT_FOUND");
        }
      } catch (error) {
        console.error("Error obteniendo campaña:", error);
        if (!hasRecentCache) setCampaign("NOT_FOUND");
      } finally {
        setLoading(false);
      }
    };

    // Siempre buscar datos frescos de Firebase
    fetchCampaign();
  }, [campaignId]);

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
  };

  const handleWhatsAppClick = (offer) => {
    trackEvent("Click WhatsApp Campaña", {
      id_oferta: offer.id,
      nombre_negocio: offer.businessName,
      tematica_actual: campaign?.title || campaignId,
    });
    if (offer.whatsappLink) {
      window.open(offer.whatsappLink, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div style={{
        width: "100%",
        height: "210px",
        background: "linear-gradient(135deg, #fed7aa 20%, #fde68a 100%)",
        borderRadius: "20px",
        margin: "8px 0 16px",
      }} className="animate-pulse" />
    );
  }

  // Mostrar si hay título, ofertas O imagen de fondo
  if (campaign === "NOT_FOUND" || !campaign || (!campaign.title && !campaign.backgroundImage && (!campaign.offers || campaign.offers.length === 0))) {
    return null;
  }


  const { title, subtitle, backgroundImage, accentColor, offers = [] } = campaign;
  const safeAccent = accentColor || "#f97316";

  // Función para aclarar el color de acento para el gradiente
  const lightenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };
  const accentLight = lightenColor(safeAccent, 0.3);
  const accentLighter = lightenColor(safeAccent, 0.5);

  const HeroContent = (
    <div style={{
      position: "relative",
      borderRadius: "20px",
      overflow: "hidden",
      minHeight: "210px",
      display: "flex",
      alignItems: "stretch",
      marginBottom: isHeroOnly ? "0" : "12px",
      background: `linear-gradient(135deg, ${safeAccent} 0%, ${accentLight} 80%, ${accentLighter} 100%)`,
      boxShadow: `0 6px 24px ${safeAccent}40`,
      transition: "transform 0.2s ease",
      cursor: "pointer"
    }} className="hover:scale-[1.01] active:scale-[0.99]" id={isHeroOnly ? "" : "campaign-top"}>

      {/* Imagen lado derecho */}
      <div style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "55%",
        zIndex: 0,
        display: imgError && !FALLBACK_IMAGE ? "none" : "block",
      }}>
        {(imgError ? FALLBACK_IMAGE : (backgroundImage || FALLBACK_IMAGE)) && (
          <Image
            src={imgError ? FALLBACK_IMAGE : (backgroundImage || FALLBACK_IMAGE)}
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            onError={() => { if (!imgError) setImgError(true); }}
            priority
            sizes="(max-width: 768px) 55vw, 600px"
          />
        )}

      </div>

      {/* Contenido izquierdo */}
      <div style={{
        position: "relative",
        zIndex: 1,
        padding: "24px 22px",
        maxWidth: "60%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>

        {/* Tag Especial */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          backgroundColor: "rgba(255,255,255,0.22)",
          border: "1.5px solid rgba(255,255,255,0.4)",
          borderRadius: "50px",
          padding: "5px 14px",
          marginBottom: "14px",
          width: "fit-content",
          color: "white",
          fontSize: "10px",
          fontWeight: "800",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          ESPECIAL {subtitle || title}
        </div>

        {/* Título principal */}
        <div style={{
          color: "white",
          fontSize: "1.7rem",
          fontWeight: "900",
          lineHeight: 1.15,
          marginBottom: "10px",
          textShadow: "0 1px 6px rgba(0,0,0,0.1)",
          letterSpacing: "-0.01em",
        }}>
          {title}
        </div>

        {/* Subtítulo (solo si no es hero only para ahorrar espacio en Home) */}
        {!isHeroOnly && (
           <div style={{
            color: "rgba(255,255,255,0.90)",
            fontSize: "13px",
            lineHeight: 1.5,
            marginBottom: "20px",
          }}>
            {subtitle}
          </div>
        )}

        {/* Botón */}
        <div
          style={{
            backgroundColor: "white",
            color: safeAccent,
            borderRadius: "50px",
            padding: "10px 22px",
            fontWeight: "800",
            fontSize: "14px",
            boxShadow: "0 2px 14px rgba(0,0,0,0.15)",
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {isHeroOnly ? "Ver Especial" : "Explorar Promos"}
          {isHeroOnly && <ChevronRight size={16} />}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section style={{
      marginBottom: "24px",
      padding: "0 16px", // Se agregó padding horizontal para balancear el grid
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {isHeroOnly ? (
        <Link href="/campania" style={{ textDecoration: 'none', display: 'block' }}>
          {HeroContent}
        </Link>
      ) : (
        <>
          {HeroContent}
          
          {/* GRID DE CARDS — SOLO EN MODO FULL */}
          <div
            id="campaign-offers-list"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {offers.map((offer) => {
              const parts = (offer.description || "").split("–");
              const productTitle = parts[0]?.trim() || offer.description;
              const productDesc = parts.length > 1 ? parts.slice(1).join("–").trim() : null;

              return (
                <div
                  key={offer.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "16px 14px 14px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOfferClick(offer)}
                >
                  {/* Foto del producto si existe */}
                  {offer.imagen && (
                    <div style={{ 
                      width: '100%', 
                      height: '140px', // Aumentado para mejor visualización
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      marginBottom: '10px', 
                      border: '1px solid #f3f4f6',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      backgroundColor: '#f8fafc', // Fondo neutro para el "contain"
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <Image 
                        src={offer.imagen} 
                        alt={productTitle} 
                        fill
                        style={{ objectFit: 'contain' }} 
                        onError={(e) => { e.target.parentNode.style.display = 'none'; }}
                        sizes="(max-width: 768px) 50vw, 300px"
                      />
                    </div>
                  )}

                  <div style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    color: "#9ca3af",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}>
                    {offer.businessName}
                  </div>

                  <div style={{
                    fontSize: "14.5px",
                    fontWeight: "800",
                    color: "#111827",
                    lineHeight: 1.3,
                    marginBottom: productDesc ? "5px" : "12px",
                    flex: 1,
                  }}>
                    {productTitle}
                  </div>

                  {productDesc && (
                    <div style={{
                      fontSize: "11.5px",
                      color: "#6b7280",
                      lineHeight: 1.4,
                      marginBottom: "12px",
                    }}>
                      {productDesc}
                    </div>
                  )}

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "auto",
                    paddingTop: "10px",
                    borderTop: "1px solid #f9f9f9",
                  }}>
                    <div style={{
                      fontSize: "17px",
                      fontWeight: "900",
                      color: safeAccent,
                    }}>
                      {offer.price}
                    </div>
                    <button
                      style={{
                        backgroundColor: "#25D366",
                        color: "white",
                        border: "none",
                        borderRadius: "50px",
                        padding: "7px 15px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                      onClick={(e) => { e.stopPropagation(); handleOfferClick(offer); }}
                    >
                      Pedir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>

    {selectedOffer && (
      <CampaignOfferModal 
        offer={selectedOffer} 
        onClose={() => setSelectedOffer(null)} 
        accentColor={safeAccent}
        onWhatsApp={() => handleWhatsAppClick(selectedOffer)}
      />
    )}
    </>
  );
}
