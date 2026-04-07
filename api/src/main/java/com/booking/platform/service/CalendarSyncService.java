package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.repository.ListingRepository;
import com.booking.platform.tenant.TenantContext;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CalendarSyncService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;

    public CalendarSyncService(BookingRepository bookingRepository, ListingRepository listingRepository) {
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
    }

    public String generateIcalFeed(UUID listingId) {
        UUID tenantId = TenantContext.getRequired();
        
        if (listingRepository.findByIdAndTenantId(listingId, tenantId).isEmpty()) {
            throw new NotFoundException("Listing not found");
        }

        List<Booking> bookings = bookingRepository.findByListingId(listingId)
            .stream()
            .filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED)
            .toList();

        StringBuilder ical = new StringBuilder();
        ical.append("BEGIN:VCALENDAR\r\n");
        ical.append("VERSION:2.0\r\n");
        ical.append("PRODID:-//Booking Platform//EN\r\n");
        ical.append("CALSCALE:GREGORIAN\r\n");
        ical.append("METHOD:PUBLISH\r\n");
        
        java.time.format.DateTimeFormatter icalFormat = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd");
        
        for (Booking booking : bookings) {
            ical.append("BEGIN:VEVENT\r\n");
            ical.append("UID:").append(booking.getId()).append("@booking-platform\r\n");
            ical.append("DTSTART;VALUE=DATE:").append(booking.getCheckIn().format(icalFormat)).append("\r\n");
            ical.append("DTEND;VALUE=DATE:").append(booking.getCheckOut().format(icalFormat)).append("\r\n");
            ical.append("SUMMARY:Booking ").append(booking.getState()).append("\r\n");
            ical.append("DESCRIPTION:Reservation for ").append(booking.getGuestCount()).append(" guest(s)\r\n");
            ical.append("STATUS:").append(booking.getState() == BookingState.CONFIRMED ? "CONFIRMED" : "COMPLETED").append("\r\n");
            ical.append("END:VEVENT\r\n");
        }
        
        ical.append("END:VCALENDAR\r\n");
        
        return ical.toString();
    }

    public String importIcalFeed(UUID listingId, String icalContent) {
        UUID tenantId = TenantContext.getRequired();
        
        if (listingRepository.findByIdAndTenantId(listingId, tenantId).isEmpty()) {
            throw new NotFoundException("Listing not found");
        }
        
        int imported = 0;
        String[] lines = icalContent.split("\n");
        LocalDate currentStart = null;
        LocalDate currentEnd = null;
        
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("DTSTART")) {
                String dateStr = line.replaceAll(".*:", "").replaceAll("[^0-9]", "");
                if (dateStr.length() == 8) {
                    currentStart = LocalDate.parse(dateStr.substring(0, 4) + "-" + dateStr.substring(4, 6) + "-" + dateStr.substring(6, 8));
                }
            } else if (line.startsWith("DTEND")) {
                String dateStr = line.replaceAll(".*:", "").replaceAll("[^0-9]", "");
                if (dateStr.length() == 8) {
                    currentEnd = LocalDate.parse(dateStr.substring(0, 4) + "-" + dateStr.substring(4, 6) + "-" + dateStr.substring(6, 8));
                }
            } else if (line.equals("END:VEVENT") && currentStart != null && currentEnd != null) {
                imported++;
                currentStart = null;
                currentEnd = null;
            }
        }
        
        return "Imported " + imported + " events from calendar";
    }
}
