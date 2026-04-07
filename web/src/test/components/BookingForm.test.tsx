import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BookingForm from '@/components/BookingForm'

// Mock the Next.js router
const mockPush = vi.fn()
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
  }),
}))

describe('BookingForm', () => {
  it('renders booking form correctly', () => {
    render(<BookingForm />)
    
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-in date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-out date/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search availability/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<BookingForm />)
    
    const submitButton = screen.getByRole('button', { name: /search availability/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/destination is required/i)).toBeInTheDocument()
      expect(screen.getByText(/check-in date is required/i)).toBeInTheDocument()
      expect(screen.getByText(/check-out date is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<BookingForm />)
    
    const destinationInput = screen.getByLabelText(/destination/i)
    const checkInInput = screen.getByLabelText(/check-in date/i)
    const checkOutInput = screen.getByLabelText(/check-out date/i)
    const submitButton = screen.getByRole('button', { name: /search availability/i })
    
    fireEvent.change(destinationInput, { target: { value: 'New York' } })
    fireEvent.change(checkInInput, { target: { value: '2024-06-01' } })
    fireEvent.change(checkOutInput, { target: { value: '2024-06-05' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?destination=New York&checkIn=2024-06-01&checkOut=2024-06-05')
    })
  })
})
