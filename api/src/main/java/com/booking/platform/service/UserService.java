package com.booking.platform.service;

import com.booking.platform.domain.AppUser;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.AppUserRepository;
import com.booking.platform.tenant.TenantContext;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository userRepository;

    public UserService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AppUser> listUsers() {
        UUID tenantId = TenantContext.getRequired();
        return userRepository.findByTenantId(tenantId);
    }

    public AppUser getUser(UUID userId) {
        UUID tenantId = TenantContext.getRequired();
        return userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional
    public AppUser updateUser(UUID userId, AppUser updateData) {
        UUID tenantId = TenantContext.getRequired();
        AppUser user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        // Update allowed fields
        if (updateData.getFirstName() != null) {
            user.setFirstName(updateData.getFirstName());
        }
        if (updateData.getLastName() != null) {
            user.setLastName(updateData.getLastName());
        }
        if (updateData.getPhone() != null) {
            user.setPhone(updateData.getPhone());
        }
        // Note: Enabled status is usually admin-only, but for self-service profile updates, we might allow it
        // For now, let's leave it as is or handle it via a separate endpoint if needed.
        // Assuming updateData might come from a partial DTO, we should be careful not to overwrite nulls.
        // But since AppUser is the entity, and we are merging, we need to check if fields are provided.
        // Actually, if the JSON body contains null, it will set null. We should only update if not null.
        // However, the current logic above handles null checks.

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        UUID tenantId = TenantContext.getRequired();
        AppUser user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        userRepository.delete(user);
    }

    @Transactional
    public AppUser updatePhoto(UUID userId, String photoUrl) {
        UUID tenantId = TenantContext.getRequired();
        AppUser user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        user.setProfilePhotoUrl(photoUrl);
        return userRepository.save(user);
    }

    @Transactional
    public AppUser verifyEmail(UUID userId) {
        UUID tenantId = TenantContext.getRequired();
        AppUser user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    @Transactional
    public AppUser verifyPhone(UUID userId, String code) {
        UUID tenantId = TenantContext.getRequired();
        AppUser user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        // In production, verify the code matches what's stored in Redis/sent via SMS
        user.setPhoneVerified(true);
        return userRepository.save(user);
    }
}
