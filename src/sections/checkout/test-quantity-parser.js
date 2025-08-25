// Test file for the parseQuantityAndUnit function
// This can be run to validate the parsing logic

const parseQuantityAndUnit = (input) => {
  const trimmed = input.trim();
  
  // If empty or only whitespace, return default
  if (!trimmed) {
    return { quantity: 1, unit: 'db' };
  }

  // Regex to match number followed by optional unit
  // Supports: "2", "2 kg", "2kg", "2 láda", "2láda", etc.
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZáéíóúöüűÁÉÍÓÚÖÜŰ]*)/);
  
  if (match) {
    const quantity = parseFloat(match[1].replace(',', '.')) || 1;
    const unit = match[2] || 'db';
    return { quantity, unit };
  }

  // If no number found, try to extract unit only and default quantity to 1
  const unitMatch = trimmed.match(/^([a-zA-ZáéíóúöüűÁÉÍÓÚÖÜŰ]+)/);
  if (unitMatch) {
    return { quantity: 1, unit: unitMatch[1] };
  }

  // Fallback: treat entire input as unit with quantity 1
  return { quantity: 1, unit: trimmed || 'db' };
};

// Test cases
const testCases = [
  '2 láda',
  '2láda',
  '2',
  '2kg',
  '2 kg',
  '5 db',
  '5db',
  '3.5 kg',
  '3,5 kg',
  '10 liter',
  'kg',
  'láda',
  '',
  '  ',
  '2.5',
  '100 gramm'
];

console.log('Testing parseQuantityAndUnit function:');
console.log('=====================================');

testCases.forEach(testCase => {
  const result = parseQuantityAndUnit(testCase);
  console.log(`Input: "${testCase}" → Quantity: ${result.quantity}, Unit: "${result.unit}"`);
});
