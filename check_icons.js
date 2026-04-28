const fs = require('fs');
const content = fs.readFileSync('node_modules/lucide-react/dist/lucide-react.d.ts', 'utf8');
const exports = content.match(/export const [A-Z][a-zA-Z]+/g) || [];
const icons = exports.map(e => e.replace('export const ', ''));
console.log('Facebook?', icons.includes('Facebook'));
console.log('Twitter?', icons.includes('Twitter'));
console.log('Instagram?', icons.includes('Instagram'));
console.log('Hash?', icons.includes('Hash'));
