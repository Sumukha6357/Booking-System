-- V6: Ensure reviews table exists and add host response fields
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    user_id UUID NOT NULL REFERENCES app_users(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    rating INTEGER NOT NULL,
    comment VARCHAR(2000),
    guest_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS host_response VARCHAR(2000);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS host_response_at TIMESTAMP WITH TIME ZONE;
