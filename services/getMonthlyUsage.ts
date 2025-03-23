import { SHEET_FIELDS } from '@/enums';
import { MediaEntry, GoogleSheetMedia } from '@/types';

type ReturnData = {
  dates: string[];
  electricity: number[];
  gas: number[];
  water: number[];
};

export const getMonthlyUsage = (
  googleSheetMedia: GoogleSheetMedia,
): ReturnData => {
  const parseValue = (val: string | number) => {
    if (typeof val === 'number') return val;
    return Number(val.replace(',', '.'));
  };

  // Prepare data structure for efficient lookup and interpolation
  const dataByDate = new Map<string, (typeof googleSheetMedia)[0]>();
  const dateObjects: { date: Date; entry: (typeof googleSheetMedia)[0] }[] = [];

  googleSheetMedia.forEach((entry) => {
    const [day, month, year] = entry[SHEET_FIELDS.DATE].split('.').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dataByDate.set(entry[SHEET_FIELDS.DATE], entry);
    dateObjects.push({ date: dateObj, entry });
  });

  // Create array of all required first days of months
  const firstDayEntries: MediaEntry[] = [];
  let currentDate = new Date(dateObjects[0].date);
  const lastDate = dateObjects[dateObjects.length - 1].date;

  while (currentDate <= lastDate) {
    const dateStr = `01.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;

    // Check if we have actual data for this date
    const actualEntry = dataByDate.get(dateStr);
    if (actualEntry) {
      firstDayEntries.push([
        dateStr,
        actualEntry[SHEET_FIELDS.WATER],
        actualEntry[SHEET_FIELDS.ELECTRICITY],
        actualEntry[SHEET_FIELDS.GAS],
      ] as MediaEntry);
    } else {
      // Find surrounding entries for interpolation
      const targetTime = currentDate.getTime();
      const before = dateObjects.findLast((d) => d.date.getTime() < targetTime);
      const after = dateObjects.find((d) => d.date.getTime() > targetTime);

      if (before && after) {
        const totalDays =
          (after.date.getTime() - before.date.getTime()) /
          (1000 * 60 * 60 * 24);
        const daysToTarget =
          (targetTime - before.date.getTime()) / (1000 * 60 * 60 * 24);
        const ratio = daysToTarget / totalDays;

        // Interpolate values
        // Calculate interpolated values for each utility
        const utilities = [SHEET_FIELDS.WATER, SHEET_FIELDS.ELECTRICITY, SHEET_FIELDS.GAS];
        const interpolatedValues = utilities.map((field) => {
          const currentVal = parseValue(before.entry[field]);
          const nextVal = parseValue(after.entry[field]);
          const diff = nextVal - currentVal;
          const interpolated = currentVal + diff * ratio;
          return field === SHEET_FIELDS.ELECTRICITY
            ? interpolated
            : String(interpolated.toFixed(3)).replace('.', ',');
        });

        firstDayEntries.push([
          dateStr,
          interpolatedValues[0] as string,
          interpolatedValues[1] as number,
          interpolatedValues[2] as string,
        ] as MediaEntry);
      }
    }

    // Move to first day of next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
  }

  const dates: string[] = [];
  const water: number[] = [];
  const electricity: number[] = [];
  const gas: number[] = [];

  // Calculate monthly usage using consecutive first-day measurements
  for (let i = 0; i < firstDayEntries.length - 1; i++) {
    const currentEntry = firstDayEntries[i];
    const nextEntry = firstDayEntries[i + 1];

    const [, month, year] = currentEntry[SHEET_FIELDS.DATE].split('.').map(Number);
    dates.push(`${month.toString().padStart(2, '0')}.${year}`);

    water.push(parseValue(nextEntry[SHEET_FIELDS.WATER]) - parseValue(currentEntry[SHEET_FIELDS.WATER]));
    electricity.push(parseValue(nextEntry[SHEET_FIELDS.ELECTRICITY]) - parseValue(currentEntry[SHEET_FIELDS.ELECTRICITY]));
    gas.push(parseValue(nextEntry[SHEET_FIELDS.GAS]) - parseValue(currentEntry[SHEET_FIELDS.GAS]));
  }

  // Add last month's usage based on the most recent record
  const lastEntry = googleSheetMedia[googleSheetMedia.length - 1];
  const lastFirstDayEntry = firstDayEntries[firstDayEntries.length - 1];
  
  // Only add if the last record is not from the 1st day of the month
  if (lastEntry[SHEET_FIELDS.DATE] !== lastFirstDayEntry[SHEET_FIELDS.DATE]) {
    const [, month, year] = lastFirstDayEntry[SHEET_FIELDS.DATE].split('.').map(Number);
    dates.push(`${month.toString().padStart(2, '0')}.${year}`);

    water.push(parseValue(lastEntry[SHEET_FIELDS.WATER]) - parseValue(lastFirstDayEntry[SHEET_FIELDS.WATER]));
    electricity.push(parseValue(lastEntry[SHEET_FIELDS.ELECTRICITY]) - parseValue(lastFirstDayEntry[SHEET_FIELDS.ELECTRICITY]));
    gas.push(parseValue(lastEntry[SHEET_FIELDS.GAS]) - parseValue(lastFirstDayEntry[SHEET_FIELDS.GAS]));
  }

  return {
    dates,
    water,
    electricity,
    gas,
  };
};
