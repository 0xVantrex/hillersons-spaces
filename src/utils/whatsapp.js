// utils/whatsapp.js

export const WhatsAppLink = (message) => {
  const phone = "254700000000"; // 🔁 Replace with your real WhatsApp number (e.g. 254712345678)
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
