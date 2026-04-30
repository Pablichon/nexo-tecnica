import styles from './PromoBanner.module.css';
import { Tag } from 'lucide-react';

export default function PromoBanner() {
    return (
        <div className={styles.promoBanner}>
            <div className={styles.iconWrapper}>
                <Tag className={styles.icon} />
            </div>
            <h3 className={styles.title}>Promos del Barrio</h3>
        </div>
    );
}
