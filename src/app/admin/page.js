'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Link as LinkIcon, X, UploadCloud } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { seedOfertas } from '@/lib/firebase/seedOfertas';
import { seedNegocios } from '@/lib/firebase/seedNegocios';
import { categories } from '@/data/categories';
import styles from './admin.module.css';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import MediaUpload from '@/components/publicar-negocio/MediaUpload';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState(null);
    const [stats, setStats] = useState({
        pendientes: 0,
        aprobados: 0,
        rechazados: 0
    });
    const [negociosPendientes, setNegociosPendientes] = useState([]);
    const [editingNegocio, setEditingNegocio] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // Search for active businesses
    const [searchTermPending, setSearchTermPending] = useState(''); // Search for pending businesses

    // CLOUDINARY REFS
    const cloudinaryRef = useRef(null);
    const campaignWidgetRef = useRef(null);

    // NEW STATE: Image Upload for Editing
    const [imageMode, setImageMode] = useState('url'); // 'upload' | 'url'
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // NEW STATE: Image Upload for Offers
    const [offerImageMode, setOfferImageMode] = useState('url'); // 'upload' | 'url'
    const [offerSelectedFile, setOfferSelectedFile] = useState(null);
    const [offerPreviewUrl, setOfferPreviewUrl] = useState(null);
    const offerFileInputRef = useRef(null);

    // NEW STATE: Offer Creation
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [approvedBusinesses, setApprovedBusinesses] = useState([]);

    // NEW STATE: Offers Management
    const [ofertas, setOfertas] = useState([]);
    const [editingOffer, setEditingOffer] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const [offerData, setOfferData] = useState({
        titulo: '',
        negocioId: '',
        negocioNombre: '',
        whatsapp: '',
        precioOriginal: '',
        precioOferta: '',
        imagenUrl: '',
        diasValidez: '5',
        descripcion: '',
        stock: '',
        vistas: '0',
        destacada: false,
        revelarPrecioClick: false
    });

    // CAMPAIGN BANNER STATES
    const [campaignData, setCampaignData] = useState({
        title: '',
        subtitle: '',
        backgroundImage: '',
        accentColor: '#db2777',
        offers: []
    });
    const [isSavingCampaign, setIsSavingCampaign] = useState(false);



    // Verificar autenticación y permisos
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/admin/login');
                return;
            }

            try {
                // Verificar que es admin
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                if (!adminDoc.exists()) {
                    console.error("Usuario no es admin o documento no existe");
                    await auth.signOut();
                    router.push('/admin/login');
                    return;
                }

                setAdminUser({ uid: user.uid, email: user.email, ...adminDoc.data() });
                setLoading(false);
                loadData();
            } catch (error) {
                console.error("Error verificando admin:", error);
                router.push('/admin/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const loadData = async () => {
        // 1. Cargar estadísticas y negocios (Bloque independiente)
        try {
            const pendientesSnap = await getDocs(query(collection(db, 'negocios'), where('estado', '==', 'pendiente')));
            const aprobadosSnap = await getDocs(query(collection(db, 'negocios'), where('estado', '==', 'aprobado')));
            const rechazadosSnap = await getDocs(query(collection(db, 'negocios'), where('estado', '==', 'rechazado')));

            setStats({
                pendientes: pendientesSnap.size,
                aprobados: aprobadosSnap.size,
                rechazados: rechazadosSnap.size
            });

            const pendientesList = [];
            pendientesSnap.forEach(doc => {
                pendientesList.push({ id: doc.id, ...doc.data() });
            });
            setNegociosPendientes(pendientesList);

            const aprobadosList = [];
            aprobadosSnap.forEach(doc => {
                aprobadosList.push({ id: doc.id, ...doc.data() });
            });
            setApprovedBusinesses(aprobadosList);
        } catch (error) {
            console.error('Error cargando estadísticas/negocios:', error);
        }

        // 2. Cargar ofertas (Bloque independiente)
        try {
            const ofertasSnap = await getDocs(query(collection(db, 'ofertas'), where('estado', '==', 'activa')));
            const ofertasList = [];
            ofertasSnap.forEach(doc => {
                ofertasList.push({ id: doc.id, ...doc.data() });
            });
            setOfertas(ofertasList);
        } catch (error) {
            console.error('Error cargando ofertas:', error);
        }

        // 3. Cargar Campaña Mensual (Bloque independiente)
        try {
            console.log("🔍 Intentando cargar campaña 'actual'...");
            const campSnap = await getDoc(doc(db, 'campaigns', 'actual'));
            if (campSnap.exists()) {
                const cData = campSnap.data();
                console.log("✅ Campaña encontrada:", cData.title);
                setCampaignData({ 
                    ...cData, 
                    offers: (cData.offers || []).map(o => ({
                        ...o,
                        imagen: o.imagen || ''
                    }))
                });
            } else {
                console.warn("⚠️ No se encontró el documento 'actual' en campaigns.");
            }
        } catch (error) {
            console.error('Error cargando campaña:', error);
        }
    };

    // CLOUDINARY WIDGET INITIALIZATION
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.async = true;
        script.onload = () => {
            cloudinaryRef.current = window.cloudinary;
        };
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const openCloudinaryWidget = (onSuccess) => {
        if (!cloudinaryRef.current) {
            alert('Cloudinary aún se está cargando...');
            return;
        }

        const widget = cloudinaryRef.current.createUploadWidget(
            {
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pablichon',
                uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'yofre_preset',
                folder: 'campanias',
                clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                maxFileSize: 5000000, // 5MB
                multiple: false,
                sources: ['local', 'url', 'camera'],
                language: 'es',
                text: { es: { or: "O", menu: { files: "Mis archivos", camera: "Cámara", url: "Desde una URL" }, local: { browse: "Buscar en mi equipo", dd_title_single: "Arrastrá la imagen acá" } } }
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    onSuccess(result.info.secure_url);
                }
            }
        );
        widget.open();
    };

    const handleAprobar = async (negocioId) => {
        try {
            await updateDoc(doc(db, 'negocios', negocioId), {
                estado: 'aprobado',
                fechaModeracion: new Date(),
                moderadoPor: adminUser.email
            });
            alert('✅ Negocio aprobado exitosamente');
            loadData();
        } catch (error) {
            console.error('Error al aprobar:', error);
            alert('Error al aprobar el negocio');
        }
    };

    const handleRechazar = async (negocioId) => {
        const motivo = prompt('¿Motivo del rechazo? (opcional)');
        try {
            await updateDoc(doc(db, 'negocios', negocioId), {
                estado: 'rechazado',
                fechaModeracion: new Date(),
                moderadoPor: adminUser.email,
                motivoRechazo: motivo || ''
            });
            alert('❌ Negocio rechazado');
            loadData();
        } catch (error) {
            console.error('Error al rechazar:', error);
            alert('Error al rechazar el negocio');
        }
    };

    const handleEdit = (negocio) => {
        setEditingNegocio(negocio);
        // Reset image upload states
        setImageMode('url');
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleFileChange = (e) => {
        console.log('🔍 handleFileChange ejecutado');
        const file = e.target.files[0];
        if (!file) {
            console.log('❌ No hay archivo seleccionado');
            return;
        }

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`📁 Archivo: ${file.name}`);
        console.log(`📏 Tamaño: ${fileSizeMB} MB (${file.size} bytes)`);
        console.log(`⚖️ Límite: 5 MB (${5 * 1024 * 1024} bytes)`);

        // Control de Peso estricto (5 MB) - VALIDACIÓN INMEDIATA
        if (file.size > 5 * 1024 * 1024) {
            console.log(`🚫 ARCHIVO RECHAZADO - Supera el límite`);
            alert(`¡Archivo demasiado grande! (${fileSizeMB} MB). El límite es de 5 MB.`);
            e.target.value = ''; // Limpiar el input
            setSelectedFile(null); // Limpiar el estado
            setPreviewUrl(null); // Limpiar preview
            return;
        }

        console.log('✅ Archivo aceptado - Procesando...');
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        // Limpiar URL manual si había
        if (editingNegocio) {
            setEditingNegocio({ ...editingNegocio, imagen: '' });
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOfferFileChange = (e) => {
        console.log('🔍 handleOfferFileChange ejecutado');
        const file = e.target.files[0];
        if (!file) {
            console.log('❌ No hay archivo seleccionado');
            return;
        }

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`📁 Archivo: ${file.name}`);
        console.log(`📏 Tamaño: ${fileSizeMB} MB (${file.size} bytes)`);
        console.log(`⚖️ Límite: 5 MB (${5 * 1024 * 1024} bytes)`);

        // Control de Peso estricto (5 MB) - VALIDACIÓN INMEDIATA
        if (file.size > 5 * 1024 * 1024) {
            console.log(`🚫 ARCHIVO RECHAZADO - Supera el límite`);
            alert(`¡Archivo demasiado grande! (${fileSizeMB} MB). El límite es de 5 MB.`);
            e.target.value = ''; // Limpiar el input
            setOfferSelectedFile(null); // Limpiar el estado
            setOfferPreviewUrl(null); // Limpiar preview
            return;
        }

        console.log('✅ Archivo aceptado - Procesando...');
        setOfferSelectedFile(file);
        const url = URL.createObjectURL(file);
        setOfferPreviewUrl(url);
        // Limpiar URL manual si había
        setOfferData(prev => ({ ...prev, imagenUrl: '' }));
    };

    const clearOfferFile = () => {
        setOfferSelectedFile(null);
        setOfferPreviewUrl(null);
        if (offerFileInputRef.current) offerFileInputRef.current.value = '';
    };

    const uploadBusinessImage = async (file) => {
        let fileToUpload = file;

        try {
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`El archivo supera los 5 MB (${(file.size / 1024 / 1024).toFixed(2)} MB). Subida cancelada.`);
            }

            console.log('🔹 1. Iniciando proceso de imagen de negocio...');
            setIsCompressing(true);

            try {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                    initialQuality: 0.8
                };
                const compressedFile = await imageCompression(file, options);
                fileToUpload = compressedFile;
            } catch (compressionError) {
                console.warn('⚠️ Fallo en optimización, subiendo archivo original:', compressionError.message);
            }

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, `negocios/${fileName}`);

            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            console.error('❌ Error en proceso de imagen:', error);
            alert(`Error de subida: ${error.code || error.message}`);
            throw error;
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingNegocio) return;

        console.log("🎬 INICIO handleSaveEdit - v3.0 (Fixed)");

        // 1. Indicar inicio visualmente
        if (selectedFile) {
            setIsCompressing(true);
        }

        try {
            // 2. Preparar el objeto base, LIMPIANDO cualquier campo basura previo
            const { id, nombreArchivoImagen, tipoImagen, ...dataCleaner } = editingNegocio;
            let finalImageUrl = dataCleaner.imagen;

            // 3. Si hay archivo nuevo, subirlo y OBTENER LA URL
            if (selectedFile) {
                console.log("📤 Subiendo archivo nuevo:", selectedFile.name);

                // Esta función DEBE retornar la URL de descarga
                const uploadedUrl = await uploadBusinessImage(selectedFile);

                if (!uploadedUrl) {
                    throw new Error("La subida se completó pero no se obtuvo una URL válida.");
                }

                console.log("🔗 URL obtenida de Storage:", uploadedUrl);
                finalImageUrl = uploadedUrl;
            }

            // 4. Construir el objeto a guardar en Firestore
            const updateData = {
                ...dataCleaner,
                imagen: dataCleaner.media && dataCleaner.media.length > 0 && !selectedFile
                    ? (dataCleaner.media.find(m => m.type === 'image')?.url || dataCleaner.media[0].url)
                    : finalImageUrl
            };

            // 5. Guardar en Firestore
            console.log("💾 Guardando en Firestore:", updateData);
            await updateDoc(doc(db, 'negocios', id), updateData);
            console.log("✅ Guardado exitoso.");

            alert('✅ Negocio actualizado exitosamente (v3.0).');

            // 6. Limpiar estados
            setEditingNegocio(null);
            clearFile();
            loadData();
        } catch (error) {
            console.error('❌ Error CRÍTICO en handleSaveEdit:', error);
            alert('Error al guardar: ' + (error.message || error));
        } finally {
            setIsCompressing(false);
            console.log("🏁 FIN handleSaveEdit");
        }
    };

    // Función para subir imagen a Firebase Storage con optimización profesional
    const uploadOfferImage = async (file) => {
        let fileToUpload = file; // Por defecto, subir el original

        try {
            // 1. VALIDACIÓN ESTRICTA: Bloqueo si supera 5 MB
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`El archivo supera los 5 MB (${(file.size / 1024 / 1024).toFixed(2)} MB). Subida cancelada.`);
            }

            console.log('🔹 1. Iniciando proceso de imagen...');
            console.log(`📏 Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

            // 2. COMPRESIÓN AUTOMÁTICA (con fallback robusto)
            setIsCompressing(true); // Estado: "Optimizando imagen..."

            try {
                console.log('⚙️ 2. Optimizando imagen...');

                const options = {
                    maxSizeMB: 0.5,           // Target: 500KB
                    maxWidthOrHeight: 1200,   // 1200px máximo
                    useWebWorker: true,       // Mejor performance
                    initialQuality: 0.8       // 80% calidad
                };

                const compressedFile = await imageCompression(file, options);
                console.log(`✅ Optimización exitosa: ${(compressedFile.size / 1024).toFixed(2)} KB`);

                fileToUpload = compressedFile; // Usar archivo comprimido
            } catch (compressionError) {
                console.warn('⚠️ Fallo en optimización, subiendo archivo original:', compressionError.message);
                // fileToUpload ya es 'file' (original) - continuar sin comprimir
            }

            // 3. SUBIDA A FIREBASE
            setIsCompressing(false); // Cambiar estado visual
            console.log('📤 3. Subiendo a Firebase Storage...');

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, `ofertas/${fileName}`);

            const snapshot = await uploadBytes(storageRef, fileToUpload);
            console.log('✅ 4. Upload completado');

            // 4. OBTENER URL PÚBLICA
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('✅ 5. URL generada:', downloadURL);

            return downloadURL;
        } catch (error) {
            console.error('❌ Error en proceso de imagen:', error);
            alert(`Error de subida: ${error.code || error.message}`);
            throw error;
        } finally {
            console.log('🔹 6. Finalizando proceso');
            setIsCompressing(false);
        }
    };

    const handleCreateOffer = async (e) => {
        if (e) e.preventDefault();

        console.log("🔥 Iniciando creación de oferta...");

        // 1. Validaciones Manuales
        if (!offerData.negocioId) {
            alert('⚠️ Por favor seleccioná un negocio.');
            return;
        }
        if (!offerData.titulo) {
            alert('⚠️ El título es obligatorio.');
            return;
        }
        if (!offerData.precioOriginal) {
            alert('⚠️ El precio original es obligatorio.');
            return;
        }
        if (!offerData.precioOferta) {
            alert('⚠️ El precio de oferta es obligatorio.');
            return;
        }
        if (!offerData.whatsapp) {
            alert('⚠️ El WhatsApp es obligatorio.');
            return;
        }

        const btn = document.getElementById('btn-publicar-oferta');
        if (btn) {
            btn.disabled = true;
            btn.innerText = '⏳ Publicando...';
        }

        try {
            // Find selected business Name
            const business = approvedBusinesses.find(b => b.id === offerData.negocioId);
            if (!business) {
                alert('Seleccioná un negocio válido');
                throw new Error("Negocio inválido");
            }

            // Subir imagen a Storage si hay archivo seleccionado
            let imageUrl = offerData.imagenUrl; // URL manual si la ingresaron

            if (offerSelectedFile) {
                // Si se subió un archivo, uploadearlo a Storage
                imageUrl = await uploadOfferImage(offerSelectedFile);
            }

            // Limpieza de links viejos (Unsplash) si no hay imagen válida
            if (!imageUrl || imageUrl.includes('images.unsplash.com')) {
                imageUrl = '/default-offer.png';
            }

            // Calcular descuento automáticamente
            const descuentoCalc = Math.round(
                ((Number(offerData.precioOriginal) - Number(offerData.precioOferta)) / Number(offerData.precioOriginal)) * 100
            );

            const newOffer = {
                titulo: offerData.titulo,
                negocioId: offerData.negocioId,
                negocioNombre: business.nombre,
                whatsapp: offerData.whatsapp || business.whatsapp,
                precioOriginal: Number(offerData.precioOriginal),
                precioOferta: Number(offerData.precioOferta),
                descuento: `${descuentoCalc}%`,
                imagen: imageUrl,
                descripcion: offerData.descripcion,
                stock: offerData.stock ? Number(offerData.stock) : null,
                vistas: Number(offerData.vistas) || 0,
                fechaInicio: Timestamp.now(),
                fechaFin: Timestamp.fromDate(new Date(Date.now() + Number(offerData.diasValidez) * 24 * 60 * 60 * 1000)),
                estado: 'activa',
                rubro: business.rubro || 'Varios', // Rubro denormalizado para filtros rápidos
                destacada: offerData.destacada || false,
                revelarPrecioClick: offerData.revelarPrecioClick || false
            };

            await addDoc(collection(db, 'ofertas'), newOffer);
            alert('🔥 Oferta creada con éxito!');
            setShowOfferModal(false);
            setOfferData({
                titulo: '',
                negocioId: '',
                negocioNombre: '',
                whatsapp: '',
                precioOriginal: '',
                precioOferta: '',
                imagenUrl: '',
                diasValidez: '5',
                descripcion: '',
                stock: '',
                vistas: '0',
                destacada: false,
                revelarPrecioClick: false
            });
            clearOfferFile();
            setOfferImageMode('url');
            loadData(); // Recargar lista de ofertas
        } catch (error) {
            console.error('Error creando oferta:', error);
            if (!error.code && error.message !== "Negocio inválido") alert('Error al crear oferta: ' + error.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerText = '🔥 Publicar';
            }
        }
    };

    const handleEditOffer = (oferta) => {
        setEditingOffer({
            ...oferta,
            stock: oferta.stock || '',
            stock: oferta.stock || '',
            vistas: oferta.vistas || 0,
            destacada: oferta.destacada || false,
            revelarPrecioClick: oferta.revelarPrecioClick || false
        });
        setOfferImageMode('url');
        clearOfferFile();
    };

    const handleUpdateOffer = async () => {
        if (!editingOffer) return;

        try {
            const { id, ...data } = editingOffer;

            // Subir nueva imagen a Storage si hay archivo seleccionado
            let imageUrl = data.imagen; // Mantener imagen actual por defecto

            if (offerSelectedFile) {
                // Si se subió un nuevo archivo, uploadearlo a Storage
                imageUrl = await uploadOfferImage(offerSelectedFile);
            }

            // Limpieza de links viejos (Unsplash) y fallback
            if (!imageUrl || imageUrl.includes('images.unsplash.com')) {
                imageUrl = '/default-offer.png';
            }

            // Calcular descuento dinámicamente
            const descuentoCalc = Math.round(
                ((Number(data.precioOriginal) - Number(data.precioOferta)) / Number(data.precioOriginal)) * 100
            );

            const business = approvedBusinesses.find(b => b.id === data.negocioId);

            const updateData = {
                ...data,
                imagen: imageUrl, // Usa nueva URL de Storage, la existente, o el fallback
                rubro: business?.rubro || data.rubro || 'Varios',
                descuento: `${descuentoCalc}%`,
                precioOriginal: Number(data.precioOriginal),
                precioOferta: Number(data.precioOferta),
                stock: data.stock ? Number(data.stock) : null,
                vistas: Number(data.vistas) || 0,
                destacada: data.destacada || false,
                revelarPrecioClick: data.revelarPrecioClick || false
            };

            await updateDoc(doc(db, 'ofertas', id), updateData);
            alert('✅ Oferta actualizada');
            setEditingOffer(null);
            clearOfferFile();
            loadData();
        } catch (error) {
            console.error('Error:', error);
            if (!error.code) alert('Error al actualizar oferta');
        }
    };

    const handleExpireOffer = async (offerId) => {
        if (!confirm('¿Marcar esta oferta como expirada?')) return;

        try {
            await updateDoc(doc(db, 'ofertas', offerId), {
                estado: 'expirada',
                fechaExpiracion: Timestamp.now()
            });
            alert('⏰ Oferta marcada como expirada');
            loadData();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al expirar oferta');
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/admin/login');
    };

    const handleSeedOfertas = async () => {
        if (confirm('¿Seguro que querés generar ofertas de prueba en la base de datos?')) {
            const success = await seedOfertas();
            if (success) alert('Ofertas generadas correctamente');
            else alert('Hubo un error');
        }
    };

    const handleSeedNegocios = async () => {
        if (confirm('¿Seguro que querés cargar 4 negocios de prueba aprobados?')) {
            const success = await seedNegocios();
            if (success) {
                alert('✅ 4 negocios aprobados cargados! Refrescando...');
                loadData();
            } else {
                alert('❌ Hubo un error al cargar los negocios');
            }
        }
    };

    const handleSeedCampaign = async () => {
        if (!confirm('¿Querés cargar la campaña de prueba "Especial Pascua"?')) return;
        
        const testCampaign = {
            title: "Semana Santa al Toque",
            subtitle: "Las mejores roscas, huevos y combos para compartir en familia",
            accentColor: "#f97316",
            backgroundImage: "https://images.unsplash.com/photo-1612200644197-c3fac4af3e55?auto=format&fit=crop&w=800&q=80",
            offers: [
                {
                    id: "ss1",
                    businessName: "Panadería El Sol",
                    description: "Rosca de Pascua Premium – 500gr artesanal",
                    price: "$8.500",
                    whatsappLink: "https://wa.me/5493510000001",
                    imagen: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?w=400"
                },
                {
                    id: "ss2",
                    businessName: "Chocolatería Yofre",
                    description: "Huevo de Chocolate 15cm – Relleno",
                    price: "$6.200",
                    whatsappLink: "https://wa.me/5493510000002",
                    imagen: "https://images.unsplash.com/photo-1544927515-77f0d2382ef9?w=400"
                }
            ]
        };

        try {
            await setDoc(doc(db, 'campaigns', 'actual'), { ...testCampaign, lastUpdated: Timestamp.now() });
            alert('✅ Campaña de prueba cargada!');
            loadData();
        } catch (e) {
            alert('❌ Error: ' + e.message);
        }
    };



    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Cargando panel de administración...</p>
            </div>
        );
    }

    const filteredBusinesses = approvedBusinesses.filter(negocio =>
        negocio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        negocio.rubro?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPending = negociosPendientes.filter(negocio =>
        negocio.nombre?.toLowerCase().includes(searchTermPending.toLowerCase()) ||
        negocio.rubro?.toLowerCase().includes(searchTermPending.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>🔐 Panel de Administración</h1>
                    <div className={styles.userInfo}>

                        <button
                            onClick={() => setShowOfferModal(true)}
                            className={styles.seedBtn}
                            style={{
                                marginRight: '10px',
                                backgroundColor: '#FF4D4F',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            ➕ Crear Oferta
                        </button>
                        <button
                            onClick={handleSeedOfertas}
                            className={styles.seedBtn}
                            style={{
                                marginRight: '10px',
                                backgroundColor: '#F5A623',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            🌱 Seed Ofertas
                        </button>
                        <button
                            onClick={handleSeedNegocios}
                            className={styles.seedBtn}
                            style={{
                                marginRight: '10px',
                                backgroundColor: '#52C41A',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            🏪 Seed Negocios
                        </button>
                        <button
                            onClick={handleSeedCampaign}
                            className={styles.seedBtn}
                            style={{
                                marginRight: '10px',
                                backgroundColor: '#9C27B0',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            📅 Seed Campaña
                        </button>
                        <span>👤 {adminUser?.email}</span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* ... Stats Grid ... */}
            <div className={styles.statsGrid}>
                {/* ... existing stats ... */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.pendientes}</h3>
                        <p className={styles.statLabel}>Pendientes</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.aprobados}</h3>
                        <p className={styles.statLabel}>Aprobados</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>❌</div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.rechazados}</h3>
                        <p className={styles.statLabel}>Rechazados</p>
                    </div>
                </div>
            </div>

            {/* Panel de Estadísticas (Firebase) */}
            <AnalyticsPanel />

            {/* Lista de Negocios Pendientes */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>⏳ Negocios Pendientes de Aprobación</h2>

                {/* Buscador de Pendientes */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar en pendientes por nombre o rubro..."
                        value={searchTermPending}
                        onChange={(e) => setSearchTermPending(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>

                {negociosPendientes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>🎉 ¡No hay negocios pendientes!</p>
                    </div>
                ) : filteredPending.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>🔍 No se encontró ningún negocio pendiente con "{searchTermPending}"</p>
                    </div>
                ) : (
                    <div className={styles.negociosList}>
                        {filteredPending.map(negocio => (
                            <div key={negocio.id} className={styles.negocioCard}>
                                <div className={styles.negocioHeader}>
                                    <h3 className={styles.negocioNombre}>{negocio.nombre}</h3>
                                    <span className={styles.negocioRubro}>{negocio.rubro}</span>
                                </div>

                                <div className={styles.negocioInfo}>
                                    <p>📍 {negocio.direccion}</p>
                                    <p>📱 {negocio.whatsapp}</p>
                                    {negocio.imagen && (
                                        <p>🖼️ <a href={negocio.imagen} target="_blank" rel="noopener">Ver imagen</a></p>
                                    )}
                                    <p className={styles.fecha}>
                                        📅 {negocio.fechaCreacion?.toDate?.().toLocaleDateString() || 'N/A'}
                                    </p>
                                </div>

                                <div className={styles.negocioActions}>
                                    <button
                                        onClick={() => handleEdit(negocio)}
                                        className={styles.btnEdit}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleAprobar(negocio.id)}
                                        className={styles.btnAprobar}
                                    >
                                        ✅ Aprobar
                                    </button>
                                    <button
                                        onClick={() => handleRechazar(negocio.id)}
                                        className={styles.btnRechazar}
                                    >
                                        ❌ Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lista de Negocios Aprobados */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>✅ Negocios Activos</h2>

                {/* NEW: Search Input - STICKY */}
                <div style={{
                    position: 'sticky',
                    top: '80px', // Debajo del header principal
                    zIndex: 30,
                    backgroundColor: '#F3F4F6', // Mismo color de fondo para tapar el scroll
                    padding: '10px 0',
                    marginBottom: '10px'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar negocio por nombre o rubro..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {filteredBusinesses.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No hay negocios activos.</p>
                    </div>
                ) : (
                    <div className={styles.negociosList}>
                        {filteredBusinesses.map(negocio => (
                            <div key={negocio.id} className={styles.negocioCard}>
                                <div className={styles.negocioHeader}>
                                    <h3 className={styles.negocioNombre}>{negocio.nombre}</h3>
                                    <span className={styles.negocioRubro}>{negocio.rubro}</span>
                                </div>

                                <div className={styles.negocioInfo}>
                                    <p>📍 {negocio.direccion}</p>
                                    <p>📱 {negocio.whatsapp}</p>
                                    {negocio.imagen && (
                                        <p>🖼️ <a href={negocio.imagen} target="_blank" rel="noopener">Ver imagen</a></p>
                                    )}
                                </div>

                                <div className={styles.negocioActions}>
                                    <button
                                        onClick={() => handleEdit(negocio)}
                                        className={styles.btnEdit}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleRechazar(negocio.id)}
                                        className={styles.btnRechazar}
                                        title="Dar de baja / Rechazar"
                                    >
                                        ❌ Baja
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN: Ofertas Activas */}
            <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔥 Ofertas Activas
                </h2>

                {ofertas.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        borderRadius: '12px'
                    }}>
                        <p style={{ color: '#999', fontSize: '16px' }}>No hay ofertas activas aún</p>
                        <p style={{ color: '#ccc', fontSize: '14px', marginTop: '8px' }}>
                            Creá tu primera oferta usando el botón "➕ Crear Oferta"
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {ofertas.map(oferta => (
                            <div key={oferta.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                border: '1px solid #e5e5e5'
                            }}>
                                {/* Imagen */}
                                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                    <img
                                        src={oferta.imagen || oferta.imagenUrl || '/default-offer.png'}
                                        alt={oferta.titulo}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {oferta.descuento && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            backgroundColor: '#22c55e',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
                                        }}>
                                            {oferta.descuento}
                                        </div>
                                    )}
                                </div>

                                {/* Contenido */}
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>
                                        {oferta.titulo}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                        🏪 {oferta.negocioNombre}
                                    </p>

                                    {oferta.descripcion && (
                                        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', lineHeight: '1.4' }}>
                                            {oferta.descripcion.substring(0, 80)}{oferta.descripcion.length > 80 ? '...' : ''}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                                        <div>
                                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                                ${oferta.precioOriginal}
                                            </span>
                                            <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#22c55e', fontSize: '18px' }}>
                                                ${oferta.precioOferta}
                                            </span>
                                        </div>
                                    </div>

                                    {oferta.stock && (
                                        <p style={{ fontSize: '12px', color: '#f97316', marginBottom: '8px' }}>
                                            📦 Stock: {oferta.stock}
                                        </p>
                                    )}
                                    {oferta.vistas && (
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                            👁️ {oferta.vistas} vistas
                                        </p>
                                    )}

                                    {/* Botones */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                        <button
                                            onClick={() => handleEditOffer(oferta)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#0070f3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => handleExpireOffer(oferta.id)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#ff4d4f',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            ⏰ Expirar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN: CAMPAÑA MENSUAL DINÁMICA */}
            <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e5e5', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🌟 Campaña Mensual Principal
                </h2>
                <div className={styles.formGroup} style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 2 }}>
                        <label>Título Grande de la Campaña</label>
                        <input type="text" value={campaignData.title} onChange={e => setCampaignData({...campaignData, title: e.target.value})} placeholder="Ej: ¡Gran Venta de Otoño!" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Color de Acento (Hex)</label>
                        <input type="text" value={campaignData.accentColor} onChange={e => setCampaignData({...campaignData, accentColor: e.target.value})} placeholder="#db2777" />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Subtítulo / Bajada</label>
                    <input type="text" value={campaignData.subtitle} onChange={e => setCampaignData({...campaignData, subtitle: e.target.value})} placeholder="Corto y persuasivo..." />
                </div>
                <div className={styles.formGroup}>
                    <label>Imagen de Fondo (Banner Principal)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            style={{ flex: 1 }}
                            value={campaignData.backgroundImage} 
                            onChange={e => setCampaignData({...campaignData, backgroundImage: e.target.value})} 
                            placeholder="https://cloudinary.com/..." 
                        />
                        <button 
                            type="button"
                            onClick={() => openCloudinaryWidget((url) => setCampaignData({...campaignData, backgroundImage: url}))}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '0 15px', 
                                backgroundColor: '#059669', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '13px'
                            }}
                        >
                            <UploadCloud size={18} />
                            Subir
                        </button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #f3f4f6' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>Ofertas o Productos de la Campaña ({campaignData.offers.length})</h3>
                    <button type="button" onClick={() => {
                        const newOffer = { id: Date.now().toString(), businessName: '', description: '', price: '', whatsappLink: '', imagen: '' };
                        setCampaignData({...campaignData, offers: [...campaignData.offers, newOffer]});
                    }} style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #bfdbfe' }}>
                        + Añadir Casillero
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {campaignData.offers.map((off, index) => (
                        <div key={off.id} style={{ display: 'flex', gap: '10px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #d1d5db', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>Nombre de Local</label>
                                <input type="text" placeholder="Ej: Pastelería Doña Rosa" value={off.businessName} onChange={e => {
                                    const nextOffers = campaignData.offers.map((o, i) => i === index ? { ...o, businessName: e.target.value } : o);
                                    setCampaignData({ ...campaignData, offers: nextOffers });
                                }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }} />
                            </div>
                            
                            <div style={{ flex: 2, minWidth: '200px' }}>
                                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>Descripción / Título Oferta</label>
                                <input type="text" placeholder="Ej: Torta especial matera" value={off.description} onChange={e => {
                                    const nextOffers = campaignData.offers.map((o, i) => i === index ? { ...o, description: e.target.value } : o);
                                    setCampaignData({ ...campaignData, offers: nextOffers });
                                }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }} />
                            </div>

                            <div style={{ flex: 0.8, minWidth: '100px' }}>
                                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>Precio / Descuento</label>
                                <input type="text" placeholder="Ej: $15.000" value={off.price} onChange={e => {
                                    const nextOffers = campaignData.offers.map((o, i) => i === index ? { ...o, price: e.target.value } : o);
                                    setCampaignData({ ...campaignData, offers: nextOffers });
                                }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }} />
                            </div>

                            <div style={{ flex: 1.5, minWidth: '180px' }}>
                                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>WhatsApp Link Full</label>
                                <input type="text" placeholder="https://wa.me/..." value={off.whatsappLink || ''} onChange={e => {
                                    const nextOffers = campaignData.offers.map((o, i) => i === index ? { ...o, whatsappLink: e.target.value } : o);
                                    setCampaignData({ ...campaignData, offers: nextOffers });
                                }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }} />
                            </div>

                            <div style={{ flex: 1.5, minWidth: '180px' }}>
                                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>Imagen Producto</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input type="text" placeholder="URL Imagen" value={off.imagen || ''} onChange={e => {
                                        const nextOffers = campaignData.offers.map((o, i) => i === index ? { ...o, imagen: e.target.value } : o);
                                        setCampaignData({ ...campaignData, offers: nextOffers });
                                    }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }} />
                                    <button 
                                        type="button" 
                                        onClick={() => openCloudinaryWidget((url) => {
                                            const nextOffers = campaignData.offers.map((o, i) => i === index ? { ...o, imagen: url } : o);
                                            setCampaignData({ ...campaignData, offers: nextOffers });
                                        })}
                                        style={{ backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', padding: '0 8px', cursor: 'pointer' }}
                                    >
                                        <UploadCloud size={16} />
                                    </button>
                                </div>
                            </div>

                            <button type="button" onClick={() => {
                                if(confirm("¿Seguro que querés quitar esta oferta de la lista?")) {
                                    const newOff = campaignData.offers.filter(o => o.id !== off.id);
                                    setCampaignData({...campaignData, offers: newOff});
                                }
                            }} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', border: 'none', height: '36px', marginTop: '20px' }}>
                                🗑️
                            </button>
                        </div>
                    ))}
                    {campaignData.offers.length === 0 && (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No hay ninguna oferta cargada. Añadí el primer casillero arriba.</p>
                    )}
                </div>

                <button type="button" disabled={isSavingCampaign} onClick={async () => {
                    if (isSavingCampaign) return;
                    setIsSavingCampaign(true);
                    console.log("💾 Guardando campaña:", campaignData);
                    try {
                        const docRef = doc(db, 'campaigns', 'actual');
                        // Limpiar campos que no deben guardarse
                        const { id, lastUpdated, ...cleanData } = campaignData;
                        const dataToSave = {
                            title: cleanData.title || '',
                            subtitle: cleanData.subtitle || '',
                            backgroundImage: cleanData.backgroundImage || '',
                            accentColor: cleanData.accentColor || '#db2777',
                            offers: (cleanData.offers || []).map(o => ({
                                id: o.id || Date.now().toString(),
                                businessName: o.businessName || '',
                                description: o.description || '',
                                price: o.price || '',
                                whatsappLink: o.whatsappLink || '',
                                imagen: o.imagen || ''
                            })),
                            lastUpdated: Timestamp.now()
                        };
                        console.log("💾 Datos limpios a guardar:", JSON.stringify(dataToSave, null, 2));
                        // setDoc SIN merge para sobrescribir completamente el documento
                        await setDoc(docRef, dataToSave);
                        alert('✅ ¡Campaña guardada y publicada en vivo!');
                    } catch(e) { 
                        console.error("Error al guardar campaña:", e);
                        alert('❌ Error al guardar. ' + e.message); 
                    } finally {
                        setIsSavingCampaign(false);
                    }
                }} style={{ marginTop: '24px', padding: '16px 24px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    {isSavingCampaign ? <div className={styles.spinner} style={{width: '20px', height: '20px'}}></div> : '💾 Publicar / Guardar Campaña en Vivo'}
                </button>
            </div>



            {/* Modal de Edición de Oferta */}
            {editingOffer && (
                <div className={styles.modal}>
                    <div className={styles.modalContent} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>✏️ Editar Oferta</h2>

                        <div className={styles.formGroup}>
                            <label>Título de la Oferta</label>
                            <input
                                type="text"
                                value={editingOffer.titulo || ''}
                                onChange={(e) => setEditingOffer({ ...editingOffer, titulo: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>📝 Descripción</label>
                            <textarea
                                value={editingOffer.descripcion || ''}
                                onChange={(e) => setEditingOffer({ ...editingOffer, descripcion: e.target.value })}
                                placeholder="Detalles del beneficio..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label>Precio Original</label>
                                <input
                                    type="number"
                                    value={editingOffer.precioOriginal || ''}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, precioOriginal: e.target.value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Precio Oferta</label>
                                <input
                                    type="number"
                                    value={editingOffer.precioOferta || ''}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, precioOferta: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>💯 Descuento Calculado</label>
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '10px',
                                border: '2px solid #0ea5e9',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#0369a1',
                                textAlign: 'center'
                            }}>
                                {editingOffer.precioOriginal && editingOffer.precioOferta && Number(editingOffer.precioOriginal) > 0
                                    ? `${Math.round(((Number(editingOffer.precioOriginal) - Number(editingOffer.precioOferta)) / Number(editingOffer.precioOriginal)) * 100)}% OFF`
                                    : '- %'
                                }
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ display: 'flex', gap: '15px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '2px solid #0070f3', marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                                <input
                                    type="checkbox"
                                    checked={editingOffer.destacada || false}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, destacada: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <span style={{ fontWeight: 'bold', color: '#f97316' }}>🔥 Destacada</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                                <input
                                    type="checkbox"
                                    checked={editingOffer.revelarPrecioClick || false}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, revelarPrecioClick: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <span style={{ fontWeight: 'bold', color: '#0070f3' }}>👁️ Ocultar precio</span>
                            </label>
                        </div>



                        <div className={styles.formGroup} style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label>📦 Stock</label>
                                <input
                                    type="number"
                                    value={editingOffer.stock || ''}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, stock: e.target.value })}
                                    min="0"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>👁️ Vistas</label>
                                <input
                                    type="number"
                                    value={editingOffer.vistas || '0'}
                                    onChange={(e) => setEditingOffer({ ...editingOffer, vistas: e.target.value })}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>WhatsApp</label>
                            <input
                                type="text"
                                value={editingOffer.whatsapp || ''}
                                onChange={(e) => setEditingOffer({ ...editingOffer, whatsapp: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Imagen</label>

                            {/* Toggle Botones */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setOfferImageMode('upload'); clearOfferFile(); }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: offerImageMode === 'upload' ? '2px solid #FF4D4F' : '2px solid #e5e5e5',
                                        backgroundColor: offerImageMode === 'upload' ? '#fff1f0' : '#ffffff',
                                        color: offerImageMode === 'upload' ? '#FF4D4F' : '#666666',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ImagePlus size={20} />
                                    Subir foto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setOfferImageMode('url'); clearOfferFile(); }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: offerImageMode === 'url' ? '2px solid #FF4D4F' : '2px solid #e5e5e5',
                                        backgroundColor: offerImageMode === 'url' ? '#fff1f0' : '#ffffff',
                                        color: offerImageMode === 'url' ? '#FF4D4F' : '#666666',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <LinkIcon size={20} />
                                    Usar enlace
                                </button>
                            </div>

                            {/* Opción 1: Subir Archivo */}
                            {offerImageMode === 'upload' && (
                                <div>
                                    {!offerPreviewUrl ? (
                                        <div
                                            onClick={() => offerFileInputRef.current?.click()}
                                            style={{
                                                border: '2px dashed #e5e5e5',
                                                borderRadius: '12px',
                                                padding: '32px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: '#fafafa',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fff1f0';
                                                e.currentTarget.style.borderColor = '#FF4D4F';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fafafa';
                                                e.currentTarget.style.borderColor = '#e5e5e5';
                                            }}
                                        >
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                backgroundColor: '#fff1f0',
                                                color: '#FF4D4F',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 12px'
                                            }}>
                                                <ImagePlus size={24} />
                                            </div>
                                            <p style={{ color: '#4a4a4a', fontWeight: '500', marginBottom: '4px' }}>Click para elegir una foto</p>
                                            <p style={{ fontSize: '13px', color: '#999' }}>PNG, JPG hasta 5MB</p>
                                            <input
                                                type="file"
                                                ref={offerFileInputRef}
                                                onChange={handleOfferFileChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                                            <img
                                                src={offerPreviewUrl}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px'
                                            }}>
                                                <button
                                                    type="button"
                                                    onClick={clearOfferFile}
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                                        color: '#ff4d4f',
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontWeight: 'bold',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                    }}
                                                >
                                                    <X size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Opción 2: URL */}
                            {offerImageMode === 'url' && (
                                <div>
                                    <input
                                        type="text"
                                        value={editingOffer.imagen || editingOffer.imagenUrl || ''}
                                        onChange={(e) => setEditingOffer({ ...editingOffer, imagen: e.target.value })}
                                        placeholder="URL de la imagen"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e5e5',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginLeft: '4px' }}>
                                        Pegá aquí el enlace de una imagen externa
                                    </p>
                                </div>
                            )}

                            {/* Process Indicator */}
                            {isCompressing && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#eff6ff',
                                    borderRadius: '8px',
                                    marginTop: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <div className={styles.spinner}></div>
                                    <p style={{ color: '#2563eb', fontSize: '14px', margin: 0, fontWeight: '500' }}>
                                        ⚙️ Optimizando imagen...
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={handleUpdateOffer} className={styles.btnSave}>
                                💾 Guardar Cambios
                            </button>
                            <button onClick={() => setEditingOffer(null)} className={styles.btnCancel}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {editingNegocio && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>✏️ Editar Negocio</h2>

                        <div className={styles.formGroup}>
                            <label>Nombre del negocio</label>
                            <input
                                type="text"
                                value={editingNegocio.nombre}
                                onChange={(e) => setEditingNegocio({ ...editingNegocio, nombre: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Rubro Principal</label>
                            <select
                                value={
                                    // Intenta detectar la categoría principal del string guardado
                                    // Detecta categoría (incluyendo soporte para legacy 'Salud y Belleza' y 'Ropa / Calzado')
                                    editingNegocio.rubro?.includes('Salud y Belleza') ? 'Salud / Belleza / Bienestar' :
                                        (editingNegocio.rubro?.includes('Ropa / Calzado') || editingNegocio.rubro?.includes('Ropa y Calzado')) ? 'Ropa y Calzado' :
                                            ['Gastronomía', 'Servicios', 'Ropa y Calzado', 'Salud / Belleza / Bienestar', 'Hogar y Automotor', 'Negocios del Barrio', 'Comercios'].find(c => editingNegocio.rubro?.includes(c)) || editingNegocio.rubro
                                }
                                onChange={(e) => {
                                    const cat = e.target.value;
                                    setEditingNegocio({ ...editingNegocio, rubro: cat });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    marginBottom: '10px'
                                }}
                            >
                                <option value="">Seleccionar Categoría...</option>
                                <option value="Gastronomía">Gastronomía</option>
                                <option value="Servicios">Servicios</option>
                                <option value="Ropa / Calzado">Ropa / Calzado</option>
                                <option value="Salud / Belleza / Bienestar">Salud / Belleza / Bienestar</option>
                                <option value="Hogar y Automotor">Hogar y Automotor</option>
                                <option value="Negocios del Barrio">Negocios del Barrio</option>
                            </select>

                            {/* Selección Dinámica de Subcategorías */}
                            {(() => {
                                // Detectar la categoría actual basada en editingNegocio.rubro
                                const rubroText = editingNegocio.rubro || '';
                                const currentCategoryName = rubroText.includes('Salud y Belleza') ? 'Salud / Belleza / Bienestar' :
                                    (rubroText.includes('Ropa / Calzado') || rubroText.includes('Ropa y Calzado')) ? 'Ropa / Calzado' :
                                    ['Gastronomía', 'Servicios', 'Hogar y Automotor', 'Negocios del Barrio', 'Comercios'].find(c => rubroText.includes(c)) || rubroText;
                                
                                const selectedCategoryName = currentCategoryName === 'Comercios' ? 'Negocios del Barrio' : currentCategoryName;
                                const selectedCategory = categories.find(c => c.name === selectedCategoryName);
                                
                                if (!selectedCategory || !selectedCategory.subcategories || selectedCategory.subcategories.length === 0) return null;

                                const currentSub = rubroText.includes(' - ') ? rubroText.split(' - ')[1] : '';

                                return (
                                    <div style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: '2px solid #eee' }}>
                                        <label style={{ fontSize: '12px', color: '#666' }}>Especialidad ({selectedCategory.name})</label>
                                        <select
                                            value={currentSub}
                                            onChange={(e) => {
                                                const sub = e.target.value;
                                                setEditingNegocio({ ...editingNegocio, rubro: sub ? `${selectedCategory.name} - ${sub}` : selectedCategory.name });
                                            }}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }}
                                        >
                                            <option value="">Seleccionar especialidad...</option>
                                            {selectedCategory.subcategories.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className={styles.formGroup}>
                            <label>WhatsApp</label>
                            <input
                                type="text"
                                value={editingNegocio.whatsapp}
                                onChange={(e) => setEditingNegocio({ ...editingNegocio, whatsapp: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Dirección</label>
                            <input
                                type="text"
                                value={editingNegocio.direccion}
                                onChange={(e) => setEditingNegocio({ ...editingNegocio, direccion: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Sobre nosotros (Descripción)</label>
                            <textarea
                                value={editingNegocio.descripcion || ''}
                                onChange={(e) => setEditingNegocio({ ...editingNegocio, descripcion: e.target.value })}
                                rows={4}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e5e5', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="Breve descripción del negocio (historia, servicios, etc.)"
                            />
                        </div>

                        <div className={styles.formGroup} style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                            <MediaUpload
                                initialMedia={editingNegocio.media || []}
                                onUploadComplete={(media) => setEditingNegocio(prev => ({ ...prev, media }))}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Imagen Principal (Alternativa si no usás la galería)</label>

                            {/* Toggle Botones */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setImageMode('upload'); clearFile(); }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: imageMode === 'upload' ? '2px solid #0070f3' : '2px solid #e5e5e5',
                                        backgroundColor: imageMode === 'upload' ? '#eff6ff' : '#ffffff',
                                        color: imageMode === 'upload' ? '#0070f3' : '#666666',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ImagePlus size={20} />
                                    Subir foto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setImageMode('url'); clearFile(); }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: imageMode === 'url' ? '2px solid #0070f3' : '2px solid #e5e5e5',
                                        backgroundColor: imageMode === 'url' ? '#eff6ff' : '#ffffff',
                                        color: imageMode === 'url' ? '#0070f3' : '#666666',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <LinkIcon size={20} />
                                    Usar enlace
                                </button>
                            </div>

                            {/* Opción 1: Subir Archivo */}
                            {imageMode === 'upload' && (
                                <div>
                                    {!previewUrl ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                border: '2px dashed #e5e5e5',
                                                borderRadius: '12px',
                                                padding: '32px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: '#fafafa',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                                                e.currentTarget.style.borderColor = '#999';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fafafa';
                                                e.currentTarget.style.borderColor = '#e5e5e5';
                                            }}
                                        >
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                backgroundColor: '#eff6ff',
                                                color: '#0070f3',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 12px'
                                            }}>
                                                <ImagePlus size={24} />
                                            </div>
                                            <p style={{ color: '#4a4a4a', fontWeight: '500', marginBottom: '4px' }}>Click para elegir una foto</p>
                                            <p style={{ fontSize: '13px', color: '#999' }}>PNG, JPG hasta 5MB</p>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px'
                                            }}>
                                                <button
                                                    type="button"
                                                    onClick={clearFile}
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                                        color: '#ff4d4f',
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontWeight: 'bold',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                    }}
                                                >
                                                    <X size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Opción 2: URL */}
                            {imageMode === 'url' && (
                                <div>
                                    <input
                                        type="text"
                                        value={editingNegocio.imagen || ''}
                                        onChange={(e) => setEditingNegocio({ ...editingNegocio, imagen: e.target.value })}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e5e5',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginLeft: '4px' }}>
                                        Pegá aquí el enlace de una imagen externa
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Proceso de carga/optimización */}
                        {isCompressing && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#eff6ff',
                                borderRadius: '8px',
                                marginTop: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div className={styles.spinner}></div>
                                <p style={{ color: '#2563eb', fontSize: '14px', margin: 0, fontWeight: '500' }}>
                                    ⚙️ Optimizando y subiendo imagen...
                                </p>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button onClick={handleSaveEdit} className={styles.btnSave}>
                                💾 Guardar
                            </button>
                            <button onClick={() => setEditingNegocio(null)} className={styles.btnCancel}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Crear Oferta */}
            {showOfferModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>🔥 Nueva Oferta</h2>

                        <form onSubmit={handleCreateOffer}>
                            <div className={styles.formGroup}>
                                <label>Negocio</label>
                                <select
                                    value={offerData.negocioId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const business = approvedBusinesses.find(b => b.id === selectedId);
                                        setOfferData({
                                            ...offerData,
                                            negocioId: selectedId,
                                            whatsapp: business ? business.whatsapp : '' // Auto-fill whatsapp
                                        });
                                    }}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <option value="">Seleccionar Negocio...</option>
                                    {approvedBusinesses
                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                        .map(b => (
                                            <option key={b.id} value={b.id}>{b.nombre} ({b.rubro})</option>
                                        ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>WhatsApp para la Oferta</label>
                                <input
                                    type="text"
                                    placeholder="Ej. 5493515555555"
                                    value={offerData.whatsapp || ''}
                                    onChange={(e) => setOfferData({ ...offerData, whatsapp: e.target.value })}
                                    required
                                />
                                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                                    Se usará para el botón "Aprovechar"
                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Título de la Oferta</label>
                                <input
                                    type="text"
                                    placeholder="Ej. 2x1 en Lomitos"
                                    value={offerData.titulo}
                                    onChange={(e) => setOfferData({ ...offerData, titulo: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup} style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Precio Original</label>
                                    <input
                                        type="number"
                                        placeholder="12000"
                                        value={offerData.precioOriginal}
                                        onChange={(e) => setOfferData({ ...offerData, precioOriginal: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Precio Oferta</label>
                                    <input
                                        type="number"
                                        placeholder="6000"
                                        value={offerData.precioOferta}
                                        onChange={(e) => setOfferData({ ...offerData, precioOferta: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>💯 Descuento (Automático)</label>
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: '10px',
                                        border: '2px solid #0ea5e9',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#0369a1',
                                        textAlign: 'center',
                                        minHeight: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {offerData.precioOriginal && offerData.precioOferta && Number(offerData.precioOriginal) > 0
                                            ? `${Math.round(((Number(offerData.precioOriginal) - Number(offerData.precioOferta)) / Number(offerData.precioOriginal)) * 100)}% OFF`
                                            : '- %'
                                        }
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '6px', textAlign: 'center' }}>
                                        Se calcula automáticamente
                                    </p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Días de Validez</label>
                                    <input
                                        type="number"
                                        value={offerData.diasValidez}
                                        onChange={(e) => setOfferData({ ...offerData, diasValidez: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ display: 'flex', gap: '15px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '2px solid #0070f3', marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                                    <input
                                        type="checkbox"
                                        checked={offerData.destacada || false}
                                        onChange={(e) => setOfferData({ ...offerData, destacada: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <span style={{ fontWeight: 'bold', color: '#f97316' }}>🔥 Destacada</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                                    <input
                                        type="checkbox"
                                        checked={offerData.revelarPrecioClick || false}
                                        onChange={(e) => setOfferData({ ...offerData, revelarPrecioClick: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <span style={{ fontWeight: 'bold', color: '#0070f3' }}>👁️ Ocultar precio</span>
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>📝 Descripción de la Oferta</label>
                                <textarea
                                    value={offerData.descripcion}
                                    onChange={(e) => setOfferData({ ...offerData, descripcion: e.target.value })}
                                    placeholder="Detalles del beneficio, qué incluye, condiciones..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e5e5',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div className={styles.formGroup} style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>📦 Stock Disponible (opcional)</label>
                                    <input
                                        type="number"
                                        value={offerData.stock}
                                        onChange={(e) => setOfferData({ ...offerData, stock: e.target.value })}
                                        placeholder="Ej: 10"
                                        min="0"
                                    />
                                    <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                        ⚠️ Si es ≤ 5, muestra badge de urgencia
                                    </p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>👁️ Vistas Iniciales</label>
                                    <input
                                        type="number"
                                        value={offerData.vistas}
                                        onChange={(e) => setOfferData({ ...offerData, vistas: e.target.value })}
                                        placeholder="Ej: 12"
                                        min="0"
                                    />
                                    <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                        Para barra de calor (cada 3 vistas = 1 nivel)
                                    </p>
                                </div>
                            </div>




                            <div className={styles.formGroup}>
                                <label>Imagen de la Oferta (Opcional)</label>

                                {/* Toggle Botones */}
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setOfferImageMode('upload'); clearOfferFile(); }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: offerImageMode === 'upload' ? '2px solid #FF4D4F' : '2px solid #e5e5e5',
                                            backgroundColor: offerImageMode === 'upload' ? '#fff1f0' : '#ffffff',
                                            color: offerImageMode === 'upload' ? '#FF4D4F' : '#666666',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <ImagePlus size={20} />
                                        Subir foto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setOfferImageMode('url'); clearOfferFile(); }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: offerImageMode === 'url' ? '2px solid #FF4D4F' : '2px solid #e5e5e5',
                                            backgroundColor: offerImageMode === 'url' ? '#fff1f0' : '#ffffff',
                                            color: offerImageMode === 'url' ? '#FF4D4F' : '#666666',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <LinkIcon size={20} />
                                        Usar enlace
                                    </button>
                                </div>

                                {/* Opción 1: Subir Archivo */}
                                {offerImageMode === 'upload' && (
                                    <div>
                                        {!offerPreviewUrl ? (
                                            <div
                                                onClick={() => offerFileInputRef.current?.click()}
                                                style={{
                                                    border: '2px dashed #e5e5e5',
                                                    borderRadius: '12px',
                                                    padding: '32px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: '#fafafa',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fff1f0';
                                                    e.currentTarget.style.borderColor = '#FF4D4F';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                                    e.currentTarget.style.borderColor = '#e5e5e5';
                                                }}
                                            >
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    backgroundColor: '#fff1f0',
                                                    color: '#FF4D4F',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 12px'
                                                }}>
                                                    <ImagePlus size={24} />
                                                </div>
                                                <p style={{ color: '#4a4a4a', fontWeight: '500', marginBottom: '4px' }}>Click para elegir una foto</p>
                                                <p style={{ fontSize: '13px', color: '#999' }}>PNG, JPG hasta 5MB</p>
                                                <input
                                                    type="file"
                                                    ref={offerFileInputRef}
                                                    onChange={handleOfferFileChange}
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                                                <img
                                                    src={offerPreviewUrl}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px'
                                                }}>
                                                    <button
                                                        type="button"
                                                        onClick={clearOfferFile}
                                                        style={{
                                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                                            color: '#ff4d4f',
                                                            padding: '8px 16px',
                                                            borderRadius: '20px',
                                                            fontWeight: 'bold',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '13px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                        }}
                                                    >
                                                        <X size={16} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Opción 2: URL */}
                                {offerImageMode === 'url' && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={offerData.imagenUrl}
                                            onChange={(e) => setOfferData({ ...offerData, imagenUrl: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                border: '1px solid #e5e5e5',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', marginLeft: '4px' }}>
                                            Pegá aquí el enlace de una imagen externa
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    id="btn-publicar-oferta"
                                    onClick={handleCreateOffer}
                                    className={styles.btnSave}
                                    style={{ backgroundColor: '#FF4D4F' }}
                                >
                                    🔥 Publicar
                                </button>
                                <button type="button" onClick={() => setShowOfferModal(false)} className={styles.btnCancel}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
