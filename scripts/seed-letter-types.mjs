// Try to load dotenv if available; otherwise fall back to parsing .env ourselves.
try {
  await import('dotenv/config');
} catch (e) {
  try {
    const fs = await import('fs');
    const env = fs.readFileSync('.env', 'utf8');
    env.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
      }
    });
  } catch (err) {
    // ignore — we'll rely on process.env
  }
}

import { Client } from 'pg';

const SQL = `
INSERT INTO letter_types (code, name_ar, name_en)
VALUES
  ('A', 'إجازة مساعدة', 'Box A - Assistant Leave'),
  ('B', 'إجازة وقتية', 'Box B - Temporary Leave'),
  ('C', 'إجازة بدون راتب', 'Box C - Unpaid Leave'),
  ('D', 'إجازة مرضية', 'Box D - Sick Leave'),
  ('E', 'إجازة أبوة', 'Box E - Paternity Leave'),
  ('F', 'إجازة أمومة', 'Box F - Maternity Leave'),
  ('G', 'إجازة وفاة', 'Box G - Bereavement Leave / Compassionate'),
  ('H', 'إجازة سفر', 'Box H - Travel Leave'),
  ('I', 'إجازة حج وعمرة', 'Box I - Hajj & Umrah Leave')
ON CONFLICT (code) DO NOTHING;
`;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(SQL);
    console.log('Seed complete:', res.rowCount, 'rows affected');
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
