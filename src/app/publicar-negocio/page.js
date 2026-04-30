'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { categories } from '@/data/categories';
import MediaUpload from '@/components/publicar-negocio/MediaUpload';

export default function PublicarNegocioPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        rubro: '',
        subrubro: '',
        whatsapp: '',
        direccion: '',
        media: [] // New field for Cloudinary uploads
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rubro') {
            setFormData({
                ...formData,
                rubro: value,
                subrubro: '' // Reset subcategory when category changes
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct final rubro string: "Category - Subcategory" or just "Category"
            const rubroFinal = formData.subrubro
                ? `${formData.rubro} - ${formData.subrubro}`
                : formData.rubro;

            const finalData = {
                nombre: formData.nombre,
                rubro: rubroFinal,
                imagen: formData.media.length > 0 ? formData.media.find(m => m.type === 'image')?.url || formData.media[0].url : '',
                media: formData.media, // All images and videos
                whatsapp: formData.whatsapp,
                direccion: formData.direccion,
                estado: "pendiente",
                fechaCreacion: new Date(),
            };

            await addDoc(collection(db, "negocios"), finalData);

            setSubmitted(true);
            setFormData({ nombre: '', rubro: '', subrubro: '', whatsapp: '', direccion: '', media: [] });

        } catch (error) {
            console.error("Error al guardar:", error);
            alert('Hubo un error al enviar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-[#FFFDF7] py-8 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-[24px] shadow-sm text-center border border-orange-100">
                    <div className="text-6xl mb-6 animate-bounce-slow">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Solicitud Enviada!</h2>
                    <p className="text-lg text-gray-600 mb-2">
                        Nos pondremos en contacto con <strong>{formData.nombre}</strong> para la activación.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full mt-6 bg-[#0070f3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                    >
                        Cargar otro negocio
                    </button>
                </div>
            </main>
        );
    }

    // Get subcategories for selected category
    const selectedCategory = categories.find(cat => cat.name === formData.rubro);
    const subcategories = selectedCategory?.subcategories || [];

    return (
        <main className="min-h-screen bg-[#FFFDF7] pb-12">


            {/* Header / Banner */}
            <div className="max-w-[680px] mx-auto bg-[#FFF0E6] py-10 px-4 text-center border-b border-orange-100/50 rounded-[40px] mt-[118px]" style={{ marginBottom: '50px' }}>
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#F5A623] mb-6 leading-tight tracking-tight">
                        ¡Hacé crecer tu negocio en el barrio!
                    </h1>
                    <p className="text-[#4A4A4A] text-[19px] leading-relaxed font-medium mb-4">
                        Conectá con vecinos listos para comprarte.
                    </p>
                    <p className="text-[#2D2D2D] text-[17px] font-bold leading-relaxed mb-6">
                        Activación mediante <span className="text-[#F5A623]">plan mensual accesible</span>.<br/>
                        Sin comisiones ni intermediarios.
                    </p>
                    <div className="text-4xl animate-bounce-slow">🚀</div>
                </div>
            </div>

            {/* Contenedor del Formulario y Pasos */}
            <div className="w-full px-5 py-10" style={{ maxWidth: '480px', margin: '0 auto' }}>

                {/* Pasos */}
                <div className="pl-2" style={{ marginBottom: '60px' }}>
                    <div className="flex items-start gap-4" style={{ marginBottom: '32px' }}>
                        <span className="text-[32px] leading-none filter drop-shadow-sm select-none">👀</span>
                        <div className="pt-1.5">
                            <h3 className="text-[17px] font-bold text-[#2D2D2D] mb-1">1. Más visibilidad</h3>
                            <p className="text-[#6B6B6B] text-[14px] leading-relaxed">
                                Los vecinos ven tu negocio al buscar en la app.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4" style={{ marginBottom: '32px' }}>
                        <span className="text-[32px] leading-none filter drop-shadow-sm select-none">💬</span>
                        <div className="pt-1.5">
                            <h3 className="text-[17px] font-bold text-[#2D2D2D] mb-1">2. Más consultas por WhatsApp</h3>
                            <p className="text-[#6B6B6B] text-[14px] leading-relaxed">
                                Recibís pedidos o consultas directo a tu celular.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <span className="text-[32px] leading-none filter drop-shadow-sm select-none">🤝</span>
                        <div className="pt-1.5">
                            <h3 className="text-[17px] font-bold text-[#2D2D2D] mb-1">3. Más ventas reales</h3>
                            <p className="text-[#6B6B6B] text-[14px] leading-relaxed">
                                Cerrás la venta vos mismo, te quedas con el 100%.
                            </p>
                        </div>
                    </div>
                </div >

                {/* Form Section */}
                < div className="text-center mb-10" >
                    <h2 className="text-[28px] font-bold text-[#2D2D2D] mb-3">¡Empezá ahora!</h2>
                    <p className="text-[#6B6B6B] text-lg">Completá estos datos básicos:</p>
                </div >

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[15px] font-bold text-[#4A4A4A] mb-2.5">
                            Nombre del negocio
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Ej. Verdulería El Pepe"
                            className="w-full p-[18px] bg-white border border-[#E5E5E5] rounded-[20px] outline-none focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/10 transition-all text-[#2D2D2D] placeholder-[#A0A0A0] text-lg shadow-sm"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[15px] font-bold text-[#4A4A4A] mb-2.5">
                                Rubro Principal
                            </label>
                            <select
                                name="rubro"
                                value={formData.rubro}
                                onChange={handleChange}
                                className="w-full p-[18px] bg-white border border-[#E5E5E5] rounded-[20px] outline-none focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/10 transition-all text-[#2D2D2D] text-lg shadow-sm appearance-none"
                                required
                            >
                                <option value="">Seleccionar Rubro...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {formData.rubro && subcategories.length > 0 && (
                            <div className="animate-fade-in">
                                <label className="block text-[15px] font-bold text-[#4A4A4A] mb-2.5">
                                    Especialidad o Subrubro
                                </label>
                                <select
                                    name="subrubro"
                                    value={formData.subrubro}
                                    onChange={handleChange}
                                    className="w-full p-[18px] bg-white border border-[#E5E5E5] rounded-[20px] outline-none focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/10 transition-all text-[#2D2D2D] text-lg shadow-sm appearance-none"
                                >
                                    <option value="">Seleccionar especialidad (opcional)...</option>
                                    {subcategories.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>



                    <div>
                        <label className="block text-[15px] font-bold text-[#4A4A4A] mb-2.5">
                            WhatsApp
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🇦🇷</span>
                            <input
                                type="tel"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="351 123 4567"
                                className="w-full p-[18px] pl-16 bg-white border border-[#E5E5E5] rounded-[20px] outline-none focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/10 transition-all text-[#2D2D2D] placeholder-[#A0A0A0] text-lg shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[15px] font-bold text-[#4A4A4A] mb-2.5">
                            Dirección
                        </label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Ej. Yofre Norte"
                            className="w-full p-[18px] bg-white border border-[#E5E5E5] rounded-[20px] outline-none focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/10 transition-all text-[#2D2D2D] placeholder-[#A0A0A0] text-lg shadow-sm"
                            required
                        />
                    </div>

                    {/* Image / Video Upload */}
                    <MediaUpload
                        initialMedia={formData.media}
                        onUploadComplete={(media) => setFormData(prev => ({ ...prev, media }))}
                    />

                    {/* Botón Publicar - Con margen inferior grande explícito */}
                    <div style={{ marginTop: '50px', marginBottom: '80px', paddingBottom: '20px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0070f3] hover:bg-[#0060df] text-white font-bold py-[18px] rounded-[20px] shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] transform active:scale-[0.98] transition-all text-[18px] disabled:opacity-50"
                            style={{ color: '#ffffff' }}
                        >
                            {loading ? 'Enviando...' : 'Activar mi negocio'}
                        </button>
                    </div>
                </form>
            </div >
        </main >
    );
}
