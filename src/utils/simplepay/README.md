# SimplePay Finish Transaction Utilities

This module extends the `simplepay-js-sdk` package with transaction completion functionality that was missing from the original SDK.

## Overview

The SimplePay finish endpoint allows you to complete, partially charge, or cancel previously initiated transactions. This is essential for e-commerce workflows where you might need to:

- Fully charge a reserved amount
- Partially charge and release the remainder
- Cancel and release the entire reserved amount

## Installation & Setup

Ensure you have the required environment variables set up:

```bash
# Required for each currency you want to support
SIMPLEPAY_MERCHANT_KEY_HUF=your_merchant_key_for_huf
SIMPLEPAY_MERCHANT_ID_HUF=your_merchant_id_for_huf

# Optional: Set to 'true' for production (defaults to sandbox)
SIMPLEPAY_PRODUCTION=false

# Optional: Enable detailed logging
SIMPLEPAY_LOGGER=true
```

## Usage

### Basic Import

```typescript
import { 
  finishTransaction,
  fullyChargeTransaction,
  partiallyChargeTransaction,
  cancelTransaction
} from 'src/utils/simplepay'
```

### Key Concepts

- **originalTotal**: Must exactly match the amount that was originally reserved
- **approveTotal**: Determines the final outcome:
  - Same as `originalTotal` = full charge
  - Less than `originalTotal` but > 0 = partial charge (remainder released)
  - 0 = full cancellation (entire amount released)

### Simple Usage Examples

#### 1. Fully Charge a Transaction

```typescript
const result = await fullyChargeTransaction(
  'ORDER-123456789',  // orderRef
  2500               // originalTotal in HUF
)
```

#### 2. Partially Charge a Transaction

```typescript
const result = await partiallyChargeTransaction(
  'ORDER-123456789',  // orderRef
  2500,              // originalTotal
  1500               // approveTotal (charges 1500, releases 1000)
)
```

#### 3. Cancel/Release a Transaction

```typescript
const result = await cancelTransaction(
  'ORDER-123456789',  // orderRef
  2500               // originalTotal (will be fully released)
)
```

### Advanced Usage

#### Using Transaction ID Instead of Order Reference

```typescript
const result = await finishTransaction({
  transactionId: 'TXN-987654321',  // Use transactionId instead of orderRef
  originalTotal: 1000,
  approveTotal: 800,               // Partial charge
  currency: 'HUF'
})
```

#### Custom Merchant Configuration

```typescript
const result = await finishTransaction({
  orderRef: 'ORDER-123456789',
  originalTotal: 2500,
  approveTotal: 0,  // Cancel transaction
  currency: 'HUF'
}, {
  merchantAccount: 'CUSTOM_MERCHANT_ID'  // Override default merchant
})
```

### Integration Example

```typescript
async function processOrderCompletion(
  orderId: string, 
  finalAmount: number, 
  reservedAmount: number
) {
  try {
    let result;
    
    if (finalAmount === 0) {
      // Cancel the entire order
      result = await cancelTransaction(orderId, reservedAmount)
      console.log(`Order ${orderId} cancelled, ${reservedAmount} HUF released`)
    } else if (finalAmount === reservedAmount) {
      // Charge the full amount
      result = await fullyChargeTransaction(orderId, reservedAmount)
      console.log(`Order ${orderId} fully charged: ${reservedAmount} HUF`)
    } else {
      // Partial charge
      result = await partiallyChargeTransaction(orderId, reservedAmount, finalAmount)
      const released = reservedAmount - finalAmount
      console.log(`Order ${orderId}: ${finalAmount} HUF charged, ${released} HUF released`)
    }
    
    return { success: true, result }
  } catch (error) {
    console.error(`Order completion failed:`, error)
    return { success: false, error }
  }
}
```

## API Reference

### Types

```typescript
interface FinishTransactionData {
  orderRef?: string              // Either orderRef or transactionId required
  transactionId?: string         // Either orderRef or transactionId required
  originalTotal: number | string // Must match reserved amount exactly
  approveTotal: number | string  // Final charge amount (see concept above)
  currency?: Currency           // Defaults to 'HUF'
}

interface FinishTransactionConfig {
  merchantAccount?: string      // Optional merchant override
}

interface SimplePayFinishResponse {
  salt: string
  merchant: string
  orderRef?: string
  transactionId?: string
  originalTotal: string
  approveTotal: string
  currency: Currency
  status: 'FINISHED' | 'ERROR'
  errorCodes?: string[]
}
```

### Functions

#### `finishTransaction(data, config?)`
Main function for completing transactions with full control over parameters.

#### `fullyChargeTransaction(orderRef, originalTotal, config?)`
Helper for charging the complete reserved amount.

#### `partiallyChargeTransaction(orderRef, originalTotal, approveTotal, config?)`
Helper for charging a partial amount and releasing the remainder.

#### `cancelTransaction(orderRef, originalTotal, config?)`
Helper for cancelling and releasing the entire reserved amount.

## Error Handling

The functions throw descriptive errors for common issues:

- Missing required parameters
- Invalid configuration
- SimplePay API errors
- Signature validation failures

Always wrap calls in try-catch blocks:

```typescript
try {
  const result = await finishTransaction(data)
  // Handle success
} catch (error) {
  console.error('Transaction finish failed:', error.message)
  // Handle error
}
```

## Logging

Enable detailed logging by setting `SIMPLEPAY_LOGGER=true` in your environment. This will log:

- Request parameters (with sensitive data masked)
- API responses
- Error details

## Testing

The module includes comprehensive examples in `examples.ts` that demonstrate:

- All usage scenarios
- Error handling patterns
- Integration workflows
- Advanced configurations

## Security Notes

- All API communications use HMAC-SHA384 signatures
- Merchant keys are never logged (shown as `***`)
- Request/response signatures are validated
- All sensitive data is properly masked in logs

## Compatibility

- Works with `simplepay-js-sdk` v0.10.1+
- Requires Node.js with crypto support
- Compatible with TypeScript 4.0+
- Follows SimplePay API v2.1 specification