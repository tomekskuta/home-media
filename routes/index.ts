import express from 'express';

import { SHEET_FIELDS } from '@/enums';
import getGoogleSheetsData from '@/services/googleSheetsService';
import { getMonthlyUsage } from '@/services/getMonthlyUsage';
import { getUsageStats } from '@/services/getUsageStats';

const router = express.Router();

/* GET home page. */
router.get('/', async function (_req, res) {
  try {
    const data = await getGoogleSheetsData();
    const { dates, gas, water, electricity } = getMonthlyUsage(data);

    const usageStats = getUsageStats({
      dates,
      electricity,
      gas,
      water,
    });

    const lastRecordEntry = data.at(-1);
    const lastRecord = lastRecordEntry
      ? {
        date: lastRecordEntry[SHEET_FIELDS.DATE],
        water: lastRecordEntry[SHEET_FIELDS.WATER],
        electricity: lastRecordEntry[SHEET_FIELDS.ELECTRICITY],
        gas: lastRecordEntry[SHEET_FIELDS.GAS],
      }
      : {};

    res.render('index', {
      dates,
      waterData: water,
      electricityData: electricity,
      gasData: gas,
      lastRecord,
      electricityStats: usageStats.electricity,
      gasStats: usageStats.gas,
      waterStats: usageStats.water,
    });
  } catch (error: unknown) {
    console.error('🛸[33]: index.ts:13: error=', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).send(errorMessage);
  }
});

export default router;
