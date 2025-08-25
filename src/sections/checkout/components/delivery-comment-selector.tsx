import { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface DeliveryCommentSelectorProps {
  comment: string;
  onCommentChange: (comment: string) => void;
}

export function DeliveryCommentSelector({
  comment,
  onCommentChange,
}: DeliveryCommentSelectorProps) {
  const [inputValue, setInputValue] = useState(comment);

  // Sanitize input to prevent XSS and HTML injection
  const sanitizeInput = (input: string): string => {
    // Remove HTML tags and potentially dangerous characters
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
      .trim();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = event.target.value;
    
    // Limit to 500 characters
    if (rawValue.length > 500) {
      return;
    }
    
    const sanitizedValue = sanitizeInput(rawValue);
    setInputValue(sanitizedValue);
  };

  const handleInputBlur = () => {
    const sanitizedComment = sanitizeInput(inputValue);
    if (sanitizedComment !== comment) {
      onCommentChange(sanitizedComment);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Allow Enter and new lines (don't prevent default)
    // This is the default behavior for textarea, so we don't need to do anything special
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Megjegyzés
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ha van egyéb kiegészítésed a szállításhoz, kérjük írd meg nekünk.
      </Typography>
      
      <TextField
        multiline
        rows={5}
        fullWidth
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="pl.: Hol hagyjuk a szállítmányt?"
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'text.primary',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
          '& .MuiInputBase-inputMultiline': {
            resize: 'vertical',
            //minHeight: '120px',
          },
        }}
        InputProps={{
          sx: {
            '& textarea': {
              resize: 'vertical !important',
            },
          },
        }}
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {inputValue.length}/500 karakter
      </Typography>
    </Box>
  );
}
