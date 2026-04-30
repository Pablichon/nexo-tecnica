'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import * as gtag from '@/lib/gtag';
import { trackToFirebase } from '@/lib/firebaseTracking';

function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

            // Google Analytics 4
            gtag.pageview(url);

            // Firebase tracking propio
            trackToFirebase('page_view', {
                page: pathname,
                fullUrl: url
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export default function GoogleAnalytics() {
    return (
        <Suspense fallback={null}>
            <AnalyticsTracker />
        </Suspense>
    );
}
