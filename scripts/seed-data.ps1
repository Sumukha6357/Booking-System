# Sample data seeding script for Booking System
# This script creates sample listings and bookings using the API

$baseUrl = "http://localhost:8080"

# Function to make API calls
function Invoke-Api {
    param(
        [string]$Method = "GET",
        [string]$Path,
        [object]$Body,
        [string]$Token,
        [string]$TenantId
    )

    $headers = @{
        "Content-Type" = "application/json"
    }

    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    if ($TenantId) {
        $headers["X-Tenant-Id"] = $TenantId
    }

    $uri = "$baseUrl$Path"
    $bodyJson = if ($Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }

    try {
        if ($Method -eq "GET") {
            return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        } else {
            return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $bodyJson
        }
    } catch {
        Write-Error "API call failed: $_"
        throw
    }
}

# Register a new user (tenant)
Write-Host "Creating new tenant..." -ForegroundColor Green
$tenantId = [guid]::NewGuid().ToString()
$user = @{
    tenantId = $tenantId
    email = "vendor@example.com"
    password = "Password123!"
    role = "VENDOR"
}
$authResponse = Invoke-Api -Method POST -Path "/api/auth/register" -Body $user
$token = $authResponse.token
Write-Host "Tenant created: $tenantId" -ForegroundColor Yellow
Write-Host "Token: $token" -ForegroundColor Gray

# Create sample listings
$listings = @(
    @{
        title = "Ocean View Villa"
        description = "Stunning villa with panoramic ocean views and private pool."
        location = "Malibu, CA"
        latitude = 34.0259
        longitude = -118.7798
        basePrice = 450.00
        active = $true
    },
    @{
        title = "Mountain Retreat"
        description = "Cozy cabin nestled in the mountains with fireplace."
        location = "Aspen, CO"
        latitude = 39.1911
        longitude = -106.8175
        basePrice = 320.00
        active = $true
    },
    @{
        title = "Downtown Loft"
        description = "Modern loft in the heart of the city."
        location = "New York, NY"
        latitude = 40.7128
        longitude = -74.0060
        basePrice = 275.00
        active = $true
    },
    @{
        title = "Beachfront Cottage"
        description = "Charming cottage steps from the sand."
        location = "Miami Beach, FL"
        latitude = 25.7617
        longitude = -80.1918
        basePrice = 380.00
        active = $true
    }
)

Write-Host "`nCreating sample listings..." -ForegroundColor Green
foreach ($listing in $listings) {
    try {
        $created = Invoke-Api -Method POST -Path "/api/listings" -Body $listing -Token $token -TenantId $tenantId
        Write-Host "Created listing: $($created.title) (ID: $($created.id))" -ForegroundColor Yellow
    } catch {
        Write-Host "Failed to create listing: $_" -ForegroundColor Red
    }
}

# Get listings to use for bookings
Write-Host "`nFetching listings for bookings..." -ForegroundColor Green
$listingResponse = Invoke-Api -Method GET -Path "/api/listings/search?lat=34.0259&lon=-118.7798&radiusKm=5000" -Token $token -TenantId $tenantId
$listings = $listingResponse

if ($listings.Count -gt 0) {
    # Create sample bookings
    $checkIn = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    $checkOut = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")

    Write-Host "`nCreating sample bookings..." -ForegroundColor Green
    foreach ($listing in $listings[0..1]) {
        try {
            $booking = @{
                listingId = $listing.listingId
                checkIn = $checkIn
                checkOut = $checkOut
            }
            $holdResponse = Invoke-Api -Method POST -Path "/api/bookings/hold" -Body $booking -Token $token -TenantId $tenantId
            Write-Host "Held booking for: $($listing.title) (ID: $($holdResponse.bookingId))" -ForegroundColor Yellow

            # Confirm the booking
            $confirmResponse = Invoke-Api -Method POST -Path "/api/payments/bookings/$($holdResponse.bookingId)/confirm" -Token $token -TenantId $tenantId
            Write-Host "Confirmed booking: $($holdResponse.bookingId)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to create booking: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No listings found for booking creation." -ForegroundColor Red
}

Write-Host "`nSeeding completed!" -ForegroundColor Green
Write-Host "Tenant ID: $tenantId" -ForegroundColor Yellow
Write-Host "Credentials: vendor@example.com / Password123!" -ForegroundColor Yellow
