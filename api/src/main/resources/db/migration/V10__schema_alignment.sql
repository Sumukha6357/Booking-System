-- V10: Align schema with current JPA entities

-- app_users alignment
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS phone VARCHAR(255);

-- listings alignment
ALTER TABLE listings ADD COLUMN IF NOT EXISTS max_guests INTEGER NOT NULL DEFAULT 2;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS amenities VARCHAR(1000);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_urls VARCHAR(2000);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS check_in_instructions VARCHAR(2000);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS house_rules VARCHAR(1000);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS pricing_notes VARCHAR(500);

-- bookings alignment
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_notes VARCHAR(1000);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests VARCHAR(500);

-- missing domain tables
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(255) NOT NULL UNIQUE,
    discount_type VARCHAR(255) NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,
    min_booking_value NUMERIC(10,2),
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    sender_id UUID NOT NULL REFERENCES app_users(id),
    receiver_id UUID NOT NULL REFERENCES app_users(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    content VARCHAR(2000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES app_users(id),
    query VARCHAR(2000) NOT NULL,
    max_price DOUBLE PRECISION,
    min_guests INTEGER,
    location VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_notified_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES app_users(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES app_users(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
