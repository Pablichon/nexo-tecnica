// src/components/Navbar.js
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Contenedor interno para centrar los elementos */}
            <div style={{
                maxWidth: '1200px', // Ancho máximo estándar
                margin: '0 auto',   // Esto centra el contenedor
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px', // Un poco de aire a los costados
            }}>

                {/* Logo / Nombre */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>
                        NEXO <span style={{ color: '#0284C7' }}>TÉCNICA</span>
                    </div>
                </Link>

                {/* Enlaces */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link href="/negocios" style={{ textDecoration: 'none', color: '#555', fontWeight: '500' }}>
                        🔍 Proveedores
                    </Link>

                    <Link href="/contacto" style={{ textDecoration: 'none', color: '#555', fontWeight: '500' }}>
                        📞 Contacto
                    </Link>

                    <Link href="/publicar-negocio" style={{
                        textDecoration: 'none',
                        backgroundColor: '#0284C7',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px', // Menos redondeado para look industrial
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'background 0.3s'
                    }}>
                        + Sumar Empresa
                    </Link>
                </div>
            </div>
        </nav>
    );
}