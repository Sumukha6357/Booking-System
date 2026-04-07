-- V9: Create loyalty points and gift cards tables
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    lifetime_points INT NOT NULL DEFAULT 0,
    tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    created_at TIMESTAMP NOT NULL,
    last_earned_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    initial_amount DECIMAL(12,2) NOT NULL,
    remaining_amount DECIMAL(12,2) NOT NULL,
    purchased_by_user_id UUID,
    gifted_to_user_id UUID,
    recipient_email VARCHAR(255),
    message VARCHAR(500),
    purchased_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_loyalty_user ON loyalty_points(user_id);
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
