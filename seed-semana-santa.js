// =====================================================
// SCRIPT: Crea el documento "actual" en campaigns
// Ejecutar UNA sola vez: node seed-semana-santa.js
// =====================================================

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDTJ81zZfaP_mpw4kxV0tI1ZXI8PcGMpdU",
  authDomain: "yofre-al-toque.firebaseapp.com",
  projectId: "yofre-al-toque",
  storageBucket: "yofre-al-toque.firebasestorage.app",
  messagingSenderId: "1012232274898",
  appId: "1:1012232274898:web:c18e0867a802176277fe0b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const campaignData = {
    title: "Semana Santa al Toque",
    subtitle: "Las mejores roscas, huevos y combos para compartir en familia",
    accentColor: "#f97316",
    backgroundImage: "https://images.unsplash.com/photo-1612200644197-c3fac4af3e55?auto=format&fit=crop&w=800&q=80",
    offers: [
      {
        id: "ss1",
        businessName: "Panadería El Sol",
        description: "Rosca de Pascua Premium – 500gr con crema pastelera y cerezas artesanal",
        price: "$8.500",
        whatsappLink: "https://wa.me/5493510000001"
      },
      {
        id: "ss2",
        businessName: "Chocolatería Yofre",
        description: "Huevo de Chocolate 15cm – Relleno de confites y sorpresa incluida",
        price: "$6.200",
        whatsappLink: "https://wa.me/5493510000002"
      }
    ]
  };

  try {
    await setDoc(doc(db, "campaigns", "actual"), campaignData);
    console.log("✅ Documento 'actual' creado/actualizado con éxito en Firebase!");
    console.log("🎉 Abrí yofrealtoque.com.ar y refrescá - verás la campaña de Semana Santa.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seed();
