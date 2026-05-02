'use client';

import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'nexo_favoritos';

export function useFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar favoritos del localStorage al montar con lógica de migración
    useEffect(() => {
        try {
            const OLD_KEY = 'yofre_favoritos';
            const oldStored = localStorage.getItem(OLD_KEY);
            let finalFavorites = [];

            // 1. Intentar cargar los nuevos
            const newStored = localStorage.getItem(FAVORITES_KEY);
            if (newStored) {
                finalFavorites = JSON.parse(newStored);
            }

            // 2. Si hay viejos, migrarlos si no están ya en los nuevos
            if (oldStored) {
                const oldFavorites = JSON.parse(oldStored);
                const currentIds = new Set(finalFavorites.map(f => f.id));
                
                const migrated = oldFavorites.filter(f => !currentIds.has(f.id));
                if (migrated.length > 0) {
                    finalFavorites = [...finalFavorites, ...migrated];
                    localStorage.setItem(FAVORITES_KEY, JSON.stringify(finalFavorites));
                }
                
                // 3. Limpiar el residuo antiguo
                localStorage.removeItem(OLD_KEY);
            }

            setFavorites(finalFavorites);
        } catch (error) {
            console.error('Error during favorites migration/loading:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Guardar en localStorage cuando cambian los favoritos
    const saveFavorites = (newFavorites) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
            // Disparar evento para actualizar otros componentes
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('favoritesChanged'));
            }
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    // Agregar un negocio a favoritos
    const addFavorite = (negocio) => {
        const newFavorites = [...favorites, {
            id: negocio.id,
            nombre: negocio.nombre || negocio.name,
            rubro: negocio.rubro || negocio.category,
            imagen: negocio.logo || negocio.imagen || negocio.image || null,
            direccion: negocio.direccion || negocio.address,
            whatsapp: negocio.whatsapp,
            fechaAgregado: new Date().toISOString()
        }];
        saveFavorites(newFavorites);
    };

    // Eliminar un negocio de favoritos
    const removeFavorite = (negocioId) => {
        const newFavorites = favorites.filter(fav => fav.id !== negocioId);
        saveFavorites(newFavorites);
    };

    // Verificar si un negocio está en favoritos
    const isFavorite = (negocioId) => {
        return favorites.some(fav => fav.id === negocioId);
    };

    // Toggle favorito (agregar o quitar)
    const toggleFavorite = (negocio) => {
        if (isFavorite(negocio.id)) {
            removeFavorite(negocio.id);
        } else {
            addFavorite(negocio);
        }
    };

    // Limpiar todos los favoritos
    const clearFavorites = () => {
        saveFavorites([]);
    };

    return {
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        count: favorites.length
    };
}
