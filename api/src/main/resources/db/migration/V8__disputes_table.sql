-- V8: Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    filed_by_user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution VARCHAR(2000),
    resolved_by_user_id UUID,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX idx_disputes_booking ON disputes(booking_id);
CREATE INDEX idx_disputes_user ON disputes(filed_by_user_id);
CREATE INDEX idx_disputes_status ON disputes(status);
