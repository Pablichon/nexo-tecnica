// src/components/MainLayout.js
'use client';

import Link from "next/link";
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';

export default function MainLayout({ children }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Función para actualizar el contador
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('nexotecnica_favoritos');
        if (stored) {
          const favoritos = JSON.parse(stored);
          setCount(favoritos.length);
        } else {
          setCount(0);
        }
      } catch (error) {
        setCount(0);
      }
    };

    // Actualizar al montar
    updateCount();

    // Escuchar cambios
    window.addEventListener('favoritesChanged', updateCount);

    // Cleanup
    return () => {
      window.removeEventListener('favoritesChanged', updateCount);
    };
  }, []);

  return (
    <>
      {/* BARRA DE NAVEGACIÓN (NAVBAR) */}
      <nav style={{
        backgroundColor: 'white',
        padding: '10px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>

          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* TODO: Reemplazar logo */}
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', letterSpacing: '-0.5px' }}>NEXO <span style={{ color: '#0284C7' }}>TÉCNICA</span></span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href="/negocios" style={{ textDecoration: 'none', color: '#666', fontSize: '20px' }}>
              🔍
            </Link>
            <Link href="/favoritos" style={{ textDecoration: 'none', color: '#666', fontSize: '20px', position: 'relative' }}>
              ❤️
              {count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-8px',
                  backgroundColor: '#FF4D4F',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {count}
                </span>
              )}
            </Link>
            <Link href="/publicar-negocio" style={{
              backgroundColor: '#0284C7',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '8px', /* Industrial squarer edges */
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
            }}>
              + Sumar Empresa
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ flex: 1 }}>
        {children}
      </div>

      <Footer />
    </>
  );
}