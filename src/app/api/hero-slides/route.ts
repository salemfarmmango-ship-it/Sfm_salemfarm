import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all slides matching order
export async function GET() {
    try {
        const { data: slides, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;
        return NextResponse.json(slides);
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
    }
}

// POST a new slide
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data, error } = await supabase
            .from('hero_slides')
            .insert([body])
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error creating hero slide:', error);
        return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
    }
}

// PUT (update) an existing slide
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;

        const { data, error } = await supabase
            .from('hero_slides')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error updating hero slide:', error);
        return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
    }
}

// DELETE a slide
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('hero_slides')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting hero slide:', error);
        return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
    }
}
