import React, { useEffect, useState } from "react";
import { contactService } from "../services/services";
import { useAuth } from "../context/AuthContext";
import { isValidContactName } from "../utils/validationRules";

const CONTACT_RATE_LIMIT_KEY = "contact_form_rate_limit_v1";
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_MIN_INTERVAL_MS = 60 * 1000;

function sanitizeTextInput(
  value,
  { maxLength = 500, allowLineBreaks = false } = {},
) {
  if (typeof value !== "string") return "";

  let sanitized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>`]/g, "")
    .replace(/\u0000/g, "");

  if (allowLineBreaks) {
    sanitized = sanitized.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  } else {
    sanitized = sanitized.replace(/\s+/g, " ");
  }

  return sanitized.trim().slice(0, maxLength);
}

function sanitizeEmailInput(value) {
  return sanitizeTextInput(value, { maxLength: 254 }).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidContactSubject(value) {
  return /^[^<>`]+$/.test(value);
}

function isValidContactMessage(value) {
  return /^[^<>`]+$/.test(value);
}

function getRateLimitSnapshot(now = Date.now()) {
  try {
    const raw = localStorage.getItem(CONTACT_RATE_LIMIT_KEY);
    const parsed = raw ? JSON.parse(raw) : { attempts: [] };
    const attempts = Array.isArray(parsed.attempts)
      ? parsed.attempts.filter(
          (timestamp) =>
            Number.isFinite(timestamp) &&
            now - timestamp < RATE_LIMIT_WINDOW_MS,
        )
      : [];

    const lastAttempt = attempts[attempts.length - 1] ?? null;
    if (lastAttempt && now - lastAttempt < RATE_LIMIT_MIN_INTERVAL_MS) {
      return {
        allowed: false,
        retryAfterMs: RATE_LIMIT_MIN_INTERVAL_MS - (now - lastAttempt),
        attempts,
      };
    }

    if (attempts.length >= RATE_LIMIT_MAX_REQUESTS) {
      const oldestAttempt = attempts[0];
      return {
        allowed: false,
        retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - oldestAttempt),
        attempts,
      };
    }

    return { allowed: true, retryAfterMs: 0, attempts };
  } catch {
    return { allowed: true, retryAfterMs: 0, attempts: [] };
  }
}

function registerRateLimitAttempt(now = Date.now()) {
  const snapshot = getRateLimitSnapshot(now);
  const updatedAttempts = [...snapshot.attempts, now];

  try {
    localStorage.setItem(
      CONTACT_RATE_LIMIT_KEY,
      JSON.stringify({
        attempts: updatedAttempts,
      }),
    );
  } catch {
    // Ignore persistence errors; submit flow should continue.
  }
}

function formatRetryAfter(ms) {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSending) return;

    setSubmitted(false);
    setErrorMessage("");

    if (!user) {
      setErrorMessage("Please log in to send a message.");
      return;
    }

    const rateLimit = getRateLimitSnapshot();
    if (!rateLimit.allowed) {
      setErrorMessage(
        `Too many attempts. Please wait ${formatRetryAfter(rateLimit.retryAfterMs)} before sending again.`,
      );
      return;
    }

    const sanitizedData = {
      name: sanitizeTextInput(formData.name, { maxLength: 80 }),
      email: sanitizeEmailInput(formData.email),
      subject: sanitizeTextInput(formData.subject, { maxLength: 120 }),
      message: sanitizeTextInput(formData.message, {
        maxLength: 2000,
        allowLineBreaks: true,
      }),
    };

    if (
      !sanitizedData.name ||
      !sanitizedData.subject ||
      !sanitizedData.message
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (sanitizedData.name.length < 2 || sanitizedData.name.length > 80) {
      setErrorMessage("Name must be between 2 and 80 characters.");
      return;
    }

    if (!isValidContactName(sanitizedData.name)) {
      setErrorMessage("Name can only include English letters and spaces.");
      return;
    }

    if (!isValidEmail(sanitizedData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (
      sanitizedData.subject.length < 3 ||
      sanitizedData.subject.length > 120
    ) {
      setErrorMessage("Subject must be between 3 and 120 characters.");
      return;
    }

    if (!isValidContactSubject(sanitizedData.subject)) {
      setErrorMessage("Subject contains invalid characters.");
      return;
    }

    if (
      sanitizedData.message.length < 10 ||
      sanitizedData.message.length > 2000
    ) {
      setErrorMessage("Message must be between 10 and 2000 characters.");
      return;
    }

    if (!isValidContactMessage(sanitizedData.message)) {
      setErrorMessage("Message contains invalid characters.");
      return;
    }

    setIsSending(true);
    registerRateLimitAttempt();

    contactService
      .sendMessage({
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
      })
      .then(
        () => {
          setSubmitted(true);
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
          setTimeout(() => setSubmitted(false), 5000);
        },
        (error) => {
          const status = error?.response?.status;
          const serverMessage = error?.response?.data?.message;
          const validationErrors = error?.response?.data?.errors;
          const validationMessage = Array.isArray(validationErrors)
            ? validationErrors
                .map((item) => item?.message)
                .filter(Boolean)
                .join(" ")
            : "";

          console.error("Contact API Error:", {
            status,
            message: serverMessage || error?.message,
            errors: validationErrors,
          });

          setErrorMessage(
            validationMessage ||
              serverMessage ||
              "Message failed. Please try again in a moment.",
          );
        },
      )
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-100 p-4 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Contact Us
          </h1>
          <p className="text-gray-500">We'd love to hear from you</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Owner</h3>
            <p className="text-gray-600">Apurba Maji</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Email</h3>
            <p className="text-gray-600">90plusstore0@gmail.com</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
            <p className="text-gray-600">+91 1234567890</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-xl">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Send us a Message
              </h2>
            </div>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <div className="bg-green-100 p-1 rounded-full">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-green-800 font-medium">
                  Thank you for your message! We'll get back to you soon.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <div className="bg-red-100 p-1 rounded-full">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-10.5a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3zM10 13.5a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-red-800 font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!user && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-medium">
                  Please log in to send us a message.
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={Boolean(user)}
                  required
                  maxLength={80}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    user
                      ? "bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                      : "border-gray-200"
                  }`}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={Boolean(user)}
                  required
                  maxLength={254}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    user
                      ? "bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                      : "border-gray-200"
                  }`}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={2000}
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder="Your message..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending || !user}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSending || !user
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                {isSending
                  ? "Sending..."
                  : user
                    ? "Send Message"
                    : "Login Required"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
