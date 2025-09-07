import { useState, useEffect } from 'react';

import { getPendingOrdersCount } from 'src/actions/order-management';

// ----------------------------------------------------------------------

export function usePendingOrdersCount() {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPendingOrdersCount = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getPendingOrdersCount();
            
            if (result.error) {
                setError(result.error);
                setCount(0);
            } else {
                setCount(result.count);
            }
        } catch (err) {
            setError('Failed to fetch pending orders count');
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrdersCount();
    }, []);

    return {
        count,
        loading,
        error,
        refetch: fetchPendingOrdersCount,
    };
}
