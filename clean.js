const fs = require('fs');
const file = 'client/src/pages/AvatarInterview.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove state
content = content.replace(/const \[language, setLanguage\] = useState\('en'\)\s*/g, '');

// 2. Remove language from emit payloads
content = content.replace(/\{ question: dynamicQuestions\[0\], language \}/g, '{ question: dynamicQuestions[0] }');
content = content.replace(/\{ role, experience, language \}/g, '{ role, experience }');
content = content.replace(/\{ transcript, language, questionContext, role, experience \}/g, '{ transcript, questionContext, role, experience }');
content = content.replace(/qaHistory: qaHistoryRef\.current,\n\s*role,\n\s*experience,\n\s*language/g, 'qaHistory: qaHistoryRef.current,\n        role,\n        experience');

// 3. Fix speech rec and tts
content = content.replace(/rec\.lang = language === 'hi' \? 'hi-IN' : 'en-US'/g, "rec.lang = 'en-US'");
content = content.replace(/const voice = language === 'hi'[\s\S]*?\? 'Aditi'[\s\S]*?: \(avatarGender === 'male' \? 'Brian' : 'Salli'\);/g, "const voice = avatarGender === 'male' ? 'Brian' : 'Salli';");
content = content.replace(/audio\.playbackRate = language === 'hi' \? 1\.0 : 1\.05;/g, "audio.playbackRate = 1.05;");

// 4. Remove toggleLanguage function
content = content.replace(/const toggleLanguage = \(\) => \{[\s\S]*?\}\n/g, '');

// 5. Replace [language] in useEffect with []
content = content.replace(/, \[language\]\)/g, ', [])');

// 6. Replace string ternaries
// Single line strings
content = content.replace(/language === 'en'\s*\?\s*(['"`])(.*?)\1\s*:\s*(['"`])(.*?)\3/g, '$1$2$1');

// Multi-line strings like language === 'en'\n ? '...' : '...'
content = content.replace(/language === 'en'\s*\n\s*\?\s*(['"`])(.*?)\1\s*\n\s*:\s*(['"`])(.*?)\3/g, '$1$2$1');

// Handle special case where it's wrapped in ()
content = content.replace(/\(language === 'en'\s*\?\s*(['"`])(.*?)\1\s*:\s*(['"`])(.*?)\3\)/g, '$1$2$1');

// 7. Remove UI toggle section
const toggleUiRegex = /\{\/\* Language Toggle \*\/\}\s*<div.*?Interview Language.*?<\/div>\n/s;
content = content.replace(toggleUiRegex, '');

// 8. Remove UI badge
const badgeRegex = /\{\/\* Language Badge \*\/\}\s*<button onClick=\{toggleLanguage\}[^>]*>\s*<BsGlobe2 size=\{12\} \/>[\s\S]*?<\/button>\n/s;
content = content.replace(badgeRegex, '');

fs.writeFileSync(file, content);
console.log("Cleanup complete!");
