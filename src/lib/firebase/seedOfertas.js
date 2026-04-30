// src/lib/firebase/seedOfertas.js
import { db } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const ofertasMock = [
    {
        titulo: "2x1 en Lomitos Completos",
        negocioNombre: "Lomitos El Beto",
        negocioId: "1", // ID temporal o real si existe
        precioOriginal: 12000,
        precioOferta: 6000,
        descuento: "50%",
        imagenUrl: "https://images.unsplash.com/photo-1561758033-d8f19662cb5d?q=80&w=2574&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 días
        estado: 'activa'
    },
    {
        titulo: "20% OFF en Corte + Barba",
        negocioNombre: "Barbería Yofre",
        negocioId: "2",
        precioOriginal: 5000,
        precioOferta: 4000,
        descuento: "20%",
        imagenUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2670&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)), // 10 días
        estado: 'activa'
    },
    {
        titulo: "Docena de Empanadas Gratis",
        negocioNombre: "Pizzería Don Luis",
        negocioId: "3",
        precioOriginal: 8000,
        precioOferta: 0,
        descuento: "100%",
        imagenUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2581&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // 3 días
        estado: 'activa'
    },
    {
        titulo: "Limpieza Dental Completa",
        negocioNombre: "Consultorio Odontológico",
        negocioId: "4",
        precioOriginal: 15000,
        precioOferta: 10000,
        descuento: "33%",
        imagenUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2670&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), // 15 días
        estado: 'activa'
    },
    {
        titulo: "Cambio de Aceite + Filtros",
        negocioNombre: "Lubricentro Norte",
        negocioId: "5",
        precioOriginal: 45000,
        precioOferta: 38000,
        descuento: "15%",
        imagenUrl: "https://images.unsplash.com/photo-1487754180477-db33d345f55e?q=80&w=2670&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)), // 20 días
        estado: 'activa'
    },
    {
        titulo: "Manicura Semipermanente",
        negocioNombre: "Estética Bella",
        negocioId: "6",
        precioOriginal: 8000,
        precioOferta: 6000,
        descuento: "25%",
        imagenUrl: "https://images.unsplash.com/photo-1632345031635-fe1564dc9113?q=80&w=2670&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 días
        estado: 'activa'
    }
];

export const seedOfertas = async () => {
    try {
        const promises = ofertasMock.map(oferta => addDoc(collection(db, 'ofertas'), oferta));
        await Promise.all(promises);
        console.log("✅ Ofertas sembradas con éxito en Firestore");
        return true;
    } catch (error) {
        console.error("❌ Error sembrando ofertas:", error);
        return false;
    }
};
