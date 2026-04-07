package com.booking.platform.web;

import com.booking.platform.dto.AnalyticsResponse;
import com.booking.platform.dto.RevenueExport;
import com.booking.platform.service.AnalyticsService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public AnalyticsResponse metrics() {
        return analyticsService.getTenantMetrics();
    }

    @GetMapping("/export")
    public List<RevenueExport> export() {
        return analyticsService.getRevenueExport();
    }
}
