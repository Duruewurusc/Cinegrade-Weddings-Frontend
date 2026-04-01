import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const phoneNumber = "2348139285321"; // Replace with your WhatsApp number (include country code, no +)
  const message = "Hello, I would like to make an inquiry.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="fixed bottom-7 right-7 z-50 group">
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition transform hover:scale-110 duration-300 block ease-in-out animate-bounce"
  >
    <FaWhatsapp size={28} />
  </a>

  <span className="absolute right-16 bottom-3 bg-gray-800 text-white text-lg font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition">
    Chat with us
  </span>
</div>
  );
};

export default WhatsAppButton;