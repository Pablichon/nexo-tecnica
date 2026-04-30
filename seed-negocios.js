// Script para cargar negocios de prueba aprobados
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDRv-sT8o1R5uTKLqDqhpfcAKoSiYDX3Eg",
    authDomain: "yofre-b3ce0.firebaseapp.com",
    projectId: "yofre-b3ce0",
    storageBucket: "yofre-b3ce0.firebasestorage.app",
    messagingSenderId: "613529089858",
    appId: "1:613529089858:web:af66f31c88c7d2c83b9e17"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedNegocios();
