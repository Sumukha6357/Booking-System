ALTER TABLE app_users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS jti VARCHAR(128);
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_reason VARCHAR(128);
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_refresh_tokens_jti ON refresh_tokens (jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session_id ON refresh_tokens (session_id);

CREATE TABLE IF NOT EXISTS revoked_sessions (
    session_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES app_users(id),
    reason VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    actor_user_id UUID,
    actor_role VARCHAR(64),
    ip_address VARCHAR(64),
    user_agent VARCHAR(512),
    event_type VARCHAR(128) NOT NULL,
    entity_type VARCHAR(128),
    entity_id VARCHAR(128),
    before_state TEXT,
    after_state TEXT,
    correlation_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_tenant_created ON security_audit_logs (tenant_id, created_at);
