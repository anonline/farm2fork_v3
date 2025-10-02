import type { IOrderTableFilters } from 'src/types/order';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
    onResetPage: () => void;
    filters: UseSetStateReturn<IOrderTableFilters>;
    shipments: { value: string; label: string }[];
    roles: { value: string; label: string }[];
    shippingMethods: { value: string; label: string }[];
    paymentMethods: { value: string; label: string }[];
    paymentStatuses: { value: string; label: string }[];
    statuses: { value: string; label: string }[];
};

export function OrderTableFiltersResult({ filters, totalResults, onResetPage, sx, shipments, roles, shippingMethods, paymentMethods, paymentStatuses, statuses }: Readonly<Props>) {
    const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

    const handleRemoveKeyword = useCallback(() => {
        onResetPage();
        updateFilters({ name: '' });
    }, [onResetPage, updateFilters]);

    const handleRemoveStatus = useCallback(() => {
        onResetPage();
        updateFilters({ status: 'all' });
    }, [onResetPage, updateFilters]);

    const handleRemoveDate = useCallback(() => {
        onResetPage();
        updateFilters({ startDate: null, endDate: null });
    }, [onResetPage, updateFilters]);

    const handleRemoveShipment = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.shipments.filter((item) => item !== inputValue);

            updateFilters({ shipments: newValue });
        },
        [updateFilters, currentFilters.shipments]
    );

    const handleRemoveRole = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.roles.filter((item) => item !== inputValue);

            updateFilters({ roles: newValue });
        },
        [updateFilters, currentFilters.roles]
    );

    const handleRemoveShippingMethod = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.shippingMethods.filter((item) => item !== inputValue);

            updateFilters({ shippingMethods: newValue });
        },
        [updateFilters, currentFilters.shippingMethods]
    );

    const handleRemovePaymentMethod = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.paymentMethods.filter((item) => item !== inputValue);

            updateFilters({ paymentMethods: newValue });
        },
        [updateFilters, currentFilters.paymentMethods]
    );

    const handleRemovePaymentStatus = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.paymentStatuses.filter((item) => item !== inputValue);

            updateFilters({ paymentStatuses: newValue });
        },
        [updateFilters, currentFilters.paymentStatuses]
    );

    const handleReset = useCallback(() => {
        onResetPage();
        resetFilters();
    }, [onResetPage, resetFilters]);

    return (
        <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
            <FiltersBlock label="Státusz:" isShow={currentFilters.status !== 'all'}>
                <Chip
                    {...chipProps}
                    label={statuses.find(status => status.value === currentFilters.status)?.label || currentFilters.status}
                    onDelete={handleRemoveStatus}
                    sx={{ textTransform: 'capitalize' }}
                />
            </FiltersBlock>

            <FiltersBlock
                label="Dátum:"
                isShow={Boolean(currentFilters.startDate && currentFilters.endDate)}
            >
                <Chip
                    {...chipProps}
                    label={fDateRangeShortLabel(currentFilters.startDate, currentFilters.endDate)}
                    onDelete={handleRemoveDate}
                />
            </FiltersBlock>

            <FiltersBlock
                label="Összesítő:"
                isShow={!!currentFilters.shipments.length}
            >
                {currentFilters.shipments.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={shipments.find((shipment) => shipment.value === item)?.label || item}
                        onDelete={() => handleRemoveShipment(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock
                label="Szerepkör:"
                isShow={!!currentFilters.roles.length}
            >
                {currentFilters.roles.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={roles.find((role) => role.value === item)?.label || item}
                        onDelete={() => handleRemoveRole(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock label="Szállítási mód:" isShow={!!currentFilters.shippingMethods.length}>
                {currentFilters.shippingMethods.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={shippingMethods.find((method) => method.value === item)?.label || item}
                        onDelete={() => handleRemoveShippingMethod(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock label="Fizetési mód:" isShow={!!currentFilters.paymentMethods.length}>
                {currentFilters.paymentMethods.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={paymentMethods.find((method) => method.value === item)?.label || item}
                        onDelete={() => handleRemovePaymentMethod(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock label="Fizetés állapota:" isShow={!!currentFilters.paymentStatuses.length}>
                {currentFilters.paymentStatuses.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={paymentStatuses.find((status) => status.value === item)?.label || item}
                        onDelete={() => handleRemovePaymentStatus(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock label="Szűrő:" isShow={!!currentFilters.name}>
                <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
            </FiltersBlock>
        </FiltersResult>
    );
}
