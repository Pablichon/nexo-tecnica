'use client';

import { useEffect, useRef, useState } from 'react';

export default function MediaUpload({ onUploadComplete, initialMedia = [] }) {
    const [mediaList, setMediaList] = useState(initialMedia);
    const widgetRef = useRef(null);
    const cloudinaryRef = useRef(null);

    useEffect(() => {
        // Load Cloudinary script dynamically
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.async = true;
        script.onload = () => {
            cloudinaryRef.current = window.cloudinary;
            
            // Initialization of the widget
            widgetRef.current = cloudinaryRef.current.createUploadWidget(
                {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'TU_CLOUD_NAME',
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'TU_PRESET',
                    folder: 'negocios_yofre',
                    clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp', 'mp4', 'mov'],
                    maxFileSize: 20000000, // 20MB limit
                    multiple: true,
                    sources: ['local', 'url', 'camera'],
                    text: {
                        es: {
                            or: "O",
                            menu: {
                                files: "Mis archivos",
                                camera: "Cámara",
                                url: "Desde una URL"
                            },
                            local: {
                                browse: "Buscar en mi equipo",
                                dd_title_single: "Arrastrá la imagen acá",
                                dd_title_multi: "Arrastrá las imágenes acá",
                                drop_title_single: "Soltala para subir",
                                drop_title_multi: "Soltalas para subir"
                            },
                            camera: {
                                capture: "Capturar",
                                cancel: "Cancelar",
                                take_pic: "Tomar foto",
                                explanation: "Asegurate que la cámara esté bien iluminada"
                            },
                            url: {
                                inner_title: "Copiá el link directo de la imagen acá",
                                input_placeholder: "http://sitio.com/imagen.jpg",
                                submit: "Cargar"
                            },
                            crop: {
                                title: "Recortar imagen",
                                crop_btn: "Hecho",
                                skip_btn: "Omitir",
                                reset_btn: "Resetear",
                                close_btn: "Cerrar",
                                close_prompt: "Al cerrar se cancelará la subida, ¿querés continuar?"
                            },
                            queue: {
                                title: "Cargando archivos",
                                title_uploading_with_counter: "Cargando {{count}} archivo(s)",
                                abort_all: "Cancelar todo",
                                done: "Listo",
                                statuses: {
                                    uploading: "Subiendo...",
                                    error: "Error",
                                    timeout: "Tiempo agotado",
                                    aborted: "Cancelado",
                                    uploader_error: "Error del servidor"
                                }
                            }
                        }
                    },
                    language: 'es'
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        console.log('Upload success:', result.info);
                        const newMedia = {
                            url: result.info.secure_url,
                            type: result.info.resource_type, // 'image' or 'video'
                            public_id: result.info.public_id
                        };
                        
                        setMediaList(prev => {
                            const updated = [...prev, newMedia];
                            onUploadComplete(updated);
                            return updated;
                        });
                    }
                }
            );
        };
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const openWidget = () => {
        if (widgetRef.current) {
            widgetRef.current.open();
        } else {
            alert('Cloudinary no se cargó correctamente aún. Intentá de nuevo secundos después.');
        }
    };

    const removeMedia = (index) => {
        const updated = mediaList.filter((_, i) => i !== index);
        setMediaList(updated);
        onUploadComplete(updated);
    };

    return (
        <div className="space-y-4">
            <label className="block text-[15px] font-bold text-[#4A4A4A] mb-2.5">
                Fotos y Videos del Negocio
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaList.map((item, index) => (
                    <div key={index} className="relative group aspect-square rounded-[20px] overflow-hidden border border-[#E5E5E5] bg-gray-50 shadow-sm">
                        {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={item.url} alt={`Media ${index}`} className="w-full h-full object-cover" />
                        )}
                        <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={openWidget}
                    className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#F5A623]/30 rounded-[20px] bg-[#F5A623]/5 hover:bg-[#F5A623]/10 transition-all text-[#F5A623]"
                >
                    <span className="text-3xl">📸</span>
                    <span className="text-[14px] font-bold">Subir Fotos / Videos</span>
                </button>
            </div>
            
            <p className="text-[12px] text-[#6B6B6B] mt-2">
                * Las fotos y videos ayudan a que los vecinos conozcan mejor tu negocio.
            </p>
        </div>
    );
}
