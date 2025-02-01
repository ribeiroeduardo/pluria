/*
  # Add z-index to options table

  1. Changes
    - Add z_index column to options table with default value of 0
    - Update existing options with appropriate z-index values based on subcategory
*/

-- Add z_index column
ALTER TABLE options ADD COLUMN z_index integer NOT NULL DEFAULT 0;

-- Update z-index values for existing options based on subcategories
DO $$ 
BEGIN
  -- Body (base layer)
  UPDATE options SET z_index = 1 
  WHERE id_related_subcategory IN (
    SELECT id FROM subcategories WHERE subcategory ILIKE '%body%'
  );

  -- Neck
  UPDATE options SET z_index = 2
  WHERE id_related_subcategory IN (
    SELECT id FROM subcategories WHERE subcategory ILIKE '%neck%'
  );

  -- Hardware
  UPDATE options SET z_index = 3
  WHERE id_related_subcategory IN (
    SELECT id FROM subcategories WHERE subcategory ILIKE '%hardware%'
  );

  -- Top (uppermost layer)
  UPDATE options SET z_index = 4
  WHERE id_related_subcategory IN (
    SELECT id FROM subcategories WHERE subcategory ILIKE '%top%'
  );
END $$;