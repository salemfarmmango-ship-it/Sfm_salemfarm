import { MetadataRoute } from 'next'


export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://salemfarmmango.com';

    // Base routes
    const routes = [
        '',
        '/about',
        '/shop',
        '/contact',
        '/auth',
        '/checkout',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as any,
        priority: route === '' ? 1 : 0.8,
    }));

    try {
        // Fetch all generic products available
        const res = await fetch('http://salemfarmmango.com/api/products.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products for sitemap');
        
        const products = await res.json();

        let productRoutes: MetadataRoute.Sitemap = [];

        if (Array.isArray(products)) {
            productRoutes = products.map((product: any) => ({
                url: `${baseUrl}/product/${product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: 'weekly' as any,
                priority: 0.7,
            }));
        }

        return [...routes, ...productRoutes];
    } catch (e) {
        console.error('Error generating Sitemap', e);
        return routes;
    }
}
