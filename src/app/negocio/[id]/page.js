import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import NegocioContent from './NegocioContent';

// 1. GENERAR METADATA DINÁMICA (SEO)
export async function generateMetadata({ params }) {
    const { id } = await params;

    try {
        const docRef = doc(db, "negocios", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const negocio = docSnap.data();
            const description = negocio.descripcion
                ? negocio.descripcion.substring(0, 160)
                : `Conocé ${negocio.nombre} en Nexo Técnica. Rubro: ${negocio.rubro}. Contacto directo por WhatsApp.`;

            return {
                title: negocio.nombre,
                description: description,
                openGraph: {
                    title: `${negocio.nombre} - Nexo Técnica`,
                    description: description,
                    images: [negocio.imagen || '/logo.png'],
                },
            };
        }
    } catch (error) {
        console.error("Error al generar metadata:", error);
    }

    return {
        title: 'Proveedor Técnico | Nexo Técnica',
        description: 'Directorio especializado de proveedores industriales y servicios técnicos.',
    };
}

// 2. COMPONENTE DE PÁGINA (SERVER)
export default async function Page({ params }) {
    const { id } = await params;
    let negocio = null;

    try {
        const docRef = doc(db, "negocios", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            negocio = { id: docSnap.id, ...docSnap.data() };
        }
    } catch (error) {
        console.error("Error cargando negocio:", error);
    }

    if (!negocio) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Negocio no encontrado</div>;
    }

    return <NegocioContent negocioInicial={negocio} />;
}