
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
        return json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Upsert subscription
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
            {
                endpoint: subscription.endpoint,
                expiration_time: subscription.expirationTime,
                keys: subscription.keys
            },
            { onConflict: 'endpoint' }
        );

    if (error) {
        console.error('Error saving subscription:', error);
        return json({ error: 'Database error' }, { status: 500 });
    }

    return json({ success: true });
}
