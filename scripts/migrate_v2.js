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

        // We need to change image_url (text) to images (text[])
        // 1. Add new column 'images'
        // 2. Migrate data
        // 3. Drop 'image_url' (or keep it as legacy/backup for a moment, but safer to just migrate)

        // Actually, simple ALTER might work if we interpret the existing text as a single-item array
        // ALTER TABLE posts ALTER COLUMN image_url TYPE text[] USING ARRAY[image_url];
        // Then rename column to images.

        const sql = `
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'image_url') THEN
                ALTER TABLE public.posts ALTER COLUMN image_url TYPE text[] USING ARRAY[image_url];
                ALTER TABLE public.posts RENAME COLUMN image_url TO images;
            END IF;
        END $$;
    `;

        await client.query(sql);
        console.log('Migration executed successfully: converted image_url to images array.');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

runMigration();
