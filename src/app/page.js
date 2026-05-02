import CampaignBanner from '@/components/CampaignBanner';
import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import styles from './page.module.css';
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

async function getOfertas() {
  try {
    const q = query(collection(db, 'ofertas'), where('estado', '==', 'activa'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching ofertas server-side:", error);
    return [];
  }
}

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

export default async function Home() {
  // Paralelizar las peticiones para máxima velocidad
  const [ofertas, campaignData] = await Promise.all([
    getOfertas(),
    getCampaignData("actual")
  ]);

  return (
    <main className={styles.mainContainer}>
      {/* 1. CABECERA */}
      <header className={styles.header}>
        <h1 style={{ display: 'none' }}>Nexo Técnica - Proveedores y Servicios Industriales</h1>
        <div style={{ marginBottom: '16px' }}>
          <img 
            src="/logo.png" 
            alt="Nexo Técnica Logo" 
            style={{ maxWidth: '300px', height: 'auto' }} 
          />
        </div>
        <p className={styles.subtitle}>Conectando la industria con soluciones técnicas expertas</p>
      </header>

      {/* COMPONENTE DINÁMICO DE CAMPAÑAS MENSUALES — MODO HERO */}
      <CampaignBanner campaignId="actual" isHeroOnly={true} initialData={campaignData} />

      {/* CONTENIDO INTERACTIVO (CARRUSELES, MODALES, CATEGORÍAS) */}
      <HomeClientWrapper initialOffers={ofertas} />
    </main>
  );
}