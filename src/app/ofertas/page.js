import { Suspense } from 'react';
import OfertasContent from './OfertasContent';

export const metadata = {
    title: 'Ofertas del Día',
    description: 'Encontrá los mejores descuentos y promociones en Barrio Yofre. ¡Ahorrá en tus compras diarias con Yofre al Toque!',
    openGraph: {
        title: 'Ofertas del Día en Barrio Yofre | Yofre al Toque',
        description: 'Descuentos exclusivos en carnicerías, verdulerías, servicios y más en tu barrio.',
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
