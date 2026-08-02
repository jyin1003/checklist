import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Checklist',
        short_name: 'Checklist',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0a0a0d',
        theme_color: '#8b5cf6',
        icons: [
            {
                src: '/checklist-logo-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/checklist-logo-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}