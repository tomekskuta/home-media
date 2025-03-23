import { google } from 'googleapis';

import type { GoogleSheetMedia } from '@/types';

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getGoogleSheetsData(): Promise<GoogleSheetMedia> {
  const auth = await google.auth.getClient({
    scopes,
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const range = 'Arkusz1!A2:D';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
  });

  return response.data.values as GoogleSheetMedia;
}

export default getGoogleSheetsData;
