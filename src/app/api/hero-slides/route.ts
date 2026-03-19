import { NextRequest, NextResponse } from 'next/server';

// GET all slides matching order
export async function GET() {
    try {
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/hero_slides.php', {
            cache: 'no-store'
        });
        const slides = await response.json();
        
        if (!response.ok) throw new Error(slides.error || 'Failed to fetch hero slides');
        return NextResponse.json(slides);
    } catch (error: any) {
        console.error('Error fetching hero slides proxy:', error);
        return NextResponse.json({ error: 'Failed to fetch hero slides', details: error.message }, { status: 500 });
    }
}

// POST a new slide
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('sfm_token')?.value;
        const body = await req.json();
        
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/hero_slides.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create hero slide');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating hero slide proxy:', error);
        return NextResponse.json({ error: 'Failed to create hero slide', details: error.message }, { status: 500 });
    }
}

// PUT (update) an existing slide
export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('sfm_token')?.value;
        const body = await req.json();

        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/hero_slides.php', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update hero slide');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating hero slide proxy:', error);
        return NextResponse.json({ error: 'Failed to update hero slide', details: error.message }, { status: 500 });
    }
}

// DELETE a slide
export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('sfm_token')?.value;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hero_slides.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete hero slide');
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting hero slide proxy:', error);
        return NextResponse.json({ error: 'Failed to delete hero slide', details: error.message }, { status: 500 });
    }
}
