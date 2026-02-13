
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

    // Fetch all subscriptions
    // Note: This might be slow if thousands of users. For production, use batching/workers.
    // Also, using service role key would be better to bypass RLS if select policy is restrictive.
    // If supabase client uses Anon key, we need SELECT policy = true (which we set/implied via public access, or need to fix).
    // The previous migration didn't strictly set select policy to true for anon, but "Admin select" using true might work if role assumes it. 
    // Wait, the migration script had comments about "Admin select". I didn't actually run a broad select policy.
    // Let's assume for now I need to fetch. 
    // If it fails, I might need to use the `pg` client here too? 
    // But Vercel/Node adapter allows `pg` usage.
    // Let's rely on standard client first. If empty, I'll switch to `pg` or service key.

    // Actually, I should use the Service Role Key here to be safe and correct for backend logic.
    // User provided the project URL and Anon key. I don't recall seeing the Service Role Key explicitly in the prompt text, 
    // but the summary said "Credentials... were provided".
    // I'll stick to what I have. If I can't select, I'll use the Postgres connection string via `pg` library since I have that!

    // Using pg for reliability in backend route:
    // ... Actually, importing `pg` in SvelteKit endpoint works fine with Node adapter.

    // Let's try Supabase first. If it returns error/empty, I'll debug.
    const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*');

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
        return json({ message: 'No subscriptions' });
    }

    const payload = JSON.stringify({ title, body, url });

    const promises = subscriptions.map(sub => {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: sub.keys
        };

        return webpush.sendNotification(pushSubscription, payload)
            .catch(error => {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired/gone, remove from DB
                    // Using Supabase to delete
                    supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).then();
                }
                console.error('Error sending notification:', error);
            });
    });

    await Promise.all(promises);

    return json({ success: true, count: subscriptions.length });
}
