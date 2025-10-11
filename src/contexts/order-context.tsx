'use client';

import type { ReactNode } from 'react';
import type { IOrderItem } from 'src/types/order';
import type { IOrderData } from 'src/types/order-management';

import { useMemo, useContext, useReducer, useCallback, createContext } from 'react';

import { transformOrderDataToTableItem } from 'src/utils/transform-order-data';

import { getOrderById } from 'src/actions/order-management';
import { getCustomerData } from 'src/actions/customer';

// ----------------------------------------------------------------------

type OrderState = {
  order: IOrderItem | null;
  orderData: IOrderData | null;
  loading: boolean;
  error: string | null;
};

type OrderAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { order: IOrderItem; orderData: IOrderData } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_ORDER'; payload: Partial<IOrderItem> }
  | { type: 'UPDATE_ORDER_DATA'; payload: Partial<IOrderData> }
  | { type: 'RESET' };

type OrderContextType = {
  state: OrderState;
  fetchOrder: (orderId: string) => Promise<void>;
  updateOrder: (updates: Partial<IOrderItem>) => void;
  updateOrderData: (updates: Partial<IOrderData>) => void;
  refreshOrderHistory: () => Promise<void>;
  reset: () => void;
};

// ----------------------------------------------------------------------

const initialState: OrderState = {
  order: null,
  orderData: null,
  loading: false,
  error: null,
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        order: action.payload.order,
        orderData: action.payload.orderData,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'UPDATE_ORDER':
      return {
        ...state,
        order: state.order ? { ...state.order, ...action.payload } : null,
      };

    case 'UPDATE_ORDER_DATA':
      return {
        ...state,
        orderData: state.orderData ? { ...state.orderData, ...action.payload } : null,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

// ----------------------------------------------------------------------

const OrderContext = createContext<OrderContextType | undefined>(undefined);

type OrderProviderProps = {
  children: ReactNode;
};

export function OrderProvider({ children }: Readonly<OrderProviderProps>) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const fetchOrder = useCallback(async (orderId: string) => {
    dispatch({ type: 'FETCH_START' });

    try {
      const result = await getOrderById(orderId);

      if (result.error) {
        dispatch({ type: 'FETCH_ERROR', payload: result.error });
        return;
      }

      if (result.order) {

        if (result.order.customerId) {
          const customerData = await getCustomerData(result.order.customerId);

          // Transform IOrderData to IOrderItem using the utility function
          const transformedOrder = await transformOrderDataToTableItem(result.order);

          if (customerData) {
            transformedOrder.customer = {
              ...transformedOrder.customer,
              discountPercent: customerData.discountPercent || 0,
            };
          }

          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              order: transformedOrder,
              orderData: result.order,
            },
          });
        } else {
          dispatch({ type: 'FETCH_ERROR', payload: 'Nincs ügyfél adat a rendeléshez' });
        }
      } else {
        dispatch({ type: 'FETCH_ERROR', payload: 'Rendelés nem található' });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      dispatch({
        type: 'FETCH_ERROR',
        payload: error instanceof Error ? error.message : 'Hiba történt a rendelés betöltése során',
      });
    }
  }, []);

  const updateOrder = useCallback((updates: Partial<IOrderItem>) => {
    dispatch({ type: 'UPDATE_ORDER', payload: updates });
  }, []);

  const updateOrderData = useCallback((updates: Partial<IOrderData>) => {
    dispatch({ type: 'UPDATE_ORDER_DATA', payload: updates });
  }, []);

  const refreshOrderHistory = useCallback(async () => {
    if (!state.orderData?.id) return;

    try {
      const result = await getOrderById(state.orderData.id);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.order) {
        // Transform IOrderData to IOrderItem using the utility function
        const transformedOrder = await transformOrderDataToTableItem(result.order);

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            order: transformedOrder,
            orderData: result.order,
          },
        });
      }
    } catch (error) {
      console.error('Error refreshing order history:', error);
      throw error;
    }
  }, [state.orderData?.id]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      fetchOrder,
      updateOrder,
      updateOrderData,
      refreshOrderHistory,
      reset,
    }),
    [state, fetchOrder, updateOrder, updateOrderData, refreshOrderHistory, reset]
  );

  return <OrderContext.Provider value={contextValue}>{children}</OrderContext.Provider>;
}

// ----------------------------------------------------------------------

export function useOrderContext() {
  const context = useContext(OrderContext);

  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }

  return context;
}