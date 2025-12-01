import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_CONNECTION_TEST: FAILED');
    console.error('MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { bufferCommands: false });
    console.log('MONGODB_CONNECTION_TEST: SUCCESS');
  } catch (err) {
    console.error('MONGODB_CONNECTION_TEST: FAILED');
    console.error(err?.message || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((err) => {
  console.error('Unexpected error while running test-db-connection.mjs');
  console.error(err?.message || err);
  process.exit(1);
});
