package com.booking.platform.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.booking.platform.service.RateLimitService;
import jakarta.servlet.FilterChain;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    @Mock
    private RateLimitService rateLimitService;

    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        filter = new RateLimitFilter(rateLimitService);
    }

    @Test
    void returns429WhenLimitExceeded() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse res = new MockHttpServletResponse();

        when(rateLimitService.allow(Mockito.anyString(), Mockito.anyInt())).thenReturn(false);

        filter.doFilter(req, res, new NoopChain());
        assertEquals(429, res.getStatus());
    }

    @Test
    void allowsWhenUnderLimit() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/listings/search");
        req.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse res = new MockHttpServletResponse();

        when(rateLimitService.allow(Mockito.anyString(), Mockito.anyInt())).thenReturn(true);

        filter.doFilter(req, res, new NoopChain());
        assertEquals(200, res.getStatus());
    }

    private static class NoopChain implements FilterChain {
        @Override
        public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response) throws IOException {
            ((MockHttpServletResponse) response).setStatus(200);
        }
    }
}
