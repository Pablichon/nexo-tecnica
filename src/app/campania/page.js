import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import CampaignBanner from '@/components/CampaignBanner';
import styles from '../page.module.css';
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

async function getCampaignData(campaignId) {
  try {
    const docRef = doc(db, "campaigns", campaignId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const rawData = docSnap.data();
      return { 
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
    }
    return null;
  } catch (error) {
    console.error("Error fetching campaign server-side:", error);
    return null;
  }
}

export default async function CampaniaPage() {
  const campaignData = await getCampaignData("actual");

  return (
    <main className={styles.mainContainer} style={{ minHeight: '100vh', background: '#fafafb' }}>
      
      {/* HEADER DE LA PÁGINA ESPECIAL */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '16px 4px', 
        marginBottom: '4px' 
      }}>
        <Link 
          href="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'white', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0',
            color: '#374151'
          }}
        >
          <ChevronLeft size={24} />
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Especiales / Campaña Actual
          </span>
          <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: 0 }}>
            Catálogo de Servicios Técnicos
          </h1>
        </div>
      </header>

      {/* COMPONENTE EN MODO FULL (BANDNER + GRID) CON DATOS PRECARGADOS */}
      <CampaignBanner campaignId="actual" isHeroOnly={false} initialData={campaignData} />

      {/* FOOTER PEQUEÑO */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '32px 0', 
        color: '#9ca3af', 
        fontSize: '13px' 
      }}>
        <p>Servicios y suministros técnicos para la industria.</p>
        <Link href="/" style={{ color: '#0284C7', fontWeight: 'bold', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
          Volver al Inicio
        </Link>
      </footer>

    </main>
  );
}
