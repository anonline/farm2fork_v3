import type { KeyboardEvent} from 'react';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface EmailNotificationSelectorProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  userEmail?: string; // Add optional user email prop
}

export function EmailNotificationSelector({
  emails,
  onEmailsChange,
  userEmail,
}: EmailNotificationSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Add user email on component mount if emails array is empty
  useEffect(() => {
    if (!hasInitialized.current && emails.length === 0 && userEmail && isValidEmail(userEmail)) {
      onEmailsChange([userEmail]);
      hasInitialized.current = true;
    }
  }, [userEmail, emails.length, onEmailsChange]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValidEmail = (email: string): boolean => emailRegex.test(email.trim());

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && isValidEmail(trimmedEmail) && !emails.includes(trimmedEmail)) {
      onEmailsChange([...emails, trimmedEmail]);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    onEmailsChange(emails.filter(email => email !== emailToRemove));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (inputValue.trim()) {
        addEmail(inputValue);
        setInputValue('');
      }
    } else if (event.key === 'Backspace' && !inputValue && emails.length > 0) {
      // Remove last email if backspace is pressed on empty input
      removeEmail(emails[emails.length - 1]);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addEmail(inputValue);
      setInputValue('');
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Értesítési e-mail
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ha több e-mailre is szeretnél értesítést küldeni a rendeléseid állapotáról, add meg őket itt.
      </Typography>
      
      <Box
        onClick={handleContainerClick}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          minHeight: 56,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          cursor: 'text',
          '&:hover': {
            borderColor: 'text.primary',
          },
          '&:focus-within': {
            borderColor: 'primary.main',
            borderWidth: 2,
          },
        }}
      >
        {emails.map((email, index) => (
          <Chip
            key={`${email}-${index}`}
            label={email}
            onDelete={() => removeEmail(email)}
            size="medium"
            variant="filled"
            sx={{ fontSize: '16px', lineHeight: '24px', fontWeight:'500', bgcolor: 'grey.600' }}
          />
        ))}
        
        <TextField
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={emails.length === 0 ? "Add meg az e-mail címeket..." : ""}
          variant="standard"
          size="small"
          sx={{
            flex: 1,
            minWidth: 120,
            '& .MuiInput-underline:before': {
              display: 'none',
            },
            '& .MuiInput-underline:after': {
              display: 'none',
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              display: 'none',
            },
            '& .MuiInputBase-input': {
              p: 0.5,
            },
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </Box>
      
      {/* Warning when no emails are present */}
      {emails.length === 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Figyelem!</strong> Legalább egy e-mail címet meg kell adnod az értesítések fogadásához.
          </Typography>
        </Alert>
      )}
      
      {inputValue && !isValidEmail(inputValue) && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          Kérjük, add meg egy érvényes e-mail címet
        </Typography>
      )}
    </Box>
  );
}
