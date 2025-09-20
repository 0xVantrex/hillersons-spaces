// utils/whatsapp.js

export const WhatsAppLink = (message) => {
  const phone = "254763831806";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
