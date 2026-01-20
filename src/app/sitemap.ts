import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://salemfarmmango.com'

    // Fetch product slugs from Supabase
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .not('slug', 'is', null)

    const productUrls = (products || []).map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updated_at || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const staticRoutes = [
        '',
        '/shop',
        '/about',
        '/contact',
        '/faq',
        '/offers',
        '/privacy',
        '/terms',
        '/returns',
        '/shipping',
        '/blog', // Adding blog just in case user adds it later, or maybe not.
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? ('daily' as const) : ('monthly' as const),
        priority: route === '' ? 1.0 : 0.7,
    }))

    return [...staticRoutes, ...productUrls]
}
