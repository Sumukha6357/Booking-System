-- V7: Add profile photo and verification fields
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
