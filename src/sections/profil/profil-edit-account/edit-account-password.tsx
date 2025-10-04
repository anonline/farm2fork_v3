import { useState } from 'react';

import { IconButton, InputLabel, FormControl, OutlinedInput, InputAdornment } from '@mui/material';

import F2FIcons from 'src/components/f2ficons/f2ficons';

export default function EditAccountPassword({
    label,
    value,
    onChange,
    disabled = false,
}: Readonly<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}>) {
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const fieldId = `password-field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const passwordInputStyle = {
        '& .MuiOutlinedInput-input': {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '28px',
        },
    };

    return (
        <FormControl sx={{ width: '100%', ...passwordInputStyle }} variant="outlined">
            <InputLabel htmlFor={fieldId}>{label}</InputLabel>
            <OutlinedInput
                id={fieldId}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                disabled={disabled}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="jelszó láthatóságának váltása"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            disabled={disabled}
                        >
                            {showPassword ? (
                                <F2FIcons name="Hide" width={14} height={14} />
                            ) : (
                                <F2FIcons name="Show" width={14} height={14} />
                            )}
                        </IconButton>
                    </InputAdornment>
                }
                label={label}
            />
        </FormControl>
    );
}
