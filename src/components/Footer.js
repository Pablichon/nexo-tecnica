import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <p className={styles.copyright}>
                        © 2026 Nexo Técnica - Soluciones Industriales
                    </p>

                    <div className={styles.links}>
                        <Link href="/terminos-condiciones" className={styles.link}>
                            Términos y Condiciones
                        </Link>
                        <Link
                            href="/contacto"
                            className={styles.link}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            📞 Soporte Técnico
                        </Link>
                        <a
                            href="https://instagram.com/nexotecnica"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}
                        >
                            📸 Instagram
                        </a>
                        <Link href="/admin" className={styles.link} style={{ opacity: 0.6, fontSize: '11px' }}>
                            🔐 Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
