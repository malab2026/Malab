const fs = require('fs');
const path = require('path');
const keystorePath = path.join(__dirname, 'my-upload-key.keystore');
try {
    const buffer = fs.readFileSync(keystorePath);
    const base64 = buffer.toString('base64');
    fs.writeFileSync('clean_base64.txt', base64, 'utf8');
    console.log('SUCCESS: Clean Base64 generated in clean_base64.txt');
    console.log('Length:', base64.length);
} catch (err) {
    console.error('ERROR:', err.message);
}
