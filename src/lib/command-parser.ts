export type CommandResult = {
  type: 'expense' | 'income' | 'invoice' | 'unknown';
  amount: number;
  description: string;
  client?: string;
};

export function parseCommand(text: string): CommandResult {
  const lowerText = text.toLowerCase();
  
  // Extract amount (looks for numbers like 500, 500.00, ₹500, $500)
  const amountMatch = text.match(/(?:₹|\$|rs\.?\s?)?(\d+(?:\.\d+)?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Extract client name (usually after "to" or "from")
  const clientMatch = text.match(/(?:to|from)\s+([A-Za-z0-9\s]+?)(?:\s+for|\s+on|$)/i);
  const client = clientMatch ? clientMatch[1].trim() : 'Unknown Client';

  // Clean description
  let description = text.replace(amountMatch?.[0] || '', '').trim();
  description = description.replace(/^(paid|received|invoiced|billed|spent|got)\s+(to|from)?\s*/i, '').trim();
  if (!description) description = client !== 'Unknown Client' ? `Payment ${client}` : 'Transaction';

  // Determine Type
  if (lowerText.includes('paid') || lowerText.includes('spent') || lowerText.includes('expense')) {
    return { type: 'expense', amount, description, client };
  }
  if (lowerText.includes('received') || lowerText.includes('got') || lowerText.includes('income') || lowerText.includes('salary')) {
    return { type: 'income', amount, description, client };
  }
  if (lowerText.includes('invoiced') || lowerText.includes('billed') || lowerText.includes('invoice')) {
    return { type: 'invoice', amount, description, client };
  }

  return { type: 'unknown', amount: 0, description: text };
}
