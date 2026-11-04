import { Antopus, t } from '@bigsur/antopus';
import fs from 'fs';

const DB_PATH = './whatsapp_leads.db';
const PROSPECTS_JSON = './guwahati_b2b_prospects.json';

const db = new Antopus(DB_PATH);

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
  },
  Prospect: {
    id: t.id(),
    prospectId: t.string().unique(),
    businessName: t.string().search(),
    category: t.string(),
    area: t.string(),
    contactPhone: t.string(),
    targetService: t.string(),
    outreachStatus: t.string().default('DISCOVERED'),
    warmIntroMessage: t.text(),
    closingPitch: t.text(),
    estimatedDealValue: t.string(),
    createdAt: t.date().default('now'),
  }
});

async function main() {
  console.log("⚡ Ingesting 200 B2B Prospects into Antopus Database...");
  const raw = JSON.parse(fs.readFileSync(PROSPECTS_JSON, 'utf8'));

  let count = 0;
  for (const item of raw) {
    try {
      await orm.prospect.create({
        data: {
          prospectId: item.id,
          businessName: item.businessName,
          category: item.category,
          area: item.area,
          contactPhone: item.contactPhone,
          targetService: item.targetService,
          outreachStatus: item.outreachStatus,
          warmIntroMessage: item.warmIntroMessage,
          closingPitch: item.closingPitch,
          estimatedDealValue: item.estimatedDealValue,
          createdAt: new Date(),
        }
      });
      count++;
    } catch (e) {
      // Ignore duplicates
    }
  }

  console.log(`✅ Loaded ${count} prospects into Antopus!`);

  const { rows } = await db.query(`
    SELECT category, COUNT(*) as total_leads, MIN(estimatedDealValue) as value_range 
    FROM Prospect 
    GROUP BY category;
  `);
  console.table(rows);

  await db.close();
}

main().catch(console.error);
