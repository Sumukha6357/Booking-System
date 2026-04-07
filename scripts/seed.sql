-- Seeding Titanium Users for Booking-System
-- Context: Personal | Password: password

INSERT INTO app_users (id, tenant_id, email, password_hash, role, created_at)
VALUES 
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'platform_admin@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Q1CDe7v4xYueAA6QbV0I1f3wWg5G', 'PLATFORM_ADMIN', NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Q1CDe7v4xYueAA6QbV0I1f3wWg5G', 'PLATFORM_ADMIN', NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'vendor@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Q1CDe7v4xYueAA6QbV0I1f3wWg5G', 'VENDOR', NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'customer@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Q1CDe7v4xYueAA6QbV0I1f3wWg5G', 'CUSTOMER', NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'user@gmail.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Q1CDe7v4xYueAA6QbV0I1f3wWg5G', 'USER', NOW())
ON CONFLICT (email) DO NOTHING;
