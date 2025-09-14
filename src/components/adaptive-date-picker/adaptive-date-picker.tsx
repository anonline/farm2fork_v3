import type { IDatePickerControl } from 'src/types/common';
import type { Theme } from '@mui/material/styles';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';

import dayjs from 'dayjs';

import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

// ----------------------------------------------------------------------

interface StyledPickersDayProps extends PickersDayProps<dayjs.Dayjs> {
  highlighted?: boolean;
}

const StyledPickersDay = styled(PickersDay)<StyledPickersDayProps>(({ theme, highlighted }) => ({
  ...(highlighted && {
    
    border: '1px solid ' + theme.palette.primary.main,
    
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  }),
}));

// ----------------------------------------------------------------------

export interface AdaptiveDatePickerProps extends Omit<DatePickerProps<dayjs.Dayjs>, 'value' | 'onChange'> {
  value: IDatePickerControl;
  onChange: (newValue: IDatePickerControl) => void;
  highlightedDates?: dayjs.Dayjs[];
  label?: string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AdaptiveDatePicker({
  value,
  onChange,
  highlightedDates = [],
  label = 'Select date',
  breakpoint = 'md',
  slotProps,
  ...other
}: AdaptiveDatePickerProps) {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up(breakpoint));

  // Create a component for custom day rendering
  const CustomDay = (props: PickersDayProps<dayjs.Dayjs>) => {
    const isHighlighted = highlightedDates.some((highlightedDate) =>
      props.day.isSame(highlightedDate, 'day')
    );

    return (
      <StyledPickersDay
        {...props}
        highlighted={isHighlighted}
      />
    );
  };

  const slots = highlightedDates.length > 0 ? { day: CustomDay } : undefined;

  const commonProps = {
    label,
    value,
    onChange,
    slots,
    slotProps: {
      ...slotProps,
      textField: {
        fullWidth: true,
        ...slotProps?.textField,
      },
    },
    ...other,
  };

  if (isDesktop) {
    return <DesktopDatePicker {...commonProps} />;
  }

  return (
    <MobileDatePicker
      {...commonProps}
      orientation="portrait"
    />
  );
}