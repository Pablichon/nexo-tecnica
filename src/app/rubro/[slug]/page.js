'use client';

import Link from 'next/link';
import { MessageCircle, ChevronDown } from 'lucide-react';
import styles from './page.module.css';

// Mock data - En producción vendría de Firebase
const mockBusinessData = {
    servicios: {
        subcategories: [
            {
                name: 'Plomería',
                businesses: [
                    { id: '1', name: 'Plomería Rápida', whatsapp: '3511111111', logo: null },
                    { id: '2', name: 'José Plomero', whatsapp: '3512222222', logo: null },
                ]
            },
            {
                name: 'Electricidad',
                businesses: [
                    { id: '3', name: 'Electricidad Yofre', whatsapp: '3513333333', logo: null },
                ]
            }
        ]
    },
    comida: {
        subcategories: [
            {
                name: 'Panaderías',
                businesses: [
                    { id: '4', name: 'Pan x Kg', whatsapp: '3514444444', logo: null },
                    { id: '5', name: 'Panadería San Juan', whatsapp: '3515555555', logo: null },
                    { id: '6', name: 'Facturas La Nueva Yofre', whatsapp: '3516666666', logo: null },
                ]
            }
        ]
    }
};

import { trackEvent } from '@/lib/analytics';

export default function RubroPage({ params }) {
    const slug = params?.slug || 'servicios';
    const categoryData = mockBusinessData[slug] || mockBusinessData.servicios;

    const handleWhatsAppClick = (whatsapp, businessName) => {
        trackEvent('Click WhatsApp', {
            comercio: businessName
        });

        const message = encodeURIComponent('Hola! Vi tu local en Yofre al Toque y quería hacerte una consulta.');
        window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    LISTADO (Categoría / Búsqueda)
                </h1>
            </header>

            <div className={styles.content}>
                {categoryData.subcategories.map((subcategory, index) => (
                    <div key={index} className={styles.subcategorySection}>
                        {/* Subcategory Header */}
                        <div className={styles.subcategoryHeader}>
                            <ChevronDown className={styles.chevronIcon} />
                            <h2 className={styles.subcategoryTitle}>{subcategory.name}</h2>
                        </div>

                        {/* Business List */}
                        <div className={styles.businessList}>
                            {subcategory.businesses.map((business) => (
                                <div key={business.id} className={styles.businessCard}>
                                    <Link href={`/comercio/${business.id}`} className={styles.businessInfo}>
                                        {/* Logo/Image */}
                                        <div className={styles.businessLogo}>
                                            {business.logo ? (
                                                <img src={business.logo} alt={business.name} className={styles.logoImage} />
                                            ) : (
                                                <div className={styles.logoPlaceholder}>
                                                    <span className={styles.logoText}>[IMG]</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Business Name */}
                                        <div className={styles.businessDetails}>
                                            <h3 className={styles.businessName}>{business.name}</h3>
                                        </div>
                                    </Link>

                                    {/* WhatsApp Button */}
                                    <button
                                        className={styles.whatsappButton}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleWhatsAppClick(business.whatsapp, business.name);
                                        }}
                                        aria-label="Contactar por WhatsApp"
                                    >
                                        <MessageCircle className={styles.whatsappIcon} />
                                        <span className={styles.whatsappText}>WhatsApp</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
