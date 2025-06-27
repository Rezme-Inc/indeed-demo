-- Add RLS policy to allow Rezme admins to view all WOTC surveys
-- This fixes the issue where WOTC data wasn't showing in the Rezme admin dashboard

CREATE POLICY "Rezme Admins can view all WOTC surveys"
    ON wotc_surveys FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rezme_admin_profiles
            WHERE id = auth.uid()
        )
    ); 