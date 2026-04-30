import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallBanner from "@/components/InstallBanner";
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import * as gtag from '@/lib/gtag';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ["latin"] });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const viewport = {
  themeColor: "#F5A623",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://nexotecnica.com.ar'),
  title: {
    default: "Nexo Técnica - Búsqueda Industrial Especializada",
    template: "%s | Nexo Técnica"
  },
  description: "Plataforma de búsqueda técnica e industrial. Encontrá los servicios y proveedores especializados que tu empresa necesita.",
  manifest: "/manifest.json",
  keywords: ["industria", "servicios tecnicos", "nexo tecnica", "proveedores industriales", "mecanizado", "automatizacion"],
  authors: [{ name: "Nexo Técnica" }],
  creator: "Nexo Técnica",
  publisher: "Nexo Técnica",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexo Técnica",
  },
  openGraph: {
    title: "Nexo Técnica - Búsqueda Industrial Especializada",
    description: "Plataforma de búsqueda técnica e industrial.",
    url: 'https://nexotecnica.com.ar',
    siteName: 'Nexo Técnica',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Nexo Técnica Logo',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${nunito.variable}`} style={{ backgroundColor: '#fffaf0', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <MainLayout>
          {children}
        </MainLayout>
        <ServiceWorkerRegister />
        <InstallBanner />
        <Analytics />
        <GoogleAnalytics />

        {/* Google Analytics 4 */}
        {gtag.GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gtag.GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
