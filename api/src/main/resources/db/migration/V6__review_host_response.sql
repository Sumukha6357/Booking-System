-- V6: Add host response to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS host_response VARCHAR(2000);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS host_response_at TIMESTAMP;
