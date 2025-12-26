package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Payment;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.PaymentRepository;
import com.rideconnect.backend.service.payment.PaymentProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private com.rideconnect.backend.repository.UserRepository userRepository;
    @Autowired @Qualifier("razorpayProvider") private PaymentProvider razorpayProvider;
    @Autowired @Qualifier("mockProvider") private PaymentProvider mockProvider;
    @Autowired private NotificationService notificationService;
    @Autowired private EmailService emailService;

    // --- TAX CONSTANTS ---
    private static final double GST_RATE = 0.05; // 5%
    private static final double PLATFORM_FEE_RATE = 0.02; // 2%

    // Helper: Calculates Base + Taxes
    private Double calculateTotalWithTaxes(Booking booking) {
        Double baseFare = booking.getRide().getPricePerSeat() * booking.getSeatsBooked();
        Double gst = baseFare * GST_RATE;
        Double platformFee = baseFare * PLATFORM_FEE_RATE;

        // Round to 2 decimal places
        return Math.round((baseFare + gst + platformFee) * 100.0) / 100.0;
    }

    public Map<String, Object> initiatePayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // UPDATED: Charge the Total Amount (Base + Tax + Fee)
        Double totalAmount = calculateTotalWithTaxes(booking);

        try {
            return razorpayProvider.createOrder(totalAmount, bookingId);
        } catch (Exception e) {
            try {
                return mockProvider.createOrder(totalAmount, bookingId);
            } catch (Exception ex) {
                throw new RuntimeException("Payment init failed");
            }
        }
    }

    public Payment completePayment(Long bookingId, String orderId, String paymentId, String signature, String providerType) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isVerified = false;
        try {
            if (providerType == null) providerType = "MOCK";
            if ("RAZORPAY".equalsIgnoreCase(providerType)) {
                isVerified = razorpayProvider.verifyPayment(orderId, paymentId, signature);
            } else {
                isVerified = true;
            }
        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed");
        }

        if (isVerified) {
            // UPDATED: Save the Total Amount in the database
            Double totalAmount = calculateTotalWithTaxes(booking);

            Payment payment = Payment.builder()
                    .booking(booking)
                    .amount(totalAmount)
                    .paymentMethod(providerType)
                    .transactionId(paymentId)
                    .orderId(orderId)
                    .status("SUCCESS")
                    .paymentTime(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);

            emailService.sendBookingConfirmation(
                    booking.getPassenger().getEmail(),
                    booking.getPassenger().getName(),
                    booking.getRide().getSource(),
                    booking.getRide().getDestination(),
                    payment.getAmount()
            );

            // Notify Driver
            String driverEmail = booking.getRide().getDriver().getEmail();
            notificationService.notifyUser(driverEmail, "New Booking!",
                    booking.getPassenger().getName() + " booked " + booking.getSeatsBooked() + " seat(s).", "SUCCESS");

            // Notify Passenger
            notificationService.notifyUser(booking.getPassenger().getEmail(), "Booking Confirmed",
                    "Your ride is confirmed. Total Paid: ₹" + totalAmount, "SUCCESS");

            return payment;
        } else {
            throw new RuntimeException("Invalid Signature");
        }
    }

    public List<Payment> getMyPaymentHistory(String email) {
        var user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if(user.getRole() == com.rideconnect.backend.model.Role.DRIVER) {
            return paymentRepository.findDriverEarnings(email);
        }
        return paymentRepository.findByBooking_Passenger_Email(email);
    }

    public void processRefund(Long bookingId) {
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);

        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            if ("SUCCESS".equals(payment.getStatus())) {
                payment.setStatus("REFUNDED");
                paymentRepository.save(payment);

                // Refund the full amount (including taxes)
                String userEmail = payment.getBooking().getPassenger().getEmail();
                notificationService.notifyUser(userEmail, "Refund Processed",
                        "₹" + payment.getAmount() + " has been refunded.", "INFO");
            }
        }
    }
}