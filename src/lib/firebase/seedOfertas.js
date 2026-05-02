// src/lib/firebase/seedOfertas.js
import { db } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const ofertasMock = [
    {
        titulo: "Pack 100hs Tornería CNC",
        negocioNombre: "Metalúrgica Córdoba S.A.",
        negocioId: "demo-1",
        precioOriginal: 850000,
        precioOferta: 680000,
        descuento: "20%",
        imagenUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        estado: 'activa'
    },
    {
        titulo: "Service Completo de Puente Grúa",
        negocioNombre: "Electromecánica Industrial RTS",
        negocioId: "demo-2",
        precioOriginal: 250000,
        precioOferta: 195000,
        descuento: "22%",
        imagenUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
        estado: 'activa'
    },
    {
        titulo: "Kit PLC Siemens S7-1200 + IHM",
        negocioNombre: "Automatismos y Control Global",
        negocioId: "demo-3",
        precioOriginal: 1200000,
        precioOferta: 1050000,
        descuento: "12%",
        imagenUrl: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?q=80&w=1000&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)),
        estado: 'activa'
    },
    {
        titulo: "20% OFF en Insumos de Soldadura",
        negocioNombre: "Suministros Industriales El Norte",
        negocioId: "demo-4",
        precioOriginal: 50000,
        precioOferta: 40000,
        descuento: "20%",
        imagenUrl: "https://images.unsplash.com/photo-1581092162384-8987c1794714?q=80&w=1000&auto=format&fit=crop",
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)),
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
