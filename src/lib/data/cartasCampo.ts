import { supabase } from '$lib/supabaseClient';

export interface ContentBlock {
    type: 'text' | 'image';
    value: string; // text paragraph or image URL
    caption?: string;
    layout?: 'left' | 'right' | 'full';
}

export interface CartaCampo {
    id: string;
    title: string;
    location: string;
    date_sent: string;
    excerpt: string;
    content_blocks: ContentBlock[];
    images: string[];
    likes: number;
    created_at: string;
}

export async function loadCartas(): Promise<CartaCampo[]> {
    const { data, error } = await supabase
        .from('carta_campo')
        .select('*')
        .order('date_sent', { ascending: false });

    if (error) {
        console.error('Error fetching cartas:', error);
        return [];
    }

    return (data ?? []) as CartaCampo[];
}

export async function loadCarta(id: string): Promise<CartaCampo | null> {
    const { data, error } = await supabase
        .from('carta_campo')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching carta:', error);
        return null;
    }

    return data as CartaCampo;
}

export function buildContentBlocks(text: string, imageUrls: string[]): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const parts = text.split('[FOTO]');
    let imageIndex = 0;

    parts.forEach((part, i) => {
        const trimmed = part.trim();
        if (trimmed) {
            // Split text into paragraphs
            const paragraphs = trimmed.split('\n').filter((p) => p.trim());
            paragraphs.forEach((p) => {
                blocks.push({ type: 'text', value: p.trim() });
            });
        }
        // After each section (except last), insert next image
        if (i < parts.length - 1 && imageIndex < imageUrls.length) {
            const layouts: Array<'left' | 'right' | 'full'> = ['right', 'left', 'full'];
            blocks.push({
                type: 'image',
                value: imageUrls[imageIndex],
                layout: layouts[imageIndex % layouts.length]
            });
            imageIndex++;
        }
    });

    return blocks;
}
