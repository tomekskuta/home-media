type EntryData = {
  dates: string[];
  electricity: number[];
  gas: number[];
  water: number[];
};

type UsageRecord = {
  date: string;
  value: string;
};

type MinMaxAverage = {
  min: UsageRecord;
  max: UsageRecord;
  average: string;
};

type ReturnData = {
  electricity: MinMaxAverage;
  gas: MinMaxAverage;
  water: MinMaxAverage;
};

const isCurrentMonth = (date: string): boolean => {
  const [month, year] = date.split('.').map(Number);
  const now = new Date();
  return month === now.getMonth() + 1 && year === now.getFullYear();
};

export const getUsageStats = (entryData: EntryData): ReturnData => {
  const calculateStats = (
    values: number[],
    dates: string[],
    type: 'electricity' | 'gas' | 'water',
  ): MinMaxAverage => {
    if (values.length === 0) {
      return {
        min: { date: '', value: '0' },
        max: { date: '', value: '0' },
        average: '0',
      };
    }

    const formatValue = (value: number): string => {
      if (type === 'electricity') {
        return Math.round(value).toString();
      }
      return value.toFixed(3);
    };

    // Filter out current month for min calculation if it's not finished
    const minValue = Math.min(
      ...values.filter((_, index) => !isCurrentMonth(dates[index])),
    );
    const maxValue = Math.max(...values);

    const minIndex = values.indexOf(minValue);
    const maxIndex = values.indexOf(maxValue);

    const minRecord: UsageRecord = {
      date: dates[minIndex],
      value: formatValue(minValue),
    };

    const maxRecord: UsageRecord = {
      date: dates[maxIndex],
      value: formatValue(maxValue),
    };

    const averageValue =
      values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
      min: minRecord,
      max: maxRecord,
      average: formatValue(averageValue),
    };
  };

  return {
    electricity: calculateStats(
      entryData.electricity,
      entryData.dates,
      'electricity',
    ),
    gas: calculateStats(entryData.gas, entryData.dates, 'gas'),
    water: calculateStats(entryData.water, entryData.dates, 'water'),
  };
};
