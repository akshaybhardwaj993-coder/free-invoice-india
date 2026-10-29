const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertGroup(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertGroup(n % 100) : '');
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  const crores = Math.floor(rupees / 10000000);
  const lakhs = Math.floor((rupees % 10000000) / 100000);
  const thousands = Math.floor((rupees % 100000) / 1000);
  const hundreds = rupees % 1000;
  
  let words = 'Rupees ';
  if (crores > 0) words += convertGroup(crores) + ' Crore ';
  if (lakhs > 0) words += convertGroup(lakhs) + ' Lakh ';
  if (thousands > 0) words += convertGroup(thousands) + ' Thousand ';
  if (hundreds > 0) words += convertGroup(hundreds);
  
  if (paise > 0) {
    words += ' and ' + convertGroup(paise) + ' Paise';
  }
  
  return words + ' Only';
}
