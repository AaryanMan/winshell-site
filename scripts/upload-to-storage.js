const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'winshell-69.appspot.com'
});

const bucket = admin.storage().bucket();

async function uploadFile(localPath, storagePath) {
  try {
    console.log(`Uploading ${localPath} to ${storagePath}...`);
    
    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: {
        contentType: 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
      },
      public: true,
    });

    const file = bucket.file(storagePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    // Make the file publicly accessible
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    
    console.log(`✅ Upload complete!`);
    console.log(`Public URL: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function main() {
  const exePath = path.join(__dirname, '../public/downloads/WinShell-Windows-Installer.exe');
  const debPath = path.join(__dirname, '../public/downloads/WinShell-Linux-Installer.deb');
  
  if (fs.existsSync(exePath)) {
    await uploadFile(exePath, 'downloads/WinShell-Windows-Installer.exe');
  } else {
    console.log('⚠️  .exe file not found');
  }
  
  if (fs.existsSync(debPath)) {
    await uploadFile(debPath, 'downloads/WinShell-Linux-Installer.deb');
  } else {
    console.log('⚠️  .deb file not found');
  }
  
  process.exit(0);
}

main();
