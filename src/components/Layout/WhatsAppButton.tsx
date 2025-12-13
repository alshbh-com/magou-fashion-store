import { mport { Messa } ircl "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "201109427245";
  const message = " مرحباً، أود الاستفسار ";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] animate-bounce"
      aria-label="تواصل معنا على واتساب"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
};

export default WhatsAppButton;
