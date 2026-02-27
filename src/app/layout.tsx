import { Metadata } from 'next'
import { Plus_Jakarta_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import LayoutWrapper from './LayoutWrapper'

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-sans'
})
const dmSerifDisplay = DM_Serif_Display({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-serif'
})

export const metadata: Metadata = {
    title: {
        default: 'Salem Farm Mango | Authentic Salem Mangoes Online | Fresh From Farm',
        template: '%s | Salem Farm Mango - Salem Fresh Mangoes'
    },
    description: 'Buy authentic Salem Mangoes online from SalemFarm Mango. We deliver premium, naturally ripened, organic Imam Pasand, Malgova, and Alphonso mangoes directly from our farm in Salem to your doorstep. Best Salem mango shopping experience.',
    keywords: [
        'Salem mango',
        'salemfarm mango',
        'salem fresh mangoes',
        'Buy Salem Mangoes Online',
        'Organic Salem Mangoes',
        'Salem Farm Fresh Mangoes',
        'Best Mangoes in Salem',
        'Imam Pasand Mango Salem',
        'Malgova Mango Online',
        'Alphonso Mango Tamil Nadu',
        'Direct from Farm Mangoes'
    ],
    authors: [{ name: 'Salem Farm Mango' }],
    creator: 'Salem Farm Mango',
    metadataBase: new URL('https://salemfarmmango.com'),
    manifest: '/manifest.json',
    alternates: {
        canonical: '/',
    },
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://salemfarmmango.com',
        title: 'Salem Farm Mango | Salem Fresh Mangoes | Order Online',
        description: 'Order premium, naturally ripened Salem mangoes directly from salemfarm mango. Fresh, organic, and authentic taste delivered to your doorstep.',
        siteName: 'Salem Farm Mango',
        images: [
            {
                url: 'https://img.salemfarmmango.com/uploads/SFMLOGO.png',
                width: 1200,
                height: 630,
                alt: 'Salem Farm Mango - Salem Fresh Mangoes',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Salem Farm Mango | Best Organic Salem Mangoes',
        description: 'Order premium, naturally ripened Salem mangoes directly from our farm. Fresh, organic, and authentic taste delivered to your doorstep.',
        images: ['https://img.salemfarmmango.com/uploads/SFMLOGO.png'],
    },
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
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${plusJakartaSans.variable} ${dmSerifDisplay.variable}`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'Salem Farm Mango',
                            url: 'https://salemfarmmango.com',
                            logo: 'https://img.salemfarmmango.com/uploads/SFMLOGO.png',
                            sameAs: [
                                'https://instagram.com/salemfarmmango',
                                'https://facebook.com/salemfarmmango'
                            ],
                            contactPoint: {
                                '@type': 'ContactPoint',
                                telephone: '+91-9876543210',
                                contactType: 'customer service',
                                areaServed: 'IN',
                                availableLanguage: 'en'
                            },
                            address: {
                                '@type': 'PostalAddress',
                                addressLocality: 'Salem',
                                addressRegion: 'Tamil Nadu',
                                addressCountry: 'IN'
                            }
                        })
                    }}
                />
                <LayoutWrapper>
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    )
}
