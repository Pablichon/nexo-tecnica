// src/app/nuevo/page.js
'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function NuevoNegocio() {
    const [formulario, setFormulario] = useState({
        nombre: '',
        rubro: '',
        descripcion: ''
    });
    const [mensaje, setMensaje] = useState('');

    const manejarCambio = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    };

    const guardarNegocio = async (e) => {
        e.preventDefault(); // Evita que la página se recargue sola
        setMensaje('Guardando...');

        try {
            await addDoc(collection(db, "negocios"), {
                ...formulario,
                fechaCreacion: new Date()
            });

            setMensaje('✅ ¡Negocio guardado con éxito!');
            setFormulario({ nombre: '', rubro: '', descripcion: '' }); // Limpia el formulario
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al guardar: ' + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>📝 Agregar Nuevo Negocio</h1>

            <form onSubmit={guardarNegocio} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre del Negocio (ej: Kiosco El Paso)"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    required
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <input
                    type="text"
                    name="rubro"
                    placeholder="Rubro (ej: Kiosco, Farmacia, Ropa)"
                    value={formulario.rubro}
                    onChange={manejarCambio}
                    required
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <textarea
                    name="descripcion"
                    placeholder="Breve descripción de lo que venden..."
                    value={formulario.descripcion}
                    onChange={manejarCambio}
                    rows="4"
                    required
                    style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <button
                    type="submit"
                    style={{ padding: '12px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Guardar Negocio
                </button>

            </form>

            {mensaje && <p style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{mensaje}</p>}

            {/* Botón para volver a ver la lista */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <a href="/negocios" style={{ color: '#666', textDecoration: 'underline' }}>← Volver al listado</a>
            </div>
        </div>
    );
}