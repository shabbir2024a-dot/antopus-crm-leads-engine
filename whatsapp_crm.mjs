import { Antopus, t } from '@bigsur/antopus';
import fs from 'fs';
import path from 'path';

const DB_PATH = './whatsapp_leads.db';
const LEADS_JSON = '/Users/bishal/whatsapp_ai_bot/leads_db.json';

console.log("⚡ Initializing Antopus Database:", DB_PATH);
const db = new Antopus(DB_PATH);

// 1. Define Typed ORM Schema with full-text search
const orm = db.orm({
  Lead: {
    id: t.id(),
    leadId: t.string().optional(),
    phone: t.string(),
    name: t.string(),
    category: t.string(),
    intent: t.string(),
    message: t.text().search(),
    response: t.text(),
    status: t.string().default('AI_RESPONDED_24X7'),
    createdAt: t.date().default('now'),
  }
});

async function main() {
  console.log("📦 Ingesting WhatsApp Leads into Antopus...");
  
  if (fs.existsSync(LEADS_JSON)) {
    const rawData = JSON.parse(fs.readFileSync(LEADS_JSON, 'utf8'));
    let imported = 0;

    for (const item of rawData) {
      try {
        await orm.lead.create({
          data: {
            leadId: item.id || `lead_${Date.now()}_${Math.random()}`,
            phone: item.phone || '',
            name: item.name || 'Client',
            category: item.category || 'General',
            intent: item.intent || 'inquiry',
            message: item.message || '',
            response: item.response || '',
            status: item.status || 'AI_RESPONDED_24X7',
            createdAt: item.timestamp ? new Date(item.timestamp) : new Date(),
          }
        });
        imported++;
      } catch (e) {
        // Ignore errors
      }
    }
    console.log(`✅ Successfully imported ${imported} leads into Antopus!`);
  }

  // 2. Querying leads via ORM
  console.log("\n📊 Total Leads by Category:");
  const { rows: stats } = await db.query(`
    SELECT category, COUNT(*) as count 
    FROM Lead 
    GROUP BY category 
    ORDER BY count DESC;
  `);
  console.table(stats);

  // 3. Full-text search demonstration
  console.log("\n🔍 Full-Text Search for 'clinic':");
  const clinicLeads = await orm.lead.findMany({
    where: {
      message: { contains: 'clinic' }
    },
    take: 3
  });
  console.log(clinicLeads.map(l => ({ name: l.name, phone: l.phone, message: l.message })));

  await db.close();
  console.log("\n🎉 Antopus Database Ready! Run `npx antopus ./whatsapp_leads.db` to launch Studio UI.");
}

main().catch(console.error);
