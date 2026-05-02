import Link from 'next/link';
import styles from './OfferBanner.module.css';

export default function OfferBanner() {
    return (
        <Link href="/ofertas" className={styles.banner}>
            <div className={styles.imageWrapper}>
                <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                    alt="Suministros Industriales"
                    className={styles.image}
                />
                <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
                <div className={styles.badge} style={{ backgroundColor: '#0284C7' }}>SUMINISTROS</div>
                <h2 className={styles.title}>Ofertas Técnicas</h2>
                <p className={styles.subtitle}>Insumos y servicios con precios preferenciales</p>
                <button className={styles.button} style={{ backgroundColor: '#0284C7' }}>Explorar Ofertas</button>
            </div>
        </Link>
    );
}
