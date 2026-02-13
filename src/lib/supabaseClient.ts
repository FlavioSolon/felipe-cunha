import { createClient } from '@supabase/supabase-js'
import { S3Client } from '@aws-sdk/client-s3'

const projectUrl = 'https://kyzotobotxygdpshpwpw.supabase.co'
// Using the provided secret key if available might help, but let's stick to anon + RLS or the user's secret if they want "credentials in code"
// User provided: sb_publishable_jhGo6AsxTiQYb-U_kWd13A_dnljx68F
const anonKey = 'sb_publishable_jhGo6AsxTiQYb-U_kWd13A_dnljx68F'

export const supabase = createClient(projectUrl, anonKey)

// S3 Configuration
export const s3Config = {
    endpoint: 'https://kyzotobotxygdpshpwpw.storage.supabase.co/storage/v1/s3',
    region: 'us-east-1',
    credentials: {
        accessKeyId: '048bf614e607de6f48c1adf7bc950db7',
        secretAccessKey: 'e24eb90d65186232a4b692bcea02ce292dc1391a98027118e9e94c156f714f7c'
    },
    forcePathStyle: true
}

export const s3 = new S3Client(s3Config)
