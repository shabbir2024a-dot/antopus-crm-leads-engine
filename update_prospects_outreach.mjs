import { Antopus, t } from '@bigsur/antopus';

const DB_PATH = './whatsapp_leads.db';
const db = new Antopus(DB_PATH);

const orm = db.orm({
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

async function updateStatus() {
  const dispatchedIds = [
    'prospect_001', 'prospect_002', 'prospect_003', 'prospect_004', 'prospect_005',
    'prospect_006', 'prospect_007', 'prospect_008', 'prospect_009', 'prospect_010',
    'prospect_011', 'prospect_012', 'prospect_013', 'prospect_014'
  ];

  console.log("Updating outreachStatus to OUTREACH_SENT for all 14 dispatched prospects...");
  
  for (const pid of dispatchedIds) {
    try {
      const records = await orm.prospect.findMany({
        where: { prospectId: pid }
      });
      if (records && records.length > 0) {
        await orm.prospect.update({
          where: { id: records[0].id },
          data: { outreachStatus: 'OUTREACH_SENT' }
        });
        console.log(`Updated ${pid} (${records[0].businessName}) -> OUTREACH_SENT`);
      }
    } catch (err) {
      console.error(`Error updating ${pid}:`, err.message);
    }
  }

  console.log("Status update complete in Antopus DB!");
}

updateStatus();
