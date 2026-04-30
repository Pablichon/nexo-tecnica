import { db } from './src/lib/firebase/config.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const negociosPrueba = [
    {
        nombre: "Verdulería El Pepe",
        rubro: "Alimentos",
        direccion: "Yofre Norte",
        whatsapp: "3511234567",
        imagen: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400",
        estado: "aprobado",
        fechaCreacion: Timestamp.now(),
        fechaModeracion: Timestamp.now()
    },
    {
        nombre: "Barbería Yofre",
        rubro: "Servicios",
        direccion: "Av. Principal 123",
        whatsapp: "3519876543",
        imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
        estado: "aprobado",
        fechaCreacion: Timestamp.now(),
        fechaModeracion: Timestamp.now()
    },
    {
        nombre: "Pizzería Don Luis",
        rubro: "Gastronomía",
        direccion: "Barrio Yofre",
        whatsapp: "3515555555",
        imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        estado: "aprobado",
        fechaCreacion: Timestamp.now(),
        fechaModeracion: Timestamp.now()
    },
    {
        nombre: "Ferretería Central",
        rubro: "Construcción",
        direccion: "Yofre Norte 456",
        whatsapp: "3514444444",
        imagen: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
        estado: "aprobado",
        fechaCreacion: Timestamp.now(),
        fechaModeracion: Timestamp.now()
    }
];

async function seedNegocios() {
    try {
        console.log('\n🌱 Cargando negocios de prueba...\n');

        for (const negocio of negociosPrueba) {
            const docRef = await addDoc(collection(db, 'negocios'), negocio);
            console.log(`✅ ${negocio.nombre} - ID: ${docRef.id}`);
        }

        console.log(`\n🎉 ${negociosPrueba.length} negocios aprobados cargados exitosamente!\n`);
        console.log('👉 Ahora podés crear ofertas desde el panel de administración.\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

seedNegocios();
