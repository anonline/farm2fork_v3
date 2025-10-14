-- Migration: Add category order option
-- This stores the custom order of product categories as a JSON array of category IDs

INSERT INTO public."Options" (name, value, type)
VALUES ('category_order', '[]', 'json')
ON CONFLICT (name) DO NOTHING;

-- The value will be a JSON array like: ["3", "1", "5", "2", "4"]
-- representing the order in which categories should appear
