import { useState, useEffect } from "react";

export default function StaticGallery() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 👇 Static images reused from your About section
    const images = [
        {
            _id: 1,
            category: "facilities",
            imageUrl: "/assets/img/about-1.jpg",
            title: "Hotel Lobby",
        },
        {
            _id: 2,
            category: "rooms",
            imageUrl: "/assets/img/about-2.jpg",
            title: "Luxury Room",
        },
        {
            _id: 3,
            category: "facilities",
            imageUrl: "/assets/img/about-3.jpg",
            title: "Hotel Restaurant",
        },
        {
            _id: 4,
            category: "surroundings",
            imageUrl: "/assets/img/about-4.jpg",
            title: "Outdoor Pool",
        },
    ];

    // Auto-slide functionality
    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [images]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    return (
        <div className="py-16 bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="relative max-w-6xl mx-auto">
                    {/* Main Slider */}
                    <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                        <div
                            className="flex transition-transform duration-500 ease-in-out h-full"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {images.map((image) => (
                                <div
                                    key={image._id}
                                    className="w-full h-full flex-shrink-0 relative"
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={image.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                        <div className="p-8 text-white">
                                            <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                                            <p className="text-lg opacity-90 capitalize">
                                                {image.category}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center mt-6 space-x-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                    index === currentIndex
                                        ? "bg-blue-600 scale-125"
                                        : "bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {images.slice(0, 6).map((image, index) => (
                            <div
                                key={image._id}
                                onClick={() => goToSlide(index)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                                    index === currentIndex
                                        ? "ring-4 ring-primary/50 scale-105"
                                        : "hover:scale-105"
                                }`}
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={image.title}
                                    className="w-full h-20 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
