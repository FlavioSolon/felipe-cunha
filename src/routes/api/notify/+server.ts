
import { json } from '@sveltejs/kit';
import webpush from 'web-push';
import { supabase } from '$lib/supabaseClient';

// VAPID Keys (Ideally in .env, but hardcoding as requested/simpler for this context)
const publicVapidKey = 'BJc0LFvr9XcUjf0JbCRWcqhc8b__T72samytVIQbcTQDN69fvZo137bfOi2JXAcm7Ebx0Ae0-fHUweCQmU9WvFc';
const privateVapidKey = 'eVSviq1ZqRPv9Pt0yvzeHXKIH3YDU-Y2K2PL-fC7zDE';

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    publicVapidKey,
    privateVapidKey
);

export async function POST({ request }) {
    const { title, body, url } = await request.json();

    console.log('[Notify API] Received request:', { title, body, url });

    // Fetch all subscriptions
    const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*');

    console.log('[Notify API] Subscriptions query result:', {
        count: subscriptions?.length || 0,
        error: error?.message
    });

    if (error) {
        console.error('[Notify API] Database error:', error);
        return json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
        console.warn('[Notify API] No subscriptions found');
        return json({ message: 'No subscriptions', count: 0 });
    }

    const payload = JSON.stringify({ title, body, url });
    console.log('[Notify API] Sending to', subscriptions.length, 'subscribers');

    const promises = subscriptions.map((sub, index) => {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys
        };

        return webpush.sendNotification(pushSubscription, payload)
            .then(() => {
                console.log(`[Notify API] Sent to subscriber ${index + 1}`);
            })
            .catch((error: any) => {
                console.error(`[Notify API] Failed to send to subscriber ${index + 1}:`, error.message);
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired/gone, remove from DB
                    console.log(`[Notify API] Removing expired subscription: ${sub.endpoint}`);
                    supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).then();
                }
            });
    });

    await Promise.all(promises);

    console.log('[Notify API] Notification batch complete');
    return json({ success: true, count: subscriptions.length });
}
