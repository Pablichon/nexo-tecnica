// Script temporal para revisar la base de datos
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkDatabase() {
    try {
        console.log('\n📊 Revisando base de datos...\n');

        // Revisar negocios
        const negociosSnap = await getDocs(collection(db, 'negocios'));
        console.log(`🏪 NEGOCIOS TOTALES: ${negociosSnap.size}`);

        if (negociosSnap.size > 0) {
            negociosSnap.forEach(doc => {
                const data = doc.data();
                console.log(`  - ${data.nombre || 'Sin nombre'} (${data.rubro || 'Sin rubro'}) - Estado: ${data.estado || 'Sin estado'}`);
            });
        } else {
            console.log('  ⚠️  No hay negocios en la base de datos');
        }

        console.log('\n');

        // Revisar ofertas
        const ofertasSnap = await getDocs(collection(db, 'ofertas'));
        console.log(`🔥 OFERTAS TOTALES: ${ofertasSnap.size}`);

        if (ofertasSnap.size > 0) {
            ofertasSnap.forEach(doc => {
                const data = doc.data();
                console.log(`  - ${data.titulo || 'Sin título'} - ${data.negocioNombre || 'Sin negocio'} - Estado: ${data.estado || 'Sin estado'}`);
            });
        } else {
            console.log('  ⚠️  No hay ofertas en la base de datos');
        }

        console.log('\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDatabase();
