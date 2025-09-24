const fs = require('fs');
const path = require('path');

function copyDir(src, dest){
  if(!fs.existsSync(src)) return;
  if(!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for(const entry of fs.readdirSync(src)){
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if(stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const dist = path.join(__dirname, '..', 'app', 'dist');
const resources = path.join(__dirname, '..', 'resources');
copyDir(dist, resources);
console.log('Copied build from', dist, 'to', resources);
