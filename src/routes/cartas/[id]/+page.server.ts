import type { PageServerLoad } from './$types';
import { loadCarta } from '$lib/data/cartasCampo';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const carta = await loadCarta(params.id);
    if (!carta) {
        throw error(404, 'Carta não encontrada');
    }
    return { carta };
};
