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
                src: '/logo.svg',
                type: 'image/svg',
            },
        ],
    };
}