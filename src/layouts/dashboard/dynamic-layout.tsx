'use client';

import { useDashboardNavData } from '../../hooks';
import { DashboardLayout as OriginalDashboardLayout } from './layout';

import type { DashboardLayoutProps } from './layout';

// ----------------------------------------------------------------------

export function DashboardLayoutWithDynamicNav({
    slotProps,
    ...other
}: DashboardLayoutProps) {
    const dynamicNavData = useDashboardNavData();

    const mergedSlotProps = {
        ...slotProps,
        nav: {
            ...slotProps?.nav,
            data: dynamicNavData,
        },
    };

    return <OriginalDashboardLayout slotProps={mergedSlotProps} {...other} />;
}
