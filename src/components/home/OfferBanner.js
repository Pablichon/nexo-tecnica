import Link from 'next/link';
import styles from './OfferBanner.module.css';

export default function OfferBanner() {
    return (
        <Link href="/ofertas" className={styles.banner}>
            <div className={styles.imageWrapper}>
                <img
                    src="/images/produce-banner.png"
                    alt="Ofertas del Día"
                    className={styles.image}
                />
                <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
                <div className={styles.badge}>NOVEDAD HOY</div>
                <h2 className={styles.title}>Ofertas del Día</h2>
                <p className={styles.subtitle}>Descuentos exclusivos de locales cercanos</p>
                <button className={styles.button}>Ver Ofertas</button>
            </div>
        </Link>
    );
}
