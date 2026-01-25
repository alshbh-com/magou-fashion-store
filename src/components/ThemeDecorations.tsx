import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const ThemeDecorations = () => {
  const { activeTheme } = useTheme();

  if (!activeTheme || activeTheme.slug === "default") return null;

  const renderDecorations = () => {
    switch (activeTheme.slug) {
      case "ramadan":
        return <RamadanDecorations />;
      case "eid-fitr":
        return <EidFitrDecorations />;
      case "eid-adha":
        return <EidAdhaDecorations />;
      case "national-day":
        return <NationalDayDecorations />;
      case "mothers-day":
        return <MothersDayDecorations />;
      case "valentines":
        return <ValentinesDecorations />;
      case "sham-nessim":
        return <ShamNessimDecorations />;
      case "back-school":
        return <BackToSchoolDecorations />;
      case "winter":
        return <WinterDecorations />;
      case "summer-sale":
        return <SummerSaleDecorations />;
      case "black-friday":
        return <BlackFridayDecorations />;
      default:
        return null;
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {renderDecorations()}
    </div>
  );
};

// رمضان - فوانيس وهلال ونجوم
const RamadanDecorations = () => (
  <>
    {/* Lanterns hanging from top */}
    <div className="absolute top-0 left-0 right-0 flex justify-between px-4 md:px-12">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.8, type: "spring" }}
          className="relative"
        >
          <div className="w-1 h-8 md:h-16 bg-gradient-to-b from-amber-600 to-amber-800 mx-auto" />
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
            className="relative"
          >
            <svg width="40" height="60" viewBox="0 0 40 60" className="md:w-16 md:h-24">
              <defs>
                <linearGradient id={`lantern-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              {/* Lantern top */}
              <path d="M15 0 L25 0 L28 5 L12 5 Z" fill="#92400e" />
              {/* Lantern body */}
              <path d="M10 5 Q5 30 10 55 L30 55 Q35 30 30 5 Z" fill={`url(#lantern-grad-${i})`} opacity="0.9" />
              {/* Lantern glow */}
              <ellipse cx="20" cy="30" rx="8" ry="15" fill="#fef3c7" opacity="0.6" />
              {/* Decorative lines */}
              <path d="M12 15 Q20 20 28 15" stroke="#92400e" strokeWidth="1" fill="none" />
              <path d="M12 25 Q20 30 28 25" stroke="#92400e" strokeWidth="1" fill="none" />
              <path d="M12 35 Q20 40 28 35" stroke="#92400e" strokeWidth="1" fill="none" />
              <path d="M12 45 Q20 50 28 45" stroke="#92400e" strokeWidth="1" fill="none" />
              {/* Bottom tassel */}
              <path d="M18 55 L18 60 M20 55 L20 62 M22 55 L22 60" stroke="#92400e" strokeWidth="1" />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </div>

    {/* Crescent moon */}
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1, duration: 1, type: "spring" }}
      className="absolute top-20 left-8 md:left-16"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" className="md:w-20 md:h-20">
        <defs>
          <linearGradient id="moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
        <path
          d="M30 5 A25 25 0 1 1 30 55 A20 20 0 1 0 30 5"
          fill="url(#moon-grad)"
          filter="drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))"
        />
      </svg>
    </motion.div>

    {/* Stars */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`star-${i}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0.3, 1, 0.3], scale: 1 }}
        transition={{ 
          delay: i * 0.1, 
          duration: 2,
          repeat: Infinity,
          repeatDelay: Math.random() * 2
        }}
        className="absolute"
        style={{
          top: `${10 + Math.random() * 30}%`,
          left: `${5 + Math.random() * 90}%`,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" className="md:w-6 md:h-6">
          <path
            d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z"
            fill="#fcd34d"
            filter="drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))"
          />
        </svg>
      </motion.div>
    ))}

    {/* Banner */}
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="absolute top-24 md:top-32 right-4 md:right-8 bg-gradient-to-r from-purple-900/90 to-purple-800/90 text-amber-300 px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg border border-amber-500/30"
    >
      <p className="text-lg md:text-2xl font-bold">🌙 رمضان كريم 🌙</p>
    </motion.div>
  </>
);

// عيد الفطر - هلال وزينة وبالونات
const EidFitrDecorations = () => (
  <>
    {/* Balloons */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.15, duration: 1, type: "spring" }}
        className="absolute"
        style={{
          bottom: "0",
          left: `${5 + i * 12}%`,
        }}
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.2 }}
        >
          <svg width="40" height="100" viewBox="0 0 40 100" className="md:w-14 md:h-36">
            <defs>
              <linearGradient id={`balloon-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#22c55e", "#10b981", "#14b8a6", "#06b6d4"][i]} />
                <stop offset="100%" stopColor={["#16a34a", "#059669", "#0d9488", "#0891b2", "#16a34a", "#059669", "#0d9488", "#0891b2"][i]} />
              </linearGradient>
            </defs>
            <ellipse cx="20" cy="25" rx="18" ry="24" fill={`url(#balloon-${i})`} />
            <ellipse cx="16" cy="18" rx="4" ry="5" fill="rgba(255,255,255,0.3)" />
            <path d="M20 49 L18 55 L22 55 Z" fill={["#16a34a", "#059669", "#0d9488", "#0891b2", "#16a34a", "#059669", "#0d9488", "#0891b2"][i]} />
            <path d="M20 55 Q15 70 20 85 Q25 70 20 55" stroke="#d4d4d4" strokeWidth="1" fill="none" />
          </svg>
        </motion.div>
      </motion.div>
    ))}

    {/* Confetti */}
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={`confetti-${i}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: ["0vh", "100vh"],
          opacity: [1, 0],
          rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
        }}
        transition={{ 
          duration: 4 + Math.random() * 3,
          delay: Math.random() * 2,
          repeat: Infinity
        }}
        className="absolute w-2 h-2 md:w-3 md:h-3"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ["#22c55e", "#fbbf24", "#ec4899", "#3b82f6", "#f97316"][Math.floor(Math.random() * 5)],
          borderRadius: Math.random() > 0.5 ? "50%" : "0",
        }}
      />
    ))}

    {/* Banner */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring" }}
      className="absolute top-20 md:top-28 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600/95 to-emerald-500/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">🎉 عيد فطر سعيد 🎉</p>
    </motion.div>
  </>
);

// عيد الأضحى - خروف وزينة
const EidAdhaDecorations = () => (
  <>
    {/* Decorative flags */}
    <div className="absolute top-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
      <svg width="100%" height="100" viewBox="0 0 1200 100" preserveAspectRatio="none">
        {[...Array(20)].map((_, i) => (
          <motion.g key={i} initial={{ y: -50 }} animate={{ y: 0 }} transition={{ delay: i * 0.05 }}>
            <polygon
              points={`${i * 60},0 ${i * 60 + 30},0 ${i * 60 + 30},40 ${i * 60 + 15},55 ${i * 60},40`}
              fill={i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#fbbf24" : "#16a34a"}
              opacity="0.9"
            />
          </motion.g>
        ))}
        <line x1="0" y1="0" x2="1200" y2="0" stroke="#92400e" strokeWidth="4" />
      </svg>
    </div>

    {/* Sheep */}
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="absolute bottom-8 right-8 md:right-16"
    >
      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <svg width="80" height="70" viewBox="0 0 80 70" className="md:w-28 md:h-24">
          {/* Body - fluffy wool */}
          <ellipse cx="40" cy="40" rx="28" ry="22" fill="#f5f5f4" />
          <circle cx="25" cy="35" r="10" fill="#fafaf9" />
          <circle cx="55" cy="35" r="10" fill="#fafaf9" />
          <circle cx="40" cy="28" r="10" fill="#fafaf9" />
          <circle cx="32" cy="48" r="8" fill="#fafaf9" />
          <circle cx="48" cy="48" r="8" fill="#fafaf9" />
          {/* Head */}
          <ellipse cx="65" cy="35" rx="12" ry="10" fill="#1c1917" />
          {/* Ears */}
          <ellipse cx="60" cy="28" rx="5" ry="3" fill="#1c1917" transform="rotate(-30 60 28)" />
          <ellipse cx="70" cy="28" rx="5" ry="3" fill="#1c1917" transform="rotate(30 70 28)" />
          {/* Eyes */}
          <circle cx="62" cy="33" r="2" fill="white" />
          <circle cx="68" cy="33" r="2" fill="white" />
          <circle cx="62" cy="33" r="1" fill="#1c1917" />
          <circle cx="68" cy="33" r="1" fill="#1c1917" />
          {/* Legs */}
          <rect x="28" y="55" width="4" height="12" rx="2" fill="#1c1917" />
          <rect x="38" y="55" width="4" height="12" rx="2" fill="#1c1917" />
          <rect x="48" y="55" width="4" height="12" rx="2" fill="#1c1917" />
        </svg>
      </motion.div>
    </motion.div>

    {/* Banner */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring" }}
      className="absolute top-20 md:top-28 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-800/95 to-amber-600/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">🐑 عيد أضحى مبارك 🐑</p>
    </motion.div>
  </>
);

// اليوم الوطني - علم مصر
const NationalDayDecorations = () => (
  <>
    {/* Egyptian flags */}
    {[0, 1].map((side) => (
      <motion.div
        key={side}
        initial={{ rotate: side === 0 ? -45 : 45, opacity: 0 }}
        animate={{ rotate: side === 0 ? -15 : 15, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className={`absolute top-4 ${side === 0 ? 'left-4 md:left-8' : 'right-4 md:right-8'}`}
        style={{ transformOrigin: side === 0 ? 'bottom left' : 'bottom right' }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" className="md:w-20 md:h-28">
          {/* Pole */}
          <rect x="0" y="0" width="4" height="80" fill="#92400e" />
          <circle cx="2" cy="2" r="4" fill="#fbbf24" />
          {/* Flag */}
          <motion.g animate={{ skewX: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 2 }}>
            <rect x="4" y="5" width="55" height="12" fill="#ce1126" />
            <rect x="4" y="17" width="55" height="12" fill="#ffffff" />
            <rect x="4" y="29" width="55" height="12" fill="#000000" />
            {/* Eagle */}
            <text x="31" y="26" textAnchor="middle" fill="#c09300" fontSize="14">🦅</text>
          </motion.g>
        </svg>
      </motion.div>
    ))}

    {/* Pyramids silhouette at bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 opacity-20">
      <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice">
        <polygon points="0,100 80,20 160,100" fill="currentColor" />
        <polygon points="100,100 200,10 300,100" fill="currentColor" />
        <polygon points="240,100 320,30 400,100" fill="currentColor" />
      </svg>
    </div>

    {/* Banner */}
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-700/95 via-white/95 to-black/95 text-black px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl border-2 border-amber-500"
    >
      <p className="text-xl md:text-3xl font-bold text-center">🇪🇬 تحيا مصر 🇪🇬</p>
    </motion.div>
  </>
);

// عيد الأم - ورود وقلوب
const MothersDayDecorations = () => (
  <>
    {/* Floating hearts and flowers */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: "100vh", opacity: 0 }}
        animate={{ 
          y: "-10vh",
          opacity: [0, 1, 1, 0],
          x: [0, Math.sin(i) * 30, 0]
        }}
        transition={{ 
          duration: 8 + Math.random() * 4,
          delay: i * 0.5,
          repeat: Infinity
        }}
        className="absolute text-2xl md:text-4xl"
        style={{ left: `${5 + i * 6}%` }}
      >
        {i % 3 === 0 ? "💐" : i % 3 === 1 ? "🌸" : "💝"}
      </motion.div>
    ))}

    {/* Rose border */}
    <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 md:gap-4 py-2">
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="text-2xl md:text-3xl"
        >
          🌹
        </motion.span>
      ))}
    </div>

    {/* Banner */}
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, type: "spring" }}
      className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500/95 to-rose-400/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">💐 كل سنة وأنتِ طيبة يا أمي 💐</p>
    </motion.div>
  </>
);

// عيد الحب - قلوب
const ValentinesDecorations = () => (
  <>
    {/* Falling hearts */}
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: "100vh",
          opacity: [0, 1, 1, 0],
          rotate: [0, 360],
          scale: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 5 + Math.random() * 5,
          delay: Math.random() * 3,
          repeat: Infinity
        }}
        className="absolute"
        style={{ left: `${Math.random() * 100}%` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" className="md:w-8 md:h-8">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={["#ef4444", "#f43f5e", "#ec4899", "#db2777"][Math.floor(Math.random() * 4)]}
          />
        </svg>
      </motion.div>
    ))}

    {/* Banner */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="absolute top-20 md:top-28 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500/95 to-pink-500/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-full shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">❤️ عيد حب سعيد ❤️</p>
    </motion.div>
  </>
);

// شم النسيم - فراشات وزهور وبيض ملون
const ShamNessimDecorations = () => (
  <>
    {/* Butterflies */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{ 
          duration: 8 + i,
          repeat: Infinity,
          delay: i * 0.5
        }}
        className="absolute"
        style={{
          top: `${20 + Math.random() * 40}%`,
          left: `${10 + Math.random() * 80}%`,
        }}
      >
        <motion.span
          animate={{ rotateY: [0, 180, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-2xl md:text-4xl inline-block"
        >
          🦋
        </motion.span>
      </motion.div>
    ))}

    {/* Flowers at bottom */}
    <div className="absolute bottom-0 left-0 right-0 flex justify-around">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="text-2xl md:text-4xl"
        >
          {["🌷", "🌻", "🌼", "🌸", "💐", "🌺"][i % 6]}
        </motion.div>
      ))}
    </div>

    {/* Colored eggs */}
    <div className="absolute top-4 left-0 right-0 flex justify-center gap-3 md:gap-6">
      {["🥚", "🥚", "🥚", "🥚", "🥚"].map((egg, i) => (
        <motion.div
          key={i}
          initial={{ y: -30, rotate: 0 }}
          animate={{ y: 0, rotate: [0, 10, -10, 0] }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          className="text-2xl md:text-4xl"
          style={{ filter: `hue-rotate(${i * 60}deg)` }}
        >
          {egg}
        </motion.div>
      ))}
    </div>

    {/* Banner */}
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500/95 to-yellow-400/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">🌸 شم نسيم سعيد 🌸</p>
    </motion.div>
  </>
);

// العودة للمدارس - أدوات مدرسية
const BackToSchoolDecorations = () => (
  <>
    {/* School supplies floating */}
    {["📚", "✏️", "📐", "🎒", "📖", "🖍️", "📏", "✂️"].map((item, i) => (
      <motion.div
        key={i}
        initial={{ y: -50, opacity: 0, rotate: -30 }}
        animate={{ 
          y: [0, -20, 0],
          opacity: 1,
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 3, delay: i * 0.2 },
          opacity: { delay: i * 0.1 },
          rotate: { repeat: Infinity, duration: 4 }
        }}
        className="absolute text-2xl md:text-4xl"
        style={{
          top: `${15 + (i % 3) * 15}%`,
          left: `${5 + i * 12}%`,
        }}
      >
        {item}
      </motion.div>
    ))}

    {/* Chalkboard effect at top */}
    <div className="absolute top-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-b from-green-900/80 to-transparent" />

    {/* Banner */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
      className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/95 to-orange-500/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">📚 عام دراسي سعيد 📚</p>
    </motion.div>
  </>
);

// موسم الشتاء - ثلج
const WinterDecorations = () => (
  <>
    {/* Snowflakes */}
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: "100vh",
          opacity: [0, 1, 1, 0],
          x: [0, Math.sin(i) * 50, 0],
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 8 + Math.random() * 7,
          delay: Math.random() * 5,
          repeat: Infinity
        }}
        className="absolute text-white"
        style={{ 
          left: `${Math.random() * 100}%`,
          fontSize: `${12 + Math.random() * 16}px`
        }}
      >
        ❄️
      </motion.div>
    ))}

    {/* Holly decorations */}
    <div className="absolute top-0 left-0 right-0 flex justify-around py-2">
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="text-2xl md:text-3xl"
        >
          🎄
        </motion.span>
      ))}
    </div>

    {/* Banner */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
      className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600/95 to-green-600/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">❄️ موسم شتاء دافئ ❄️</p>
    </motion.div>
  </>
);

// تخفيضات الصيف - شمس وأمواج
const SummerSaleDecorations = () => (
  <>
    {/* Sun */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      className="absolute top-4 right-4 md:top-8 md:right-8"
    >
      <span className="text-5xl md:text-7xl">☀️</span>
    </motion.div>

    {/* Beach elements */}
    {["🏖️", "🌴", "🍦", "🩴", "🕶️", "🏄"].map((item, i) => (
      <motion.div
        key={i}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.15 }}
        className="absolute bottom-4 text-2xl md:text-4xl"
        style={{ left: `${10 + i * 15}%` }}
      >
        {item}
      </motion.div>
    ))}

    {/* Wave at bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12 overflow-hidden">
      <motion.div
        animate={{ x: [-100, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="w-[200%] h-full"
      >
        <svg width="100%" height="100%" viewBox="0 0 1200 50" preserveAspectRatio="none">
          <path
            d="M0 25 Q150 0 300 25 T600 25 T900 25 T1200 25 L1200 50 L0 50 Z"
            fill="#0ea5e9"
            opacity="0.5"
          />
        </svg>
      </motion.div>
    </div>

    {/* Sale banner */}
    <motion.div
      initial={{ rotate: -5, scale: 0 }}
      animate={{ rotate: -5, scale: 1 }}
      transition={{ type: "spring" }}
      className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500/95 to-cyan-500/95 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl shadow-2xl"
    >
      <p className="text-xl md:text-3xl font-bold text-center">🌴 تخفيضات الصيف 🌊</p>
    </motion.div>
  </>
);

// الجمعة السوداء - عروض
const BlackFridayDecorations = () => (
  <>
    {/* Flying discount tags */}
    {["-50%", "-70%", "-30%", "-60%", "-40%", "-80%"].map((discount, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          delay: i * 0.2,
          scale: { repeat: Infinity, duration: 2 },
          rotate: { repeat: Infinity, duration: 3 }
        }}
        className="absolute bg-amber-500 text-black font-bold px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-lg text-sm md:text-xl"
        style={{
          top: `${15 + (i % 3) * 20}%`,
          left: `${5 + i * 15}%`,
          transform: `rotate(${-15 + i * 5}deg)`
        }}
      >
        {discount}
      </motion.div>
    ))}

    {/* Lightning bolts */}
    {[...Array(5)].map((_, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 0.5,
          delay: i * 0.3,
          repeatDelay: 2
        }}
        className="absolute text-3xl md:text-5xl text-amber-400"
        style={{
          top: `${20 + Math.random() * 40}%`,
          left: `${10 + Math.random() * 80}%`,
        }}
      >
        ⚡
      </motion.span>
    ))}

    {/* Main banner */}
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 bg-black text-amber-400 px-6 md:px-12 py-4 md:py-6 rounded-2xl shadow-2xl border-4 border-amber-500"
    >
      <motion.p
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-2xl md:text-4xl font-black text-center"
      >
        ⚡ BLACK FRIDAY ⚡
      </motion.p>
      <p className="text-lg md:text-2xl text-center mt-2">خصومات تصل إلى 80%</p>
    </motion.div>
  </>
);

export default ThemeDecorations;
