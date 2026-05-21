const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        let fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.jsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('d:/SmartHireAI/client/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Primary CTA buttons replacements
    content = content.replace(/bg-emerald-600 hover:bg-emerald-[457]00/g, 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90');
    content = content.replace(/bg-emerald-500 hover:bg-emerald-[467]00/g, 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90');
    content = content.replace(/bg-green-600 hover:bg-green-[457]00/g, 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90');
    content = content.replace(/bg-green-500 hover:bg-green-[467]00/g, 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90');
    
    // Shadows for primary buttons
    content = content.replace(/shadow-emerald-600\/\d+/g, 'shadow-purple-500/30');
    content = content.replace(/shadow-emerald-500\/\d+/g, 'shadow-purple-500/30');

    // Generic replacements for emerald accents
    content = content.replace(/emerald-50/g, 'purple-50');
    content = content.replace(/emerald-100/g, 'purple-100');
    content = content.replace(/emerald-200/g, 'purple-200');
    content = content.replace(/emerald-300/g, 'purple-300');
    content = content.replace(/emerald-400/g, 'purple-400');
    content = content.replace(/emerald-500/g, 'purple-500');
    content = content.replace(/emerald-600/g, 'purple-600');
    content = content.replace(/emerald-700/g, 'purple-700');
    content = content.replace(/emerald-800/g, 'purple-800');
    content = content.replace(/emerald-900/g, 'purple-900');
    content = content.replace(/emerald-950/g, 'purple-950');

    // Generic replacements for green accents (we leave standard green if it's not a tailwind class? No, tailwind classes use hyphen)
    // Be careful with animation dot which is `bg-green-400 rounded-full animate-pulse` in AvatarInterview, we can just let it become purple, that's fine.
    content = content.replace(/green-50/g, 'purple-50');
    content = content.replace(/green-100/g, 'purple-100');
    content = content.replace(/green-200/g, 'purple-200');
    content = content.replace(/green-300/g, 'purple-300');
    content = content.replace(/green-400/g, 'purple-400');
    content = content.replace(/green-500/g, 'purple-500');
    content = content.replace(/green-600/g, 'purple-600');
    content = content.replace(/green-700/g, 'purple-700');
    content = content.replace(/green-800/g, 'purple-800');
    content = content.replace(/green-900/g, 'purple-900');
    content = content.replace(/green-950/g, 'purple-950');

    // Hex codes
    content = content.replace(/#10b981/gi, '#A855F7');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
