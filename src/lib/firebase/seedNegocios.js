import { db } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function seedNegocios() {
    const negociosPrueba = [
        {
            nombre: "Metalúrgica Córdoba S.A.",
            rubro: "mecanizado",
            descripcion: "Especialistas en mecanizado de alta precisión, tornería CNC y fresado para la industria automotriz y aeroespacial.",
            direccion: "Parque Industrial Ferreyra, Córdoba",
            whatsapp: "3515551234",
            imagen: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@nexotecnica.com.ar"
        },
        {
            nombre: "Electromecánica Industrial RTS",
            rubro: "mantenimiento",
            descripcion: "Mantenimiento correctivo y preventivo de motores eléctricos, bombas hidráulicas y sistemas de refrigeración industrial.",
            direccion: "Av. Vélez Sarsfield 4500, Córdoba",
            whatsapp: "3515556789",
            imagen: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@nexotecnica.com.ar"
        },
        {
            nombre: "Automatismos y Control Global",
            rubro: "automatizacion",
            descripcion: "Integración de sistemas PLC, programación de robots industriales y diseño de tableros de control de procesos.",
            direccion: "B° San Martín, Córdoba",
            whatsapp: "3515559900",
            imagen: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=800",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@nexotecnica.com.ar"
        },
        {
            nombre: "Suministros Industriales El Norte",
            rubro: "suministros",
            descripcion: "Distribuidor oficial de herramientas de corte, rodamientos SKF y elementos de protección personal (EPP).",
            direccion: "Juan B. Justo 3200, Córdoba",
            whatsapp: "3515554433",
            imagen: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@nexotecnica.com.ar"
        },
        {
            nombre: "Consultora Técnica Ing. García",
            rubro: "servicios-tecnicos",
            descripcion: "Servicios de ingeniería de diseño CAD/CAM, peritajes técnicos y auditorías de seguridad e higiene industrial.",
            direccion: "B° Nueva Córdoba, Córdoba",
            whatsapp: "3515550011",
            imagen: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@nexotecnica.com.ar"
        }
    ];

    try {
        for (const negocio of negociosPrueba) {
            await addDoc(collection(db, 'negocios'), negocio);
        }
        return true;
    } catch (error) {
        console.error('Error seeding negocios:', error);
        return false;
    }
}
