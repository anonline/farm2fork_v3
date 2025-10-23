# Contact Modal Component

A reusable modal/dialog component for contact forms across the Farm2Fork application with integrated Google reCAPTCHA Enterprise protection.

## Features

- **Required Fields**: Name, Email address, Message
- **Data Protection Checkbox**: Users must accept the data protection policy
- **Zod Validation**: Schema-based validation with consistent error messages across all browsers
- **reCAPTCHA Enterprise**: Bot protection with invisible CAPTCHA
- **Email Integration**: Sends contact form submissions to admins
- **Loading State**: Button shows loading indicator during submission
- **Error Handling**: Clear error messages for validation and submission failures
- **Responsive Design**: Works on all screen sizes

## Usage

```tsx
import { ContactModal } from 'src/components/contact-modal';

function MyComponent() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                Contact Us
            </Button>

            <ContactModal
                open={open}
                onClose={() => setOpen(false)}
                onSuccess={() => {
                    console.log('Form submitted successfully');
                    // Show success message, etc.
                }}
            />
        </>
    );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Called when modal should close |
| `onSuccess` | `() => void` | No | Called after successful form submission |

## Validation

The component uses **Zod** for validation, which provides:
- **Browser-independent validation**: Consistent error messages across all browsers
- **Type safety**: TypeScript types are automatically inferred from the schema
- **Clear error messages**: All messages are in Hungarian

### Validation Rules

- **Name**: 
  - Required
  - Minimum 2 characters
- **Email**: 
  - Required
  - Must be valid email format
- **Message**: 
  - Required
  - Minimum 10 characters
- **Data Protection**: 
  - Must be checked before submission

The validation schema is defined in `schema.ts` and can be easily extended or modified.

## Security - CAPTCHA Integration

The component uses **Google reCAPTCHA Enterprise** to prevent bot submissions:

1. **Client-side**: Uses the `useCaptcha` hook to execute reCAPTCHA invisibly
2. **Server-side**: Verifies the CAPTCHA token using `verifyCaptcha` action
3. **Action**: `contact_form` - identifies this specific form submission

### Required Environment Variables

```env
# Google reCAPTCHA Enterprise
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
GOOGLE_PROJECT_KEY=your_google_project_key
GOOGLE_API_KEY=your_google_api_key
```

### How it Works

1. When the form is submitted, the CAPTCHA is executed invisibly
2. A token is generated and sent to the server
3. Server verifies the token with Google reCAPTCHA Enterprise API
4. If verification fails, an error message is shown
5. If successful, the email is sent

## Email Sending

Email functionality is integrated using the `sendContactFormEmail` server action:

- Sends to admin email addresses (configured in the function)
- Includes all form data: name, email, message
- Includes CAPTCHA token for verification
- Returns success/error status

### Email Template

The email will be implemented in `src/actions/email-ssr.ts` with:
- Subject: "Új kapcsolatfelvételi üzenet: [Name]"
- Body: Formatted HTML with name, email, and message

## Error Handling

The component handles various error scenarios:

- **Validation errors**: Displayed under each field
- **CAPTCHA errors**: General error message displayed at top
- **Email sending errors**: General error message displayed at top
- **Network errors**: Caught and displayed as general errors

All error messages are in **Hungarian**.

## Files

- `contact-modal.tsx` - Main component file with CAPTCHA integration
- `schema.ts` - Zod validation schema
- `index.ts` - Export file
- `README.md` - Documentation

## Dependencies

- `@mui/material` - UI components
- `zod` - Validation schema
- `src/components/captcha/use-captcha` - CAPTCHA hook
- `src/actions/captcha` - Server-side CAPTCHA verification
- `src/actions/email-ssr` - Email sending functionality

## Styling

The component uses Material-UI components and follows the Farm2Fork theme configuration:
- Title uses Bricolage font family
- Responsive layout with proper spacing
- Error states with red error messages and Alert component
- Loading state disables all inputs and shows spinner
- CAPTCHA executes invisibly (no visible widget)

## Development Notes

- The reCAPTCHA script is loaded only once and reused
- Form resets automatically after successful submission
- Loading state prevents multiple submissions
- All async operations have proper error handling
