'use client';

import Link from 'next/link';
import styles from './PublishBusiness.module.css';
import { Rocket } from 'lucide-react';

export default function PublishBusiness() {
    return (
        <div className={styles.publishSection}>
            <p className={styles.question}>¿Tienes un comercio o brindas servicios?</p>
            <Link href="/publicar-negocio" className={styles.publishButton}>
                <span>Suma tu comercio gratis</span>
                <Rocket className={styles.icon} />
            </Link>
        </div>
    );
}
