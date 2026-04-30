'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        <nav className={styles.nav}>
            <Link href="/" className={`${styles.item} ${isActive('/') ? styles.active : ''}`}>
                <Home size={24} />
                <span>Inicio</span>
            </Link>

            <Link href="/buscar" className={`${styles.item} ${isActive('/buscar') ? styles.active : ''}`}>
                <Search size={24} />
                <span>Buscar</span>
            </Link>

            <Link href="/favoritos" className={`${styles.item} ${isActive('/favoritos') ? styles.active : ''}`}>
                <Heart size={24} />
                <span>Favoritos</span>
            </Link>

            <Link href="/perfil" className={`${styles.item} ${isActive('/perfil') ? styles.active : ''}`}>
                <User size={24} />
                <span>Perfil</span>
            </Link>
        </nav>
    );
}
