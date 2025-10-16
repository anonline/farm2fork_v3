import type { BoxProps } from '@mui/material/Box';
import type { InputBaseProps } from '@mui/material/InputBase';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';

import { varAlpha } from 'minimal-shared/utils';
import { useId, useState, useCallback } from 'react';

import Box from '@mui/material/Box';

import { Iconify } from '../iconify';
import {
    HelperText,
    CaptionText,
    CenteredInput,
    CounterButton,
    InputContainer,
    NumberInputRoot,
} from './styles';

// ----------------------------------------------------------------------

type NumberInputSlotProps = {
    wrapper?: BoxProps;
    input?: InputBaseProps;
    button?: ButtonBaseProps;
    inputWrapper?: React.ComponentProps<typeof InputContainer>;
    captionText?: React.ComponentProps<typeof CaptionText>;
    helperText?: FormHelperTextProps;
};

type EventHandler =
    | React.MouseEvent<HTMLButtonElement, MouseEvent>
    | React.ChangeEvent<HTMLInputElement>;

export type NumberInputProps = Omit<React.ComponentProps<typeof NumberInputRoot>, 'onChange'> & {
    min?: number;
    max?: number;
    step?: number;
    error?: boolean;
    disabled?: boolean;
    value?: number | null;
    hideDivider?: boolean;
    hideButtons?: boolean;
    digits?: number;
    disableInput?: boolean;
    helperText?: React.ReactNode;
    captionText?: React.ReactNode;
    slotProps?: NumberInputSlotProps;
    onChange?: (event: EventHandler, value: number) => void;
};

export function NumberInput({
    sx,
    error,
    value,
    onChange,
    disabled,
    slotProps,
    helperText,
    captionText,
    hideDivider,
    hideButtons,
    disableInput,
    min = 0,
    max = 9999,
    step = 1,
    digits = 2,
    ...other
}: NumberInputProps) {
    const id = useId();

    const currentValue = value ?? 0;
    const [inputValue, setInputValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    const isDecrementDisabled = currentValue <= min || disabled;
    const isIncrementDisabled = currentValue >= max || disabled;

    const stepDigits = step % 1 == 0 ? 0 : step % 0.1 == 0 ? 1 : 1;

    const round = (num: number, decimals = 2) =>
        Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);

    const handleDecrement = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            if (!isDecrementDisabled) {
                const newValue = round(Number(currentValue) - Number(step), stepDigits);
                onChange?.(event, newValue);
                // Update input value if focused
                if (isFocused) {
                    setInputValue(newValue.toString());
                }
            }
        },
        [isDecrementDisabled, onChange, currentValue, step, stepDigits, isFocused]
    );

    const handleIncrement = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            if (!isIncrementDisabled) {
                const newValue = round(Number(currentValue) + Number(step), stepDigits);
                onChange?.(event, newValue);
                // Update input value if focused
                if (isFocused) {
                    setInputValue(newValue.toString());
                }
            }
        },
        [isIncrementDisabled, onChange, currentValue, step, stepDigits, isFocused]
    );

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const eventInputValue = event.target.value;
            
            // Store the raw input value for display
            setInputValue(eventInputValue);

            // Allow empty string during typing
            if (eventInputValue === '' || eventInputValue === '.' || eventInputValue === ',') {
                onChange?.(event, 0);
                return;
            }

            const transformedValue = transformNumberOnChange(eventInputValue, { min, max });
            onChange?.(event, transformedValue);
        },
        [max, min, onChange]
    );

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        // Set input value to current value for editing
        setInputValue(currentValue.toString());
    }, [currentValue]);

    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setInputValue('');
            
            // When user leaves the input, ensure it's at least min value
            if (currentValue < min) {
                const syntheticEvent = event as any;
                onChange?.(syntheticEvent, min);
            }
        },
        [currentValue, min, onChange]
    );

    // Display value: use raw input during focus, formatted value when not focused
    const displayValue = isFocused 
        ? inputValue 
        : currentValue.toFixed(currentValue % 1 == 0 ? 0 : stepDigits);

    return (
        <Box {...slotProps?.wrapper}>
            <NumberInputRoot
                sx={[
                    (theme) => ({
                        '--border-color': varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
                        '--vertical-divider-color': hideDivider
                            ? 'transparent'
                            : varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
                        '--input-background':
                            !disabled && error
                                ? varAlpha(theme.vars.palette.error.mainChannel, 0.08)
                                : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    }),
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
                {...other}
            >
                {!hideButtons && (
                    <CounterButton
                        disabled={isDecrementDisabled}
                        onClick={handleDecrement}
                        {...slotProps?.button}
                        style={{ touchAction: 'manipulation' }} //prevent zoom on mobile double tap
                    >
                        <Iconify width={16} icon="mingcute:minimize-line" />
                    </CounterButton>
                )}

                <InputContainer {...slotProps?.inputWrapper} style={{ touchAction: 'manipulation' }}>
                    <CenteredInput
                        name={id}
                        disabled={disabled || disableInput}
                        value={displayValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...slotProps?.input}
                        style={{ touchAction: 'manipulation' }} //prevent zoom on mobile double tap
                        inputProps={{
                            inputMode: 'decimal',
                            pattern: '[0-9]*\\.?[0-9]*',
                        }}
                    />

                    {captionText && (
                        <CaptionText {...slotProps?.captionText}>{captionText}</CaptionText>
                    )}
                </InputContainer>

                {!hideButtons && (
                    <CounterButton
                        disabled={isIncrementDisabled}
                        onClick={handleIncrement}
                        {...slotProps?.button}
                        style={{ touchAction: 'manipulation' }} //prevent zoom on mobile double tap
                    >
                        <Iconify width={16} icon="mingcute:add-line" />
                    </CounterButton>
                )}
            </NumberInputRoot>

            {helperText && (
                <HelperText error={error} {...slotProps?.helperText}>
                    {helperText}
                </HelperText>
            )}
        </Box>
    );
}

// ----------------------------------------------------------------------

export function transformNumberOnChange(
    value: string,
    options?: { min?: number; max?: number }
): number {
    const { min = 0, max = 9999 } = options ?? {};

    if (!value || value.trim() === '') {
        return 0;
    }
    value = value.replace(',', '.'); // Replace comma with dot for decimal
    const numericValue = Number(value.trim());

    if (!Number.isNaN(numericValue)) {
        // Clamp the value between min and max
        return Math.min(Math.max(numericValue, min), max);
    }

    return 0;
}
