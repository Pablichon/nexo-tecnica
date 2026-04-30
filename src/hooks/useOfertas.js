import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export function useOfertas() {
    const [ofertas, setOfertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOfertas = async () => {
            try {
                // Consultar ofertas activas
                const q = query(
                    collection(db, 'ofertas'),
                    where('estado', '==', 'activa')
                    // orderBy('fechaFin', 'asc') // Requiere índice compuesto a veces, probamos sin esto primero o creamos índice
                );

                const querySnapshot = await getDocs(q);
                const ofertasData = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    // Calcular días restantes
                    const now = new Date();
                    let diffDays = 0;

                    if (data.fechaFin) {
                        try {
                            const fechaFin = data.fechaFin.toDate ? data.fechaFin.toDate() : new Date(data.fechaFin);
                            // Verificar que sea una fecha válida
                            if (!isNaN(fechaFin.getTime())) {
                                const diffTime = Math.abs(fechaFin - now);
                                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
                        } catch (e) {
                            console.warn("Error parsing date for offer:", doc.id, e);
                        }
                    }

                    return {
                        id: doc.id,
                        ...data,
                        diasRestantes: diffDays
                    };
                });

                setOfertas(ofertasData);
            } catch (err) {
                console.error("Error fetching ofertas:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOfertas();
    }, []);

    return { ofertas, loading, error };
}
