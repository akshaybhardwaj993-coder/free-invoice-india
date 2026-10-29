export type CommandResult = {
  type: 'expense' | 'income' | 'invoice' | 'unknown';
  amount: number;
  description: string;
  client?: string;
};

export function parseCommand(text: string): CommandResult {
  const lowerText = text.toLowerCase();
  
  // Extract amount (looks for numbers like 500, 500.00, ₹500, $500, 6000)
  const amountMatch = text.match(/(?:₹|\$|rs\.?\s?|inr\s?)?(\d+(?:,\d+)*(?:\.\d+)?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  // Extract client name - improved regex to handle parentheses and various formats
  let client = 'Unknown Client';
  
  // Try to find client after "to", "from", "invoice", "billed"
  const clientPatterns = [
    /(?:to|from)\s+([a-zA-Z][a-zA-Z0-9\s]*?)(?:\s+\(|\s+for|\s+on|\s+of|\s+at|$)/i,
    /(?:invoice|billed)\s+([a-zA-Z][a-zA-Z0-9\s]*?)(?:\s+\(|\s+for|\s+on|\s+of|\s+at|\s+\d|$)/i,
    /(?:paid|sent|gave)\s+(?:|\$|rs\.?\s?|\d)*\s*(?:to\s+)?([a-zA-Z][a-zA-Z0-9\s]*?)(?:\s+for|\s+on|\s+of|\s+at|$)/i,
  ];
  
  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match) {
      client = match[1].trim();
      // Remove trailing words like "for", "on", "of"
      client = client.replace(/\s+(for|on|of|at|the|a|an)\s*$/i, '').trim();
      if (client.length > 1) break;
    }
  }

  // Clean description - remove command words and amount
  let description = text;
  description = description.replace(amountMatch?.[0] || '', '').trim();
  description = description.replace(/^(invoice|invoiced|billed|paid|sent|received|got|expense|income)\s+(to|from)?\s*/i, '').trim();
  description = description.replace(new RegExp(client, 'i'), '').trim();
  description = description.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  description = description.charAt(0).toUpperCase() + description.slice(1);
  
  if (!description || description.length < 3) {
    description = client !== 'Unknown Client' ? `Payment to ${client}` : 'Transaction';
  }

  // Determine Type
  if (lowerText.includes('paid') || lowerText.includes('spent') || lowerText.includes('expense') || lowerText.includes('sent')) {
    return { type: 'expense', amount, description, client };
  }
  if (lowerText.includes('received') || lowerText.includes('got') || lowerText.includes('income') || lowerText.includes('salary')) {
    return { type: 'income', amount, description, client };
  }
  if (lowerText.includes('invoic') || lowerText.includes('billed') || lowerText.includes('bill')) {
    return { type: 'invoice', amount, description, client };
  }

  return { type: 'unknown', amount: 0, description: text };
}
