package com.booking.platform.tenant;

import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void set(UUID tenantId) {
        TENANT.set(tenantId);
    }

    public static UUID getRequired() {
        UUID tenantId = TENANT.get();
        if (tenantId == null) {
            throw new IllegalStateException("Missing tenant context");
        }
        return tenantId;
    }

    public static UUID getOrNull() {
        return TENANT.get();
    }

    public static void clear() {
        TENANT.remove();
    }
}
