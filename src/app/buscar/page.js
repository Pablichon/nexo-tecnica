'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function BuscarPage() {
    const [busqueda, setBusqueda] = useState('');

    const handleSearch = () => {
        if (busqueda.trim()) {
            trackEvent('Busqueda', {
                termino: busqueda
            });
            // Aquí se podría agregar la lógica de navegación o filtrado real en el futuro
            console.log('Buscando:', busqueda);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 700 }}>
                Buscar
            </h1>
            <input
                type="search"
                placeholder="¿Qué necesitas hoy?"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: '#f5f5f5',
                    fontSize: '1rem',
                    outline: 'none'
                }}
            />
            <p style={{ marginTop: '12px', color: '#666', fontSize: '0.9rem' }}>
                Presioná Enter para buscar
            </p>
        </div>
    );
}
