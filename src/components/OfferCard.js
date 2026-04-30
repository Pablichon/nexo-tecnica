import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';
import { useState } from 'react';

export default function OfferCard({ oferta }) {
    const [revelado, setRevelado] = useState(false);

    // Datos por defecto para previsualización si no vienen props
    const data = oferta || {
        titulo: "2x1 en Lomitos Completos",
        negocioNombre: "Lomitos El Beto",
        precioOriginal: 12000,
        precioOferta: 6000,
        descuento: "50%",
        imagenUrl: "https://images.unsplash.com/photo-1561758033-d8f19662cb5d?q=80&w=2574&auto=format&fit=crop",
        diasRestantes: 2,
        revelarPrecioClick: false
    };

    const handleReveal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setRevelado(true);
    };

    return (
        <Link href={`/comercio/${data.negocioId || 1}`} className="block h-full group">
            <div className="bg-white rounded-[20px] shadow-sm group-hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                {/* Imagen con Badge de Descuento */}
                <div className="relative h-[160px] w-full shrink-0 bg-gray-50 overflow-hidden flex items-center justify-center border-b border-gray-100">
                    <img
                        src={data.imagen || data.imagenUrl}
                        alt={data.titulo}
                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-sm z-10">
                        {data.descuento} OFF
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                        {data.negocioNombre}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3 line-clamp-2 min-h-[3.25rem] group-hover:text-primary transition-colors">
                        {data.titulo}
                    </h3>

                    {/* Precios */}
                    <div className="flex items-center gap-3 mb-4 min-h-[40px]">
                        {data.revelarPrecioClick && !revelado ? (
                            <button
                                onClick={handleReveal}
                                className="flex items-center gap-2 bg-[#f0fdf4] text-[#15803d] px-4 py-2 rounded-full text-sm font-bold border border-[#bcf0da] hover:bg-[#dcfce7] transition-colors"
                            >
                                <Eye size={16} />
                                Ver Precio
                            </button>
                        ) : (
                            <>
                                <span className="text-2xl font-black text-[#00A859]">
                                    ${Number(data.precioOferta).toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-400 line-through decoration-1">
                                    ${Number(data.precioOriginal).toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Footer: Tiempo y Botón */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-1.5 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-md">
                            <Clock size={14} />
                            <span>Quedan {data.diasRestantes || 5} días</span>
                        </div>

                        <div className="bg-[#25D366] group-hover:bg-[#128C7E] text-white p-2 rounded-full shadow-sm transition-colors">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
