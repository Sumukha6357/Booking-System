package com.booking.platform.web;

import com.booking.platform.service.CalendarSyncService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarSyncService calendarSyncService;

    public CalendarController(CalendarSyncService calendarSyncService) {
        this.calendarSyncService = calendarSyncService;
    }

    @GetMapping(value = "/listing/{listingId}/export.ics", produces = MediaType.TEXT_PLAIN_VALUE)
    public void exportCalendar(@PathVariable UUID listingId, HttpServletResponse response) throws IOException {
        String icalContent = calendarSyncService.generateIcalFeed(listingId);
        
        response.setContentType("text/calendar; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"booking-calendar-" + listingId + ".ics\"");
        response.getWriter().write(icalContent);
    }

    @PostMapping("/listing/{listingId}/import")
    public String importCalendar(@PathVariable UUID listingId, @RequestBody String icalContent) {
        return calendarSyncService.importIcalFeed(listingId, icalContent);
    }
}
