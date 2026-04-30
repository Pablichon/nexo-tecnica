import { db } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function seedNegocios() {
    const negociosPrueba = [
        {
            nombre: "Verdulería El Pepe",
            rubro: "Alimentos",
            direccion: "Yofre Norte",
            whatsapp: "3511234567",
            imagen: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@yofre.com"
        },
        {
            nombre: "Barbería Yofre",
            rubro: "Servicios",
            direccion: "Av. Principal 123",
            whatsapp: "3519876543",
            imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@yofre.com"
        },
        {
            nombre: "Pizzería Don Luis",
            rubro: "Gastronomía",
            direccion: "Barrio Yofre",
            whatsapp: "3515555555",
            imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@yofre.com"
        },
        {
            nombre: "Ferretería Central",
            rubro: "Construcción",
            direccion: "Yofre Norte 456",
            whatsapp: "3514444444",
            imagen: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
            estado: "aprobado",
            fechaCreacion: Timestamp.now(),
            fechaModeracion: Timestamp.now(),
            moderadoPor: "admin@yofre.com"
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
