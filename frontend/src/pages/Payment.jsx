import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";
import api from "../api/axios";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] =
    useState(null);

  useEffect(() => {
    const token = localStorage.getItem(
      "serenity_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await api.get(
          `/bookings/my/${id}`
        );

        setBooking(response.data?.booking);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  // =========================
  // RAZORPAY PAYMENT
  // =========================

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setError("");

      // =========================
      // CREATE RAZORPAY ORDER
      // =========================

      const response = await api.post(
        "/payments",
        {
          booking_id: Number(id),
        }
      );

      const payment =
        response.data?.payment;

      const razorpay =
        response.data?.razorpay;

      if (!payment || !razorpay) {
        throw new Error(
          "Invalid payment response from server."
        );
      }

      // =========================
      // CHECK RAZORPAY SCRIPT
      // =========================

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please refresh the page."
        );
      }

      // =========================
      // RAZORPAY OPTIONS
      // =========================

      const options = {
        key: razorpay.key_id,

        amount: razorpay.amount,

        currency: razorpay.currency || "INR",

        name: "Serenity Plan",

        description:
          razorpay.description ||
          "Travel Booking Payment",

        order_id:
          razorpay.order_id,

        prefill: {
          name:
            razorpay.prefill?.name || "",

          email:
            razorpay.prefill?.email || "",
        },

        notes: {
          booking_id: String(id),

          booking_reference:
            booking.booking_reference,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (
          razorpayResponse
        ) {
          try {
            setPaymentLoading(true);
            setError("");

            // =========================
            // VERIFY PAYMENT
            // =========================

            const verifyResponse =
              await api.post(
                "/payments/verify",
                {
                  razorpay_order_id:
                    razorpayResponse.razorpay_order_id,

                  razorpay_payment_id:
                    razorpayResponse.razorpay_payment_id,

                  razorpay_signature:
                    razorpayResponse.razorpay_signature,
                }
              );

            if (
              verifyResponse.data?.success
            ) {
              setPaymentSuccess(
                verifyResponse.data?.payment
              );
            } else {
              setError(
                "Payment verification failed."
              );
            }
          } catch (error) {
            console.error(
              "Payment Verification Error:",
              error
            );

            setError(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);

            setError(
              "Payment was cancelled. You can try again."
            );
          },
        },
      };

      const razorpayInstance =
        new window.Razorpay(options);

      razorpayInstance.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay Payment Failed:",
            response.error
          );

          setPaymentLoading(false);

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpayInstance.open();
    } catch (error) {
      console.error(
        "Payment Initiation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to initiate payment."
      );

      setPaymentLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          Loading payment details...
        </div>
      </div>
    );
  }

  // =========================
  // BOOKING ERROR
  // =========================

  if (error && !booking) {
    return (
      <div className="payment-page">
        <div className="payment-error-card">
          <h2>
            Unable to Load Payment
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PAYMENT SUCCESS
  // =========================

  if (paymentSuccess) {
    return (
      <div className="payment-page">
        <div className="payment-success-card">
          <div className="payment-success-icon">
            <CheckCircle size={42} />
          </div>

          <h1>
            Payment Successful
          </h1>

          <p>
            Your payment has been
            successfully verified.
          </p>

          <div className="payment-reference">
            <span>
              Payment ID
            </span>

            <strong>
              {
                paymentSuccess.razorpay_payment_id
              }
            </strong>
          </div>

          <div className="payment-info-grid">
            <div>
              <span>Amount</span>

              <strong>
                ₹
                {Number(
                  booking.total_amount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Gateway</span>

              <strong>
                Razorpay
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong
                style={{
                  color: "#059669",
                }}
              >
                Paid
              </strong>
            </div>

            <div>
              <span>Booking</span>

              <strong>
                {
                  booking.booking_reference
                }
              </strong>
            </div>
          </div>

          <div className="gateway-notice">
            <ShieldCheck size={19} />

            <p>
              Your booking has been
              confirmed and payment
              has been securely verified.
            </p>
          </div>

          <button
            className="payment-primary-btn"
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PAYMENT PAGE
  // =========================

  return (
    <div className="payment-page">
      <div className="payment-container">

        <button
          className="payment-back"
          onClick={() =>
            navigate("/my-bookings")
          }
        >
          <ArrowLeft size={18} />
          Back to My Bookings
        </button>

        <div className="payment-header">
          <span>
            SECURE CHECKOUT
          </span>

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Review your booking before
            proceeding with payment.
          </p>
        </div>

        {error && (
          <div className="payment-form-error">
            {error}
          </div>
        )}

        <div className="payment-grid">

          {/* BOOKING DETAILS */}

          <div className="payment-booking-card">
            <div className="payment-card-heading">
              <CreditCard size={21} />

              <h2>
                Booking Details
              </h2>
            </div>

            <div className="payment-detail">
              <span>
                Booking Reference
              </span>

              <strong>
                {
                  booking.booking_reference
                }
              </strong>
            </div>

            <div className="payment-detail">
              <span>
                Trip
              </span>

              <strong>
                {booking.trip_title ||
                  `Trip #${booking.trip_id}`}
              </strong>
            </div>

            <div className="payment-detail">
              <span>
                Travelers
              </span>

              <strong>
                {booking.travelers}
              </strong>
            </div>

            <div className="payment-detail">
              <span>
                Booking Status
              </span>

              <strong>
                {booking.booking_status}
              </strong>
            </div>

            <div className="payment-detail">
              <span>
                Payment Status
              </span>

              <strong>
                {booking.payment_status}
              </strong>
            </div>
          </div>

          {/* PAYMENT SUMMARY */}

          <div className="payment-summary-card">
            <div className="payment-card-heading">
              <IndianRupee size={21} />

              <h2>
                Payment Summary
              </h2>
            </div>

            <div className="payment-amount-row">
              <span>
                Booking Amount
              </span>

              <strong>
                ₹
                {Number(
                  booking.total_amount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="payment-divider" />

            <div className="payment-total-row">
              <span>
                Total Payable
              </span>

              <strong>
                ₹
                {Number(
                  booking.total_amount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <button
              className="proceed-payment-btn"
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading
                ? "Opening Razorpay..."
                : "Proceed to Payment"}

              {!paymentLoading && (
                <CreditCard size={18} />
              )}
            </button>

            <div className="secure-payment-note">
              <ShieldCheck size={16} />

              <span>
                Secure payment processing
                by Razorpay
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}