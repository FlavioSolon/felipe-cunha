import type { PageServerLoad } from './$types';
import { loadCartas } from '$lib/data/cartasCampo';

export const load: PageServerLoad = async () => {
    const cartas = await loadCartas();
    return { cartas };
};
