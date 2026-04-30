'use client';

import Link from 'next/link';
import { Mail, MessageCircle, Instagram, MapPin, Phone } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function ContactoPage() {
    const handleWhatsAppClick = () => {
        trackEvent('Click WhatsApp', {
            comercio: 'Yofre al Toque Soporte'
        });
    };

    const handleInstagramClick = () => {
        trackEvent('Click Instagram', {
            comercio: 'Yofre al Toque Oficial'
        });
    };


    return (
        <div className="min-h-screen bg-[#FFFBF5] pb-20">
            {/* Hero Simple */}
            <div className="bg-white border-b border-gray-100 p-6 text-center">
                <h1 className="text-2xl font-black text-gray-900 mb-2">📞 Contacto</h1>
                <p className="text-gray-600 max-w-md mx-auto">
                    ¿Tenés dudas, sugerencias o querés sumar tu negocio?
                    Estamos acá para escucharte.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-[600px] flex flex-col gap-6">

                {/* Tarjeta de Contacto Directo */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                    <div className="space-y-4">
                        <a
                            href="https://wa.me/543512163557?text=Hola,%20vengo%20de%20la%20web%20y%20quería..."
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleWhatsAppClick}
                            className="flex items-center gap-4 p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] hover:bg-[#DCFCE7] transition-colors group"
                        >
                            <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Escribime por WhatsApp</h3>
                                <p className="text-xs text-gray-500">Respuesta rápida</p>
                            </div>
                        </a>

                        <a
                            href="mailto:pablo.ramallo76@gmail.com"
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shrink-0 group-hover:bg-gray-300 transition-colors">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Enviame un Email</h3>
                                <p className="text-xs text-gray-500">Para consultas generales</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Redes Sociales */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 text-center">
                    <h3 className="font-bold text-gray-900 mb-4">Seguinos en redes</h3>
                    <div className="flex justify-center gap-4">
                        <a
                            href="https://instagram.com/yofrealtoque.com.ar"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleInstagramClick}
                            className="w-12 h-12 bg-gradient-to-tr from-[#FFD600] via-[#FF0069] to-[#D300C5] rounded-full flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity"
                        >
                            <Instagram size={24} />
                        </a>
                        {/* Se pueden agregar más redes aquí */}
                    </div>
                </div>

                {/* FAQ o Info Adicional */}
                <div className="text-center text-sm text-gray-400 mt-4">
                    <p>Barrio Yofre Norte, Córdoba, Argentina 🇦🇷</p>
                </div>

            </div>
        </div>
    );
}
