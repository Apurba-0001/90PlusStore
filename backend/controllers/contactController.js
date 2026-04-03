import axios from "axios";

const EMAIL_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

const sanitizeInlineText = (value, maxLength) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>`]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};

const sanitizeMessageText = (value, maxLength) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>`]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export const sendContactMessage = async (req, res) => {
  const name = sanitizeInlineText(req.body?.name, 80);
  const email = sanitizeInlineText(req.body?.email, 254).toLowerCase();
  const subject = sanitizeInlineText(req.body?.subject, 120);
  const message = sanitizeMessageText(req.body?.message, 2000);

  if (!name || !subject || !message || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contact form data",
    });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error("[Contact] Missing EmailJS backend configuration");
    return res.status(503).json({
      success: false,
      message: "Contact service is temporarily unavailable",
    });
  }

  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        name,
        email,
        subject,
        message,
      },
      ...(privateKey ? { accessToken: privateKey } : {}),
    };

    await axios.post(EMAIL_API_URL, payload, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    const statusCode = error.response?.status;
    const providerMessage =
      typeof error.response?.data === "string"
        ? error.response.data
        : JSON.stringify(error.response?.data || {});
    const isServerApiBlockedByEmailJs =
      statusCode === 403 &&
      providerMessage
        .toLowerCase()
        .includes(
          "api access from non-browser environments is currently disabled",
        );

    console.error("[Contact] Provider request failed", {
      statusCode,
      responseText: error.response?.data,
      message: error.message,
    });

    if (isServerApiBlockedByEmailJs) {
      return res.status(503).json({
        success: false,
        message:
          "Contact service is not configured for server sending yet. Please ask support to enable EmailJS non-browser API access.",
      });
    }

    if (statusCode === 429) {
      return res.status(429).json({
        success: false,
        message: "Too many contact requests. Please try again shortly.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to send message right now. Please try again later.",
    });
  }
};
