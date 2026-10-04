import * as csv from '../js/core/csv.js';
import fs from 'fs';

const sample = '\uFEFFid,title,views\r\n1,"Hello, world",100\r\n2,"""Quoted""",200\r\n3,"Line 1\nLine 2",300\r\n';
const parsed = csv.parse(sample);
console.log('Parsed count:', parsed.length);
console.log('Parsed items:', parsed);

const out = csv.stringify(parsed);
console.log('Stringified output:\n' + out);

const reparsed = csv.parse(out);
console.log('Test 1 title:', reparsed[0].title === 'Hello, world');
console.log('Test 2 quoted:', reparsed[1].title === '"Quoted"');
console.log('Test 3 multiline:', reparsed[2].title === 'Line 1\nLine 2');

// Test reading actual CSV files from data/
for (const file of ['users.csv', 'video_categories.csv', 'videos.csv', 'video_views_daily.csv', 'password_resets.csv']) {
  const content = fs.readFileSync(`data/${file}`, 'utf-8');
  const rows = csv.parse(content);
  console.log(`File data/${file} parsed successfully: ${rows.length} rows`);
}
