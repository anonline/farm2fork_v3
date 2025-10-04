-- Migration: Add boxId column to ProductsInBoxes table
-- This allows a product (box) to contain multiple other products

-- Add boxId column to track which bundle/box this item belongs to
ALTER TABLE public."ProductsInBoxes"
ADD COLUMN IF NOT EXISTS "boxId" bigint;

-- Add foreign key constraint to reference the parent product
ALTER TABLE public."ProductsInBoxes"
ADD CONSTRAINT "ProductsInBoxes_boxId_fkey" 
FOREIGN KEY ("boxId") 
REFERENCES "Products" (id) 
ON UPDATE CASCADE 
ON DELETE CASCADE;

-- Drop the old primary key on productId only
ALTER TABLE public."ProductsInBoxes"
DROP CONSTRAINT IF EXISTS "ProductsInBoxes_pkey";

-- Create a composite primary key on boxId and productId
-- This ensures a product can only appear once per bundle
ALTER TABLE public."ProductsInBoxes"
ADD CONSTRAINT "ProductsInBoxes_pkey" 
PRIMARY KEY ("boxId", "productId");

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS "ProductsInBoxes_boxId_idx" 
ON public."ProductsInBoxes" ("boxId");

-- Add comment to explain the table purpose
COMMENT ON TABLE public."ProductsInBoxes" IS 
'Junction table for bundled products. Links a bundle product (boxId) to its contained products (productId) with quantities.';
