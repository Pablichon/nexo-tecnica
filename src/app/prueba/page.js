// src/app/prueba/page.js
'use client';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function PaginaPrueba() {
    const [mensaje, setMensaje] = useState('Esperando...');

    const probarConexion = async () => {
        try {
            setMensaje('Enviando dato...');
            await addDoc(collection(db, 'pruebas'), {
                texto: '¡Hola desde Yofre al Toque!',
                fecha: new Date()
            });
            setMensaje('✅ ¡Éxito! Dato guardado en Firebase.');
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <h1>Prueba de Conexión</h1>
            <p>Estado: <strong>{mensaje}</strong></p>
            <button
                onClick={probarConexion}
                style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Probar conexión ahora
            </button>
        </div>
    );
}