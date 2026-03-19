const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app/api/admin', function(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Remove unused variables related to supabase envs
        content = content.replace(/const\s+supabase(?:Url|AnonKey|ServiceKey)\s*=\s*process\.env[^;]+;?/gi, "");
        
        // Remove createClient initializations
        content = content.replace(/const\s+supabaseAdmin\s*=\s*createClient\([^;]+;?/g, "");
        content = content.replace(/const\s+supabase\s*=\s*createClient\([^;]+;?/g, "");
        
        // Remove import
        content = content.replace(/import\s*\{\s*createClient\s*\}\s*from\s*['"]@supabase\/supabase-js['"];?/g, "");

        if (content !== original) {
            console.log(`Cleaned ${filePath}`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
console.log('Admin API Cleanup done.');
