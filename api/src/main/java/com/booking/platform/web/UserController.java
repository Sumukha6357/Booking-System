package com.booking.platform.web;

import com.booking.platform.domain.AppUser;
import com.booking.platform.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<AppUser> list() {
        return userService.listUsers();
    }

    @GetMapping("/{userId}")
    public AppUser get(@PathVariable UUID userId) {
        return userService.getUser(userId);
    }

    @GetMapping("/profile")
    public AppUser getProfile(Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        return userService.getUser(userId);
    }

    @PutMapping("/profile")
    public AppUser updateProfile(@Valid @RequestBody AppUser user, Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        return userService.updateUser(userId, user);
    }

    @DeleteMapping("/profile")
    public void deleteProfile(Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        userService.deleteUser(userId);
    }

    @PutMapping("/profile/photo")
    public AppUser updatePhoto(@RequestBody String photoUrl, Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        return userService.updatePhoto(userId, photoUrl);
    }

    @PostMapping("/profile/verify-email")
    public AppUser verifyEmail(Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        return userService.verifyEmail(userId);
    }

    @PostMapping("/profile/verify-phone")
    public AppUser verifyPhone(@RequestBody String code, Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        return userService.verifyPhone(userId, code);
    }
}
