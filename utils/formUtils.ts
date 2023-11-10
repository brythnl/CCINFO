function formatDate(date: Date) {
  return date.toISOString().split('T')[0].toString().replace('/T/','');
}

export const todayDate = formatDate(new Date())

const date = new Date();
date.setFullYear(date.getFullYear() + 10);
export const inTenYears = formatDate(date)

export const formatNumber = (num: number): number => {
  return Number(num
    .toString()
    .replace(',', '.')
  );
}

export const findSmallestDate = (dates: string[]): string => {
  dates.sort((a: string, b: string) => new Date(a).valueOf() - new Date(b).valueOf())
  return dates[0];
}

export const findBiggestDate = (dates: string[]): string => {
  dates.sort((a: string, b: string) => new Date(b).valueOf()- new Date(a).valueOf())
  return dates[0];
}

// export const validateInput = (...): ... => {
//
// }

// export const setEndDateToBiggestDate = (...): ... => {
//
// }
