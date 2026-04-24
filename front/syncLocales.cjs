const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const langs = ['en', 'fr', 'vi'];

function deepMergeKeys(objList) {
  const merged = {};
  for (const obj of objList) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj)) {
        if (!merged[k]) {
          merged[k] = {};
        }
      }
    }
  }

  for (const k of Object.keys(merged)) {
    const vals = objList.map(o => (o && o[k] !== undefined) ? o[k] : undefined).filter(v => v !== undefined);
    const firstVal = vals[0];
    
    if (typeof firstVal === 'object' && !Array.isArray(firstVal)) {
      merged[k] = deepMergeKeys(objList.map(o => (o && o[k]) ? o[k] : {}));
    } else {
      merged[k] = firstVal; // Use the first available value as template
    }
  }
  return merged;
}

function syncFile(filename) {
  const filePaths = langs.map(lang => path.join(localesDir, lang, filename));
  const objects = filePaths.map(p => {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      return {};
    }
  });

  const allKeysTemplate = deepMergeKeys(objects);

  function fillMissing(template, target, lang, fallbackObjList) {
    const result = {};
    for (const [k, v] of Object.entries(template)) {
      if (typeof v === 'object' && !Array.isArray(v)) {
        result[k] = fillMissing(v, target ? target[k] : undefined, lang, fallbackObjList.map(o => o ? o[k] : undefined));
      } else {
        if (target && target[k] !== undefined) {
          result[k] = target[k];
        } else {
          // Find fallback value
          const fallback = fallbackObjList.find(o => o && o[k] !== undefined);
          result[k] = fallback ? fallback[k] : v;
        }
      }
    }
    return result;
  }

  for (let i = 0; i < langs.length; i++) {
    const lang = langs[i];
    const synced = fillMissing(allKeysTemplate, objects[i], lang, objects);
    fs.writeFileSync(filePaths[i], JSON.stringify(synced, null, 2) + '\n', 'utf8');
  }
}

const enDir = path.join(localesDir, 'en');
const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  syncFile(file);
  console.log('Synced ' + file);
}
