import Link from 'next/link';
import DynamicIcon from '../ui/DynamicIcon';
import styles from './CategoryCard.module.css';

export default function CategoryCard({ category }) {
    return (
        // CAMBIO CLAVE AQUÍ: 👇
        // En lugar de ir a /rubro/..., vamos al catálogo general con un filtro
        <Link href={`/negocios?rubro=${category.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <img
                    src={category.image}
                    alt={category.name}
                    className={styles.image}
                />
                <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <DynamicIcon name={category.icon} size={20} color="#2D2D2D" />
                </div>
                <span className={styles.name}>{category.name}</span>
            </div>
        </Link>
    );
}