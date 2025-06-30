const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables from .env.local
const envPath = '.env.local';
let envVars = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 .env.local file found and read successfully');
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex !== -1) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        // Remove quotes if present
        envVars[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
  
  console.log('🔑 Environment variables loaded:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
} catch (error) {
  console.error('❌ Error reading .env.local:', error);
  process.exit(1);
}

if (!envVars.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

// Try service role key first, fall back to anon key
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const keyType = envVars.SUPABASE_SERVICE_ROLE_KEY ? 'service role' : 'anon';

console.log(`🔐 Using ${keyType} key for Supabase connection`);

if (!supabaseKey) {
  console.error('❌ No Supabase key available');
  console.log('Available keys:', Object.keys(envVars));
  process.exit(1);
}

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey
);

const buckets = [
  'award-files',
  'skill-files', 
  'community-engagement-files',
  'rehab-program-files',
  'microcredential-files',
  'education-files',
  'hobby-files'
];

async function createStorageBuckets() {
  console.log('🚀 Starting storage bucket creation...');
  console.log('📍 Supabase URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
  
  // First, let's test the connection
  try {
    const { data: bucketList, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.log('⚠️ Cannot list buckets:', listError.message);
      console.log('This may be normal if using anon key. Proceeding with bucket creation...');
    } else {
      console.log('✅ Connection successful. Existing buckets:', bucketList.map(b => b.name));
    }
  } catch (err) {
    console.log('⚠️ Connection test failed:', err.message);
    console.log('Proceeding with bucket creation anyway...');
  }
  
  for (const bucketId of buckets) {
    try {
      console.log(`📁 Creating bucket: ${bucketId}`);
      
      const { data, error } = await supabase.storage.createBucket(bucketId, {
        public: true,
        fileSizeLimit: 26214400, // 25MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Bucket ${bucketId} already exists`);
        } else {
          console.error(`❌ Error creating bucket ${bucketId}:`, error.message);
          
          // If we get permission error, suggest manual creation
          if (error.message.includes('permission') || error.message.includes('access')) {
            console.log(`💡 Suggestion: Create bucket "${bucketId}" manually in Supabase dashboard`);
          }
        }
      } else {
        console.log(`✅ Successfully created bucket: ${bucketId}`);
      }
    } catch (err) {
      console.error(`💥 Exception creating bucket ${bucketId}:`, err.message);
    }
  }
  
  console.log('🎉 Storage bucket setup complete!');
  console.log('');
  console.log('📝 If some buckets failed to create automatically, please create them manually in your Supabase dashboard:');
  console.log('   1. Go to your Supabase project dashboard');
  console.log('   2. Navigate to Storage > Buckets');
  console.log('   3. Create the following buckets with public access:');
  buckets.forEach(bucket => console.log(`      - ${bucket}`));
}

// Run the setup
createStorageBuckets()
  .then(() => {
    console.log('✨ Setup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }); 