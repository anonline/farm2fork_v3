-- Create EmailTemplates table for managing email templates
CREATE TABLE IF NOT EXISTS "EmailTemplates" (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on type for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON "EmailTemplates"(type);

-- Add index on enabled status for filtering
CREATE INDEX IF NOT EXISTS idx_email_templates_enabled ON "EmailTemplates"(enabled);

-- Insert default email templates for common triggers
INSERT INTO "EmailTemplates" (type, subject, body, enabled) VALUES
('ORDER_PLACED', 'Order Confirmation - Farm2Fork', 
 '<p>Hello {{name}},</p><p>Thank you for your order! We have received your order and will process it shortly.</p><p>Best regards,<br>Farm2Fork Team</p>', 
 true),
('ORDER_CANCELLED', 'Order Cancelled - Farm2Fork', 
 '<p>Hello {{name}},</p><p>Your order has been cancelled as requested.</p><p>If you have any questions, please contact our support team.</p><p>Best regards,<br>Farm2Fork Team</p>', 
 true),
('ORDER_PROCESSED', 'Your Order is Being Processed - Farm2Fork', 
 '<p>Hello {{name}},</p><p>Good news! Your order is now being processed and will be shipped soon.</p><p>Best regards,<br>Farm2Fork Team</p>', 
 true),
('ORDER_CLOSED', 'Order Completed - Farm2Fork', 
 '<p>Hello {{name}},</p><p>Your order has been completed successfully. We hope you enjoyed your experience with us!</p><p>Best regards,<br>Farm2Fork Team</p>', 
 true),
('PASSWORD_RESET', 'Password Reset - Farm2Fork', 
 '<p>Hello {{name}},</p><p>We received a request to reset your password. Please follow the instructions in this email to reset your password.</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>Farm2Fork Team</p>', 
 true),
('WELCOME_EMAIL', 'Welcome to Farm2Fork!', 
 '<p>Hello {{name}},</p><p>Welcome to Farm2Fork! We are excited to have you join our community of farmers and food lovers.</p><p>Start exploring our fresh, local products today!</p><p>Best regards,<br>Farm2Fork Team</p>', 
 true)
ON CONFLICT (type) DO NOTHING;