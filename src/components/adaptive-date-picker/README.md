# Adaptive Date Picker

A responsive date picker component that automatically switches between desktop and mobile modes based on screen size and supports highlighting specific dates.

## Features

- **Adaptive Design**: Automatically switches between `DesktopDatePicker` and `MobileDatePicker` based on screen breakpoints
- **Date Highlighting**: Accepts an array of dates to highlight in the calendar popup
- **Customizable Breakpoint**: Configure which screen size triggers mobile vs desktop mode
- **Full Material-UI Integration**: Built on top of Material-UI's date picker components with consistent styling

## Usage

### Basic Usage

```tsx
import { useState } from 'react';
import dayjs from 'dayjs';
import { AdaptiveDatePicker } from 'src/components/adaptive-date-picker';

function MyComponent() {
  const [date, setDate] = useState(dayjs());

  return (
    <AdaptiveDatePicker
      label="Select a date"
      value={date}
      onChange={(newValue) => setDate(newValue)}
    />
  );
}
```

### With Highlighted Dates

```tsx
import { useState } from 'react';
import dayjs from 'dayjs';
import { AdaptiveDatePicker } from 'src/components/adaptive-date-picker';

function MyComponent() {
  const [date, setDate] = useState(dayjs());
  
  // Highlight specific dates
  const specialDates = [
    dayjs('2024-01-01'), // New Year
    dayjs('2024-12-25'), // Christmas
    dayjs().add(7, 'day'), // One week from today
  ];

  return (
    <AdaptiveDatePicker
      label="Select a date"
      value={date}
      onChange={(newValue) => setDate(newValue)}
      highlightedDates={specialDates}
    />
  );
}
```

### Custom Breakpoint

```tsx
<AdaptiveDatePicker
  label="Select a date"
  value={date}
  onChange={(newValue) => setDate(newValue)}
  breakpoint="lg" // Mobile mode up to 'lg' breakpoint
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `IDatePickerControl` | - | The selected date value |
| `onChange` | `(newValue: IDatePickerControl) => void` | - | Callback fired when the value changes |
| `highlightedDates` | `dayjs.Dayjs[]` | `[]` | Array of dates to highlight in the calendar |
| `label` | `string` | `"Select date"` | Label for the date picker input |
| `breakpoint` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Screen size at which to switch from mobile to desktop mode |

All other props from Material-UI's `DatePickerProps` are also supported.

## Responsive Behavior

- **Mobile Mode**: Uses `MobileDatePicker` with portrait orientation
- **Desktop Mode**: Uses `DesktopDatePicker` 
- **Breakpoint**: By default, switches at the `md` breakpoint (768px), but this can be customized

## Styling

The highlighted dates use the theme's primary color by default. The highlighting can be further customized by overriding the styled component:

```tsx
const CustomStyledPickersDay = styled(PickersDay)(({ theme, highlighted }) => ({
  ...(highlighted && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    // Add your custom styles here
  }),
}));
```

## Dependencies

- `@mui/material`
- `@mui/x-date-pickers`
- `dayjs`
- `src/types/common` (for `IDatePickerControl` type)

## Example Use Cases

1. **Event Booking**: Highlight available dates for booking
2. **Delivery Scheduling**: Show available delivery dates
3. **Holiday Calendar**: Highlight holidays and special dates
4. **Data Visualization**: Mark dates with special significance
5. **Content Publishing**: Highlight scheduled publication dates