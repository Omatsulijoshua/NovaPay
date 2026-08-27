export function formatAccountNumber(accNum: string): string {
  if (accNum.length === 10) {
    return `${accNum.slice(0, 5)} ${accNum.slice(5)}`;
  }
  return accNum;
}

export function isValidAccountNumber(accNum: string): boolean {
  return /^\d{10}$/.test(accNum);
}
