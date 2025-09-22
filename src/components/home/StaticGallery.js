import { useMemo, useState, useEffect, useCallback, useRef } from "react";

export default function StaticGallery() {
  const items = useMemo(() => [
    // Beach
    { id: 1,  url: "/assets/img/beach1.webp",          title: "Beach",                 category: "Beach" },
    // Pool
    { id: 2,  url: "/assets/img/pool1.webp",           title: "Pool",                  category: "Pool" },
    { id: 3,  url: "/assets/img/pool2.avif",           title: "Pool (Evening)",        category: "Pool" },
    // Restaurant
    { id: 4,  url: "/assets/img/restaurant1.webp",     title: "Restaurant",            category: "Restaurant" },
    { id: 5,  url: "/assets/img/restaurant2.avif",     title: "Restaurant",            category: "Restaurant" },
    { id: 6,  url: "/assets/img/restaurant3.avif",     title: "Restaurant",            category: "Restaurant" },
    // Rooms - set 1
    { id: 7,  url: "/assets/img/room/photo1.avif",     title: "Standard Single",       category: "Rooms" },
    { id: 8,  url: "/assets/img/room/photo2.avif",     title: "Standard Single",       category: "Rooms" },
    { id: 9,  url: "/assets/img/room/photo3.avif",     title: "Standard Single",       category: "Rooms" },
    // Rooms - set 2
    { id: 10, url: "/assets/img/room (2)/photo1.webp", title: "Deluxe Double",         category: "Rooms" },
    { id: 11, url: "/assets/img/room (2)/photo2.jpeg", title: "Deluxe Double",         category: "Rooms" },
    { id: 12, url: "/assets/img/room (2)/photo3.webp", title: "Deluxe Double",         category: "Rooms" },
    // Rooms - set 3
    { id: 13, url: "/assets/img/room (3)/photo1.avif", title: "Family Suite",          category: "Rooms" },
    { id: 14, url: "/assets/img/room (3)/photo2.avif", title: "Family Suite",          category: "Rooms" },
    { id: 15, url: "/assets/img/room (3)/photo3.webp", title: "Family Suite",          category: "Rooms" },
    // Rooms - set 4
    { id: 16, url: "/assets/img/room (4)/photo1.avif", title: "Presidential Penthouse", category: "Rooms" },
    { id: 17, url: "/assets/img/room (4)/photo2.avif", title: "Presidential Penthouse", category: "Rooms" },
    { id: 18, url: "/assets/img/room (4)/photo3.avif", title: "Presidential Penthouse", category: "Rooms" },
    // Rooms - set 5
    { id: 19, url: "/assets/img/room (5)/photo1.avif", title: "Executive Suite",        category: "Rooms" },
    { id: 20, url: "/assets/img/room (5)/photo2.avif", title: "Executive Suite",        category: "Rooms" },
    { id: 21, url: "/assets/img/room (5)/photo3.avif", title: "Executive Suite",        category: "Rooms" }
  ], []);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const slideCount = items.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? slideCount - 1 : i - 1));
  }, [slideCount]);

  const goNext = useCallback(() => {
    setIndex((i) => (i === slideCount - 1 ? 0 : i + 1));
  }, [slideCount]);

  // Autoplay
  useEffect(() => {
    if (paused || slideCount === 0) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i === slideCount - 1 ? 0 : i + 1));
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [paused, slideCount]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  return (
    <div className="py-16 bg-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Gallery</h2>

        {/* Carousel */}
        <div
          className="relative w-full h-80 md:h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-black"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <img
            key={items[index].id}
            src={items[index].url}
            alt={items[index].title}
            className="w-full h-full object-cover"
          />

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 md:p-6">
            <div className="text-white/90 text-sm uppercase tracking-wide">{items[index].category}</div>
            <h3 className="text-white text-2xl md:text-3xl font-semibold drop-shadow">{items[index].title}</h3>
          </div>

          {/* Controls */}
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
