/**
 * SimplePay Finish Transaction - Usage Examples
 */

import { 
  cancelTransaction,
  finishTransaction, 
  fullyChargeTransaction, 
  partiallyChargeTransaction
} from './index'

/**
 * Example usage scenarios for SimplePay finish transactions
 */

// Example 1: Fully charge a transaction
export async function exampleFullCharge() {
  try {
    const result = await fullyChargeTransaction(
      'ORDER-123456789',
      2500 // originalTotal in HUF
    )
    console.log('Full charge successful:', result)
    return result
  } catch (error) {
    console.error('Full charge failed:', error)
    throw error
  }
}

// Example 2: Partially charge a transaction
export async function examplePartialCharge() {
  try {
    const result = await partiallyChargeTransaction(
      'ORDER-123456789',
      2500, // originalTotal
      1500  // approveTotal (charge 1500, release 1000)
    )
    console.log('Partial charge successful:', result)
    return result
  } catch (error) {
    console.error('Partial charge failed:', error)
    throw error
  }
}

// Example 3: Cancel/release a transaction
export async function exampleCancelTransaction() {
  try {
    const result = await cancelTransaction(
      'ORDER-123456789',
      2500 // originalTotal (will be fully released)
    )
    console.log('Transaction cancelled successfully:', result)
    return result
  } catch (error) {
    console.error('Transaction cancellation failed:', error)
    throw error
  }
}

// Example 4: Advanced usage with custom configuration
export async function exampleAdvancedFinish() {
  try {
    const result = await finishTransaction({
      orderRef: 'ORDER-123456789',
      originalTotal: 2500,
      approveTotal: 0, // Cancel the transaction
      currency: 'HUF'
    }, {
      merchantAccount: 'CUSTOM_MERCHANT_ID' // Optional override
    })
    console.log('Advanced finish successful:', result)
    return result
  } catch (error) {
    console.error('Advanced finish failed:', error)
    throw error
  }
}

// Example 5: Using transaction ID instead of order reference
export async function exampleFinishByTransactionId() {
  try {
    const result = await finishTransaction({
      transactionId: 'TXN-987654321',
      originalTotal: 1000,
      approveTotal: 800, // Partial charge
      currency: 'HUF'
    })
    console.log('Finish by transaction ID successful:', result)
    return result
  } catch (error) {
    console.error('Finish by transaction ID failed:', error)
    throw error
  }
}

/**
 * Integration example: Complete order processing workflow
 */
export async function completeOrderWorkflow(orderId: string, chargeAmount: number, originalAmount: number) {
  try {
    // Step 1: Determine the final charge amount
    const shouldFullyCharge = chargeAmount === originalAmount
    const shouldCancel = chargeAmount === 0
    
    let result
    
    if (shouldCancel) {
      // Cancel the entire transaction
      result = await cancelTransaction(orderId, originalAmount)
      console.log(`Order ${orderId} cancelled, ${originalAmount} HUF released`)
    } else if (shouldFullyCharge) {
      // Charge the full amount
      result = await fullyChargeTransaction(orderId, originalAmount)
      console.log(`Order ${orderId} fully charged: ${originalAmount} HUF`)
    } else {
      // Partial charge
      result = await partiallyChargeTransaction(orderId, originalAmount, chargeAmount)
      console.log(`Order ${orderId} partially charged: ${chargeAmount} HUF, ${originalAmount - chargeAmount} HUF released`)
    }
    
    return {
      success: true,
      result,
      orderId,
      originalAmount,
      chargedAmount: shouldCancel ? 0 : chargeAmount,
      releasedAmount: shouldCancel ? originalAmount : Math.max(0, originalAmount - chargeAmount)
    }
    
  } catch (error) {
    console.error(`Order workflow failed for ${orderId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      orderId,
      originalAmount,
      chargedAmount: 0,
      releasedAmount: 0
    }
  }
}