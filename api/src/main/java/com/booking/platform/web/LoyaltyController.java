package com.booking.platform.web;

import com.booking.platform.domain.GiftCard;
import com.booking.platform.domain.LoyaltyPoints;
import com.booking.platform.repository.GiftCardRepository;
import com.booking.platform.repository.LoyaltyPointsRepository;
import com.booking.platform.tenant.TenantContext;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LoyaltyController {

    private final LoyaltyPointsRepository loyaltyRepository;
    private final GiftCardRepository giftCardRepository;

    public LoyaltyController(LoyaltyPointsRepository loyaltyRepository, GiftCardRepository giftCardRepository) {
        this.loyaltyRepository = loyaltyRepository;
        this.giftCardRepository = giftCardRepository;
    }

    @GetMapping("/loyalty/points")
    public LoyaltyPoints getMyPoints(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        return loyaltyRepository.findByUserIdAndTenantId(userId, tenantId)
            .orElseGet(() -> createNewPointsAccount(userId, tenantId));
    }

    @PostMapping("/loyalty/redeem")
    public LoyaltyPoints redeemPoints(@RequestParam int points, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        LoyaltyPoints lp = loyaltyRepository.findByUserIdAndTenantId(userId, tenantId)
            .orElseGet(() -> createNewPointsAccount(userId, tenantId));
        
        if (lp.getTotalPoints() < points) {
            throw new RuntimeException("Insufficient points");
        }
        lp.setTotalPoints(lp.getTotalPoints() - points);
        return loyaltyRepository.save(lp);
    }

    @PostMapping("/gift-cards/purchase")
    public GiftCard purchaseGiftCard(@RequestBody PurchaseGiftCardRequest request, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        
        GiftCard card = new GiftCard();
        card.setTenantId(tenantId);
        card.setCode(generateGiftCardCode());
        card.setInitialAmount(request.amount());
        card.setRemainingAmount(request.amount());
        card.setPurchasedByUserId(userId);
        card.setRecipientEmail(request.recipientEmail());
        card.setMessage(request.message());
        card.setActive(true);
        
        if (request.expiresInDays() != null) {
            card.setExpiresAt(Instant.now().plus(request.expiresInDays(), ChronoUnit.DAYS));
        }
        
        return giftCardRepository.save(card);
    }

    @PostMapping("/gift-cards/redeem")
    public GiftCard redeemGiftCard(@RequestParam String code, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        GiftCard card = giftCardRepository.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new RuntimeException("Invalid gift card code"));
        
        if (card.getExpiresAt() != null && card.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Gift card has expired");
        }
        
        if (card.getGiftedToUserId() == null) {
            card.setGiftedToUserId(userId);
        }
        
        return giftCardRepository.save(card);
    }

    @GetMapping("/gift-cards/my")
    public List<GiftCard> myGiftCards(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return giftCardRepository.findAll().stream()
            .filter(c -> c.getPurchasedByUserId().equals(userId) || c.getGiftedToUserId().equals(userId))
            .toList();
    }

    private LoyaltyPoints createNewPointsAccount(UUID userId, UUID tenantId) {
        LoyaltyPoints lp = new LoyaltyPoints();
        lp.setTenantId(tenantId);
        lp.setUserId(userId);
        lp.setTotalPoints(0);
        lp.setLifetimePoints(0);
        lp.setTier("BRONZE");
        return loyaltyRepository.save(lp);
    }

    private String generateGiftCardCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder("GIFT-");
        for (int i = 0; i < 12; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    public record PurchaseGiftCardRequest(
        BigDecimal amount,
        String recipientEmail,
        String message,
        Integer expiresInDays
    ) {}
}
