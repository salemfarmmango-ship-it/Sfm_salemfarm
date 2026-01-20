import { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import LayoutWrapper from './LayoutWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const merriweather = Merriweather({
    weight: ['300', '400', '700', '900'],
    subsets: ['latin'],
    variable: '--font-serif'
})

export const metadata: Metadata = {
    title: {
        default: 'Salem Farm Mango | Premium Organic Salem Mangoes Online',
        template: '%s | Salem Farm Mango - Best Mangoes in Tamil Nadu'
    },
    description: 'Buy authentic Salem Mangoes online. We deliver premium, naturally ripened, organic Imam Pasand, Malgova, and Alphonso mangoes directly from our farm in Salem, Tamil Nadu to your doorstep.',
    keywords: [
        'Salem Mango',
        'Salem Farm Mango',
        'Buy Mangoes Online',
        'Organic Mangoes Online',
        'Imam Pasand Mango',
        'Malgova Mango',
        'Alphonso Mango',
        'Salem Bengalura',
        'Best Mangoes in Tamil Nadu',
        'Buy Salem Mangoes',
        'Online Mango Delivery',
        'Farm Fresh Mangoes',
        'Malgova Mango Online',
        'Salem Mango Order'
    ],
    authors: [{ name: 'Salem Farm Mango' }],
    creator: 'Salem Farm Mango',
    metadataBase: new URL('https://salemfarmmango.com'),
    alternates: {
        canonical: '/',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://salemfarmmango.com',
        title: 'Salem Farm Mango | Authentic Salem Mangoes Delivered Home',
        description: 'Order premium, naturally ripened Salem mangoes directly from our farm. Fresh, organic, and authentic taste delivered to your doorstep.',
        siteName: 'Salem Farm Mango',
        images: [
            {
                url: '/web.png',
                width: 1200,
                height: 630,
                alt: 'Salem Farm Mango - Premium Organic Mangoes',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Salem Farm Mango | Best Organic Mangoes from Salem',
        description: 'Order premium, naturally ripened Salem mangoes directly from our farm. Fresh, organic, and authentic taste delivered to your doorstep.',
        images: ['/web.png'],
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
            <body className={`${inter.variable} ${merriweather.variable}`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'Salem Farm Mango',
                            url: 'https://salemfarmmango.com',
                            logo: 'https://salemfarmmango.com/logo.png',
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
