const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeStorage() {
  try {
    console.log('🚀 Initializing Supabase storage for assessment files...');

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'assessment-files');

    if (bucketExists) {
      console.log('✅ assessment-files bucket already exists');
      return;
    }

    // Create bucket
    console.log('📦 Creating assessment-files bucket...');

    const { data: bucket, error: createError } = await supabase.storage.createBucket('assessment-files', {
      public: false,
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      fileSizeLimit: 52428800, // 50MB
    });

    if (createError) {
      console.error('❌ Error creating bucket:', createError);
      return;
    }

    console.log('✅ assessment-files bucket created successfully');
    console.log('📋 Bucket details:', bucket);

    console.log('\n🔒 Note: Storage policies should be configured via SQL migration.');
    console.log('Run the migration: 20241202000000_add_assessment_files_table.sql');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the initialization
initializeStorage(); 
