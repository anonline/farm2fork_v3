/**
 * SimplePay Utilities
 * 
 * This module provides additional utilities for SimplePay integration
 * that extend the functionality of the simplepay-js-sdk package.
 */

// Re-export all types and functions from the main SDK
export * from 'simplepay-js-sdk'

// Export our custom finish transaction utilities
export {
  finishTransaction,
  type FinishTransactionData,
  type FinishTransactionConfig,
  type SimplePayFinishResponse,
  type SimplePayFinishRequestBody,
} from './finish'