# Email Templates Implementation

This document provides a comprehensive overview of the email template management system implemented in Farm2Fork v3.

## Overview

The email template system allows administrators to create, edit, and manage email templates that are automatically sent when specific events occur in the application (like order placement, password reset, etc.).

## Architecture

### Core Components

#### 1. Email Template Types (`src/types/emails/`)
- **EmailTrigger**: Enum defining all possible email triggers
- **EmailTemplate**: Interface for email template data structure  
- **EmailBaseTemplate**: Base class for email template construction

#### 2. Server Actions (`src/actions/email.ts`)
- **triggerEmail()**: Main function to send emails based on triggers
- **getAllEmailTemplates()**: Fetch all templates for admin management
- **getEmailTemplate()**: Get specific template by type
- **upsertEmailTemplate()**: Create or update email templates
- **deleteEmailTemplate()**: Remove email templates
- **toggleEmailTemplateStatus()**: Enable/disable templates

#### 3. Email Client (`src/lib/resend.ts`)
- **ResendClient**: Wrapper around Resend API
- **sendEmail()**: Send individual emails
- **sendEmailTemplate()**: Send templated emails with header/footer

#### 4. Admin Interface (`src/sections/email-templates/`)
- **EmailTemplatesListView**: List all templates with enable/disable toggles
- **EmailTemplateCreateView**: Create new templates
- **EmailTemplateEditView**: Edit existing templates
- **EmailTemplateNewEditForm**: Form component for template editing

## Features

### Admin Dashboard Features
1. **Template Management**
   - View all email templates in a data grid
   - Toggle templates on/off with switches
   - Edit subject and body content
   - Preview template formatting

2. **Template Editor**
   - Rich text editor for email body
   - Subject line editing
   - Variable placeholder support ({{name}})
   - Enable/disable toggle per template

3. **Template Types**
   - `ORDER_PLACED`: Sent when customer places order
   - `ORDER_CANCELLED`: Sent when order is cancelled
   - `ORDER_PROCESSED`: Sent when order is being processed
   - `ORDER_CLOSED`: Sent when order is completed
   - `PASSWORD_RESET`: Sent for password reset requests
   - `WELCOME_EMAIL`: Sent to new users

### Email Features
1. **Template Variables**
   - `{{name}}`: Replaced with user's name or email
   - Extensible system for additional variables

2. **HTML Email Support**
   - Rich HTML content in email body
   - Automatic header and footer wrapping
   - Responsive email design

3. **Email Status Tracking**
   - Enable/disable individual templates
   - Skip sending if template is disabled

## Database Schema

### EmailTemplates Table
```sql
CREATE TABLE "EmailTemplates" (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

### Required Variables
```bash
# Resend API configuration
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### Supabase Database Access (Already configured)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Usage Examples

### Triggering Emails from Code
```typescript
import { triggerEmail } from 'src/actions/email';
import { EmailTrigger } from 'src/types/emails/email-trigger';

// Send welcome email to new user
await triggerEmail(EmailTrigger.WELCOME_EMAIL, {
    email: 'user@example.com',
    name: 'John Doe'
});

// Send order confirmation
await triggerEmail(EmailTrigger.ORDER_PLACED, {
    email: 'customer@example.com',
    name: 'Customer Name'
});
```

### Managing Templates in Admin
1. Navigate to `/dashboard/emailtemplates`
2. View all templates with status indicators
3. Toggle templates on/off using switches
4. Click edit icon to modify template content
5. Create new templates using "New Template" button

## API Endpoints

All email template management uses server actions, not REST endpoints:

- **Read**: `getAllEmailTemplates()`, `getEmailTemplate(type)`
- **Create/Update**: `upsertEmailTemplate(templateData)`
- **Delete**: `deleteEmailTemplate(type)`
- **Toggle Status**: `toggleEmailTemplateStatus(type, enabled)`

## Development Notes

### Adding New Email Types
1. Add new trigger to `EmailTrigger` enum
2. Create default template in database migration
3. Implement trigger calls in relevant parts of application

### Customizing Email Templates
- Templates support HTML content
- Use `{{name}}` placeholder for personalization
- Header and footer are automatically added by ResendClient
- Templates can be disabled without removing content

### Error Handling
- Failed email sends are logged to console
- Disabled templates skip sending silently
- Missing templates throw descriptive errors
- Database errors are caught and handled gracefully

## Security Considerations

1. **API Key Protection**: Store Resend API key securely in environment variables
2. **Template Validation**: All template content is validated before saving
3. **Admin Access**: Email template management requires admin dashboard access
4. **Rate Limiting**: Consider implementing rate limiting for email sends

## Testing

### Manual Testing
1. Set up valid Resend API key in `.env.local`
2. Run database migration to create templates table
3. Start development server: `yarn dev`
4. Navigate to `/dashboard/emailtemplates`
5. Test template creation, editing, and status toggling
6. Test email sending by triggering relevant application events

### Validation Checklist
- [ ] Templates can be created and edited
- [ ] Enable/disable toggles work correctly
- [ ] Template variables are replaced properly
- [ ] Emails are sent successfully via Resend
- [ ] Error handling works for invalid configurations
- [ ] Database operations complete without errors

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all imports use correct paths
   - Verify EmailTemplate interface export/import syntax
   - Check that all required environment variables are set

2. **Email Not Sending**
   - Verify RESEND_API_KEY is set correctly
   - Check FROM_EMAIL is a valid domain you own in Resend
   - Ensure template is enabled in admin interface
   - Check browser console and server logs for errors

3. **Database Errors**
   - Run database migration to create EmailTemplates table
   - Verify Supabase connection and permissions
   - Check that table name matches exactly ("EmailTemplates")

4. **Admin Interface Issues**
   - Clear browser cache and reload page
   - Check browser console for JavaScript errors
   - Verify user has admin dashboard access permissions

## Future Enhancements

1. **Email Analytics**: Track open rates, click-through rates
2. **Advanced Templates**: Support for more variables, conditionals
3. **Template Preview**: Live preview of emails before saving
4. **Bulk Operations**: Mass enable/disable templates
5. **Template Versioning**: Keep history of template changes
6. **A/B Testing**: Support for testing different template versions