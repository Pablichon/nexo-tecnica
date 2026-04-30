'use client';
import { useRef } from 'react';
import OfferCard from './OfferCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OfferCarousel({ offers }) {
    const scrollContainer = useRef(null);

    // Si no hay ofertas o son undefined, usar array vacío
    const data = offers || [];

    if (data.length === 0) return null;

    return (
        <section className="py-6">
            <div className="container mx-auto px-4 mb-4 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        🔥 Ofertas Bomba
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Aprovechá antes que se terminen</p>
                </div>
                <Link href="/ofertas" className="text-blue-600 font-bold text-sm hover:underline flex items-center">
                    Ver todas <ChevronRight size={16} />
                </Link>
            </div>

            {/* Contenedor con Scroll Horizontal */}
            <div
                ref={scrollContainer}
                className="flex overflow-x-auto gap-6 px-4 pb-4 snap-x snap-mandatory hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {data.map((oferta) => (
                    <div key={oferta.id} className="snap-start shrink-0 w-[280px]">
                        <OfferCard oferta={oferta} />
                    </div>
                ))}
            </div>
        </section>
    );
}
