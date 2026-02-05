const fs = require('fs');
try {
    const buffer = fs.readFileSync('release.jks');
    const base64 = buffer.toString('base64');
    fs.writeFileSync('final_b64.txt', base64, 'ascii');
    console.log('SUCCESS: Length = ' + base64.length);
} catch (err) {
    console.error(err);
}
