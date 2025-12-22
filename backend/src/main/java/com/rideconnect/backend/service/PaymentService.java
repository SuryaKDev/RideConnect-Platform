package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.NotificationDto;
import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Payment;
import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.PaymentRepository;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.service.payment.PaymentProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    @Qualifier("razorpayProvider")
    private PaymentProvider razorpayProvider;

    @Autowired
    @Qualifier("mockProvider")
    private PaymentProvider mockProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired private NotificationService notificationService; // Inject WebSocket sender

    public Map<String, Object> initiatePayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Double amount = booking.getRide().getPricePerSeat() * booking.getSeatsBooked();

        try {
            System.out.println("💳 Attempting Razorpay Order for Booking ID: " + bookingId);
            return razorpayProvider.createOrder(amount, bookingId);
        } catch (Exception e) {
            System.err.println("❌ Razorpay Failed: " + e.getMessage());
            try {
                return mockProvider.createOrder(amount, bookingId);
            } catch (Exception ex) {
                throw new RuntimeException("All Payment Providers Failed: " + ex.getMessage());
            }
        }
    }

    public Payment completePayment(Long bookingId, String orderId, String paymentId, String signature, String providerType) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isVerified = false;

        try {
            // FIX: Ensure providerType is not null, default to MOCK if missing
            if (providerType == null) providerType = "MOCK";

            if ("RAZORPAY".equalsIgnoreCase(providerType)) {
                // Real Verification
                isVerified = razorpayProvider.verifyPayment(orderId, paymentId, signature);
            } else {
                // Mock verification (Always true)
                isVerified = true;
            }
        } catch (Exception e) {
            // Log the error to help debug
            System.err.println("Verification Error: " + e.getMessage());
            throw new RuntimeException("Payment Verification Failed: " + e.getMessage());
        }

        if (isVerified) {
            Payment payment = Payment.builder()
                    .booking(booking)
                    .amount(booking.getRide().getPricePerSeat() * booking.getSeatsBooked())
                    .paymentMethod(providerType)
                    .transactionId(paymentId)
                    .orderId(orderId)
                    .status("SUCCESS")
                    .paymentTime(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);

            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);

            // 🔔 1. NOTIFY DRIVER (New Booking!)
            String driverEmail = booking.getRide().getDriver().getEmail();
            notificationService.notifyUser(driverEmail, "New Booking!",
                    booking.getPassenger().getName() + " booked " + booking.getSeatsBooked() + " seat(s).", "SUCCESS");

            // 🔔 2. NOTIFY PASSENGER (Confirmation)
            notificationService.notifyUser(booking.getPassenger().getEmail(), "Booking Confirmed",
                    "Your ride to " + booking.getRide().getDestination() + " is confirmed.", "SUCCESS");

            return payment;
        } else {
            throw new RuntimeException("Invalid Signature");
        }
    }

    public List<Payment> getMyPaymentHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.DRIVER) {
            // If Driver, show payments received
            return paymentRepository.findByBooking_Ride_Driver_Email(email);
        } else {
            // If Passenger, show payments made
            return paymentRepository.findByBooking_Passenger_Email(email);
        }
    }

    // --- NEW: REFUND LOGIC ---
    public void processRefund(Long bookingId) {
        // Find if a payment exists for this booking
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);

        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();

            // Only refund if it was successful previously
            if ("SUCCESS".equals(payment.getStatus())) {

                // In a real Production App, you would call razorpayProvider.refund() here.
                // For this project, we simulate it by updating the DB status.
                payment.setStatus("REFUNDED");
                paymentRepository.save(payment);

                // 🔔 3. NOTIFY PASSENGER (Refund)
                String userEmail = payment.getBooking().getPassenger().getEmail();
                notificationService.notifyUser(userEmail, "Refund Processed",
                        "₹" + payment.getAmount() + " has been refunded.", "INFO");


                System.out.println("Processing Refund for Booking ID: " + bookingId);
            }
        }
    }
}