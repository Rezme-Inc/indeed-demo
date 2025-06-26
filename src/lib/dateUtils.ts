export function addBusinessDays(startDate: Date, businessDays: number): Date {
  let days = 0;
  let date = new Date(startDate);
  while (days < businessDays) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days++;
    }
  }
  return date;
}

export function getBusinessDaysRemaining(sentDate: Date): number {
  const today = new Date();
  let days = 0;
  let date = new Date(sentDate);
  while (date < today) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days++;
    }
  }
  return Math.max(5 - days, 0);
}
