import React, { useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';

export default function Hero() {
  const sliderRef = useRef(null);

  const next = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const previous = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // Hide default react-slick arrows
  };
  return (

  <section className="relative h-[40rem] mb-16 flex items-center justify-center bg-gradient-to-r from-primary/70 to-primary/50">
    <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/img/commonHeadingBG.jpg')",
        }}
    />
    <div className="absolute inset-0 bg-primary/60" />

    <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
      <h1 className="text-5xl md:text-7xl font-bold mb-6">
        <span className="inline-block animate-slideInLeft">Experience</span>{" "}
        <span className="inline-block animate-slideInRight">Luxury</span>
      </h1>
      <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fadeIn">
        Indulge in unparalleled comfort and elegance at Naum Apartments
      </p>
      <div className={'transform hover:scale-105 transition duration-300 animate-fadeIn'}>
        <Link to="/rooms" className="bg-secondary text-white py-2 px-4 md:py-3 md:px-5 rounded-md hover:bg-sbackground transition duration-300 hover:text-primary ">
Discover Our Rooms 
        </Link>
      </div>

    </div>
  </section>
  );
}
