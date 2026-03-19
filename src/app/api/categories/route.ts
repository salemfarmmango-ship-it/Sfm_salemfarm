import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await fetch('http://salemfarmmango.com/api/categories.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`PHP backend responded with status ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure we always return an array
        const categories = Array.isArray(data) ? data : (data.categories || []);

        return NextResponse.json(categories);
    } catch (error: any) {
        console.error('Error fetching categories from PHP backend:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
