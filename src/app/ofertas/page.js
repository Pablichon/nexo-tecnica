import { Suspense } from 'react';
import OfertasContent from './OfertasContent';

export const metadata = {
    title: 'Ofertas y Suministros Industriales',
    description: 'Encontrá los mejores descuentos en suministros y servicios técnicos especializados en Nexo Técnica.',
    openGraph: {
        title: 'Ofertas Industriales | Nexo Técnica',
        description: 'Descuentos exclusivos en herramientas, mantenimiento y servicios técnicos para la industria.',
    }
};

export default function OfertasPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F9F7F2] flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
        }>
            <OfertasContent />
        </Suspense>
    );
}
