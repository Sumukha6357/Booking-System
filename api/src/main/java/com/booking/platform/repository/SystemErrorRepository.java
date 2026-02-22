package com.booking.platform.repository;

import com.booking.platform.domain.SystemError;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemErrorRepository extends JpaRepository<SystemError, UUID> {
}
