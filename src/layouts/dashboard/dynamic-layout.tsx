'use client';

import type { DashboardLayoutProps } from './layout';

import { useDashboardNavData } from '../../hooks';

import { DashboardLayout as OriginalDashboardLayout } from './layout';

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
