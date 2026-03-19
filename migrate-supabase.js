const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replace imports
        content = content.replace(/import\s+\{\s*(createClientComponentClient|createServerComponentClient)\s*\}\s*from\s*['"]@supabase\/auth-helpers-nextjs['"];?/g, "import { supabase } from '@/lib/supabase';");
        content = content.replace(/import\s+\{\s*createClient\s*\}\s*from\s*['"]@supabase\/supabase-js['"];?/g, "import { supabase } from '@/lib/supabase';");
        
        // Remove duplicate imports of supabase if we added it multiple times or it already existed
        let supabaseImportCount = 0;
        const lines = content.split('\n');
        content = lines.filter(line => {
            if (line.includes("import { supabase } from '@/lib/supabase'")) {
                supabaseImportCount++;
                if (supabaseImportCount > 1) return false;
            }
            return true;
        }).join('\n');

        // Replace initializations
        content = content.replace(/const\s+supabase\s*=\s*createClientComponentClient\([^)]*\);?/g, "");
        content = content.replace(/const\s+supabase\s*=\s*createServerComponentClient\([^)]*\);?/g, "");
        
        // Remove `const supabase = createClient(...)` blocks mapping to Next config
        content = content.replace(/const\s+supabase\s*=\s*createClient\(\s*process\.env[^)]+\);?/gs, "");

        if (content !== original) {
            console.log(`Updated ${filePath}`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
console.log('Done migration.');
