import React, { useState, useEffect } from "react";
// Typewriter effect hook
function useTypewriter(text, speed = 80) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/services";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = user?.isAdmin;

  // Cursor tracking state for hero section (with springy animation)
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [animated, setAnimated] = useState({ x: 0, y: 0 });
  const heroRef = React.useRef(null);

  // Spring animation for cursor tracking (more fluid)
  useEffect(() => {
    if (!cursor.visible) return;
    let frame;
    const animate = () => {
      setAnimated((prev) => {
        const dx = cursor.x - prev.x;
        const dy = cursor.y - prev.y;
        return {
          x: Math.abs(dx) < 0.5 ? cursor.x : prev.x + dx * 0.28,
          y: Math.abs(dy) < 0.5 ? cursor.y : prev.y + dy * 0.28,
        };
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [cursor.x, cursor.y, cursor.visible]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getFeaturedProducts();
        setFeaturedProducts(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Mouse event handlers for hero section
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };
  const [textHover, setTextHover] = useState(false);
  const handleMouseLeave = () => {
    setCursor((c) => ({ ...c, visible: false }));
  };
  const handleMouseEnter = () => {
    setCursor((c) => ({ ...c, visible: true }));
  };

  // Static hero line (no typewriter effect)
  const heroLine = "Welcome to 90PlusStore";

  return (
    <div>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-gray-100 py-10 sm:py-12 md:py-16 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-t from-blue-900 via-blue-800 to-transparent pointer-events-none"></div>

        {/* Stylish Responsive Cursor Tracking Glow */}
        {cursor.visible && (
          <>
            {/* Hide on mobile screens */}
            <div
              className="hidden sm:block pointer-events-none z-30"
              style={{
                left: `calc(${animated.x}px - 12vw)`,
                top: `calc(${animated.y}px - 12vw)`,
                width: "24vw",
                height: "24vw",
                minWidth: 120,
                minHeight: 120,
                maxWidth: 320,
                maxHeight: 320,
                borderRadius: "50%",
                position: "absolute",
                pointerEvents: "none",
                background:
                  "radial-gradient(circle, #bae6fd 0%, #60a5fa 60%, #38bdf8 100%)",
                filter: "blur(6vw)",
                opacity: 0.18,
                transition: "background 0.4s cubic-bezier(.4,0,.2,1)",
                mixBlendMode: "lighten",
                boxShadow:
                  "0 0 4vw 1vw #bae6fd66, 0 0 8vw 2vw #60a5fa66, 0 0 0 0.2vw #38bdf833",
                zIndex: 30,
              }}
            />
            <div
              className="hidden sm:block pointer-events-none z-30"
              style={{
                left: `calc(${animated.x}px - 5vw)`,
                top: `calc(${animated.y}px - 5vw)`,
                width: "10vw",
                height: "10vw",
                minWidth: 60,
                minHeight: 60,
                maxWidth: 160,
                maxHeight: 160,
                borderRadius: "50%",
                position: "absolute",
                pointerEvents: "none",
                background:
                  "radial-gradient(circle, #e0f2fe 0%, #bae6fd88 80%, transparent 100%)",
                filter: "blur(1.2vw)",
                opacity: 0.09,
                transition: "background 0.4s cubic-bezier(.4,0,.2,1)",
                mixBlendMode: "lighten",
                zIndex: 30,
              }}
            />
          </>
        )}
        {/* Moving Glowing Elements */}
        <div className="pointer-events-none">
          <div
            className="absolute top-4 left-1/5 w-72 h-72 rounded-full blur-[120px] opacity-80 animate-glow-move1 animate-gradient-bg1"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 120px 60px #1e3a8a88, 0 0 200px 80px #312e8188",
            }}
          />
          <div
            className="absolute bottom-8 right-1/6 w-96 h-96 rounded-full blur-[140px] opacity-70 animate-glow-move2 animate-gradient-bg2"
            style={{
              background: "linear-gradient(120deg, #2563eb 0%, #7c3aed 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 140px 70px #2563eb88, 0 0 220px 100px #7c3aed88",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-[110px] opacity-60 animate-glow-move3 animate-gradient-bg3"
            style={{
              background: "linear-gradient(120deg, #334155 0%, #6366f1 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 110px 55px #33415588, 0 0 180px 90px #6366f188",
            }}
          />
          <div
            className="absolute top-1/4 right-10 w-60 h-60 rounded-full blur-[100px] opacity-60 animate-glow-move4 animate-gradient-bg4"
            style={{
              background: "linear-gradient(120deg, #0ea5e9 0%, #312e81 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 100px 50px #0ea5e988, 0 0 160px 80px #312e8188",
            }}
          />
          {/* Extra moving glowing elements */}
          <div
            className="absolute bottom-1/3 left-10 w-52 h-52 rounded-full blur-[90px] opacity-60 animate-glow-move5 animate-gradient-bg5"
            style={{
              background: "linear-gradient(120deg, #0a2540 0%, #6366f1 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 90px 45px #0a254088, 0 0 120px 60px #6366f188",
            }}
          />
          <div
            className="absolute top-2/3 right-1/5 w-44 h-44 rounded-full blur-[80px] opacity-50 animate-glow-move6 animate-gradient-bg6"
            style={{
              background: "linear-gradient(120deg, #312e81 0%, #0ea5e9 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 80px 40px #312e8188, 0 0 100px 50px #0ea5e988",
            }}
          />
        </div>
        <style jsx global>{`
          @keyframes glow-move5 {
            0% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-60px) scale(1.15);
            }
            100% {
              transform: translateY(0) scale(1);
            }
          }
          .animate-glow-move5 {
            animation: glow-move5 13s ease-in-out infinite alternate;
          }
          @keyframes gradient-bg5 {
            0% {
              background-position: 0% 0%;
            }
            50% {
              background-position: 100% 100%;
            }
            100% {
              background-position: 0% 0%;
            }
          }
          .animate-gradient-bg5 {
            animation: gradient-bg5 9s ease-in-out infinite alternate;
          }
          @keyframes glow-move6 {
            0% {
              transform: translateX(0) scale(1);
            }
            50% {
              transform: translateX(70px) scale(1.2);
            }
            100% {
              transform: translateX(0) scale(1);
            }
          }
          .animate-glow-move6 {
            animation: glow-move6 11s ease-in-out infinite alternate;
          }
          @keyframes gradient-bg6 {
            0% {
              background-position: 100% 0%;
            }
            50% {
              background-position: 0% 100%;
            }
            100% {
              background-position: 100% 0%;
            }
          }
          .animate-gradient-bg6 {
            animation: gradient-bg6 7s ease-in-out infinite alternate;
          }
          @keyframes gradient-bg1 {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient-bg1 {
            animation: gradient-bg1 8s ease-in-out infinite alternate;
          }

          @keyframes gradient-bg2 {
            0% {
              background-position: 100% 0%;
            }
            50% {
              background-position: 0% 100%;
            }
            100% {
              background-position: 100% 0%;
            }
          }
          .animate-gradient-bg2 {
            animation: gradient-bg2 10s ease-in-out infinite alternate;
          }

          @keyframes gradient-bg3 {
            0% {
              background-position: 0% 100%;
            }
            50% {
              background-position: 100% 0%;
            }
            100% {
              background-position: 0% 100%;
            }
          }
          .animate-gradient-bg3 {
            animation: gradient-bg3 9s ease-in-out infinite alternate;
          }

          @keyframes gradient-bg4 {
            0% {
              background-position: 100% 100%;
            }
            50% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 100% 100%;
            }
          }
          .animate-gradient-bg4 {
            animation: gradient-bg4 11s ease-in-out infinite alternate;
          }
        `}</style>
        {/* Add these keyframes to your CSS (e.g., index.css or global styles) */}
        <style jsx global>{`
          @keyframes glow-move1 {
            0% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(120px) scale(1.18);
            }
            100% {
              transform: translateY(0) scale(1);
            }
          }
          .animate-glow-move1 {
            animation: glow-move1 4s cubic-bezier(0.4, 0, 0.2, 1) infinite
              alternate;
          }

          @keyframes glow-move2 {
            0% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-180px) scale(1.15);
            }
            100% {
              transform: translateY(0) scale(1);
            }
          }
          .animate-glow-move2 {
            animation: glow-move2 5s cubic-bezier(0.4, 0, 0.2, 1) infinite
              alternate;
          }

          @keyframes glow-move3 {
            0% {
              transform: translateX(0) scale(1);
            }
            50% {
              transform: translateX(-160px) scale(1.22);
            }
            100% {
              transform: translateX(0) scale(1);
            }
          }
          .animate-glow-move3 {
            animation: glow-move3 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite
              alternate;
          }

          @keyframes glow-move4 {
            0% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(90px, 90px) scale(1.15);
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }
          .animate-glow-move4 {
            animation: glow-move4 6s cubic-bezier(0.4, 0, 0.2, 1) infinite
              alternate;
          }
        `}</style>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 drop-shadow-lg tracking-tight transition-transform"
            style={{
              transform: textHover ? "scale(1.045)" : "scale(1)",
              transition: "transform 0.38s cubic-bezier(.22,1,.36,1)",
            }}
           
            onMouseEnter={() => setTextHover(true)}
            onMouseLeave={() => setTextHover(false)}
          >
            <span
              className="animated-gradient-text"
              style={{
                background:
                  "linear-gradient(270deg, #fbbf24, #38bdf8, #a78bfa, #f472b6, #fbbf24)",
                backgroundSize: "1200% 1200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textFillColor: "transparent",
                animation: "gradient-move 7s ease-in-out infinite",
                display: "inline-block",
              }}
            >
              {heroLine}
            </span>
            <style jsx global>{`
              @keyframes gradient-move {
                0% {
                  background-position: 0% 0%;
                }
                50% {
                  background-position: 100% 0%;
                }
                100% {
                  background-position: 0% 0%;
                }
              }
              .animated-gradient-text {
                background: linear-gradient(
                  270deg,
                  #fbbf24,
                  #22d3ee,
                  #f472b6,
                  #facc15,
                  #4ade80,
                  #f472b6,
                  #fbbf24
                );
                background-size: 1200% 1200%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                color: transparent;
                animation: gradient-move 72s cubic-bezier(0.77, 0, 0.18, 1)
                  infinite;
                display: inline-block;
              }
            `}</style>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 drop-shadow-md font-light max-w-2xl mx-auto text-white">
            Where matchday gear meets everyday wear
          </p>
          <a
            href="/products"
            className="bg-white text-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 text-base sm:text-lg shadow-xl shadow-blue-900/30"
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {isAdmin ? "View Products" : "Shop Now"}
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-md border border-red-100 p-8 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No featured products yet
              </h3>
              <p className="text-gray-500 mb-6">
                Check back soon for our top picks!
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Browse All Products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  hideAddToCart={true}
                  isFeatured={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
