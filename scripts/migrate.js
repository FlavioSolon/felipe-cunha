import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:%+hq7rbJy*M_bhr@db.kyzotobotxygdpshpwpw.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to Supabase Postgres...');

        const sql = `
    -- Enable UUID extension
    create extension if not exists "uuid-ossp";

    -- Create 'posts' table
    create table if not exists public.posts (
      id uuid default uuid_generate_v4() primary key,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      type text not null check (type in ('reflexao', 'conselho')),
      title text,
      description text,
      image_url text not null,
      likes bigint default 0
    );

    -- Enable RLS
    alter table public.posts enable row level security;

    -- Policy: Allow public read access (for feeds)
    -- Drop first to avoid error on rerun
    drop policy if exists "Public Read Access" on public.posts;
    create policy "Public Read Access"
    on public.posts for select
    using (true);
    
    -- Drop policy if exists "Admin Write Access" on public.posts;
    -- create policy "Admin Write Access"
    -- on public.posts for insert
    -- with check (true); 
    -- (Actually, since we access via Client with Anon Key, we usually need a policy for INSERT if we are not Service Role.
    -- BUT the user provided "Safe" policies only for READ.
    -- For INSERT, the Client provided is ANON. Anon cannot insert if no policy allows it.
    -- However, the Admin Panel code uses standard client.
    -- Let's ADD a policy to allow Anon Insert for now since there is no Auth user.)
    
    drop policy if exists "Public Insert Access" on public.posts;
    create policy "Public Insert Access"
    on public.posts for insert
    with check (true);

    drop policy if exists "Public Update Access" on public.posts;
    create policy "Public Update Access"
    on public.posts for update
    using (true);

    drop policy if exists "Public Delete Access" on public.posts;
    create policy "Public Delete Access"
    on public.posts for delete
    using (true);

    -- Create 'images' storage bucket
    insert into storage.buckets (id, name, public) 
    values ('images', 'images', true)
    on conflict (id) do nothing;

    -- Storage Policy: Allow public view
    drop policy if exists "Public View Images" on storage.objects;
    create policy "Public View Images"
    on storage.objects for select
    using ( bucket_id = 'images' );
    
    -- Storage Update to allow public inserts (since we might use Supabase client for something?)
    -- Actually we use S3 for uploads now, so this is less critical for upload, but good for management.
    drop policy if exists "Public Insert Images" on storage.objects;
    create policy "Public Insert Images"
    on storage.objects for insert
    with check ( bucket_id = 'images' );
    `;

        await client.query(sql);
        console.log('Migration executed successfully!');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

runMigration();
