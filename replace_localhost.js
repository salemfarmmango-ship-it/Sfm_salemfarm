const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost/SFM')) {
                content = content.replace(/http:\/\/localhost\/SFM/g, 'http://127.0.0.1/SFM');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir('C:\\xampp\\htdocs\\SFM\\src\\app\\api');
console.log('Done.');
