import React from "react";
import { about } from "../data/Data";
import { Link } from "react-router-dom";
import StaticGallery from "./StaticGallery";
import CommonHeading from "../common/CommonHeading";
export default function About() {
  return (
    <div className="container mx-auto py-12 px-4 bg-light">
      <div className="mb-12">
        {/*<h6 className="text-primary text-lg font-bold uppercase mb-2 text-center">*/}
        {/*  Unrivaled Comfort*/}
        {/*</h6>*/}
        {/*<h1 className="text-4xl font-bold text-secondary mb-4 text-center">*/}
        {/*  What NaumApartments Offers*/}
        {/*</h1>*/}
        <CommonHeading heading={'Unrivaled Comfort\n'} subtitle={' What NaumApartments Offers?'}/>
        <p className="max-w-3xl mx-auto text-gray-600 mb-8 text-center leading-relaxed">
          At NaumApartments, we pride ourselves on providing an exceptional experience. From luxurious rooms to top-tier amenities, discover what makes your stay truly special.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8 ">
          {about.map((item, key) => (
            <div key={key} className="border border-bordercolor rounded p-4 shadow-sm text-center bg-white transform hover:scale-105 transition duration-300">
              {item.icon}
              <h2 className="mb-1 text-xl font-bold text-primary mt-2">{item.count}</h2>
              <p className="mb-0 text-gray-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/rooms"
            className="inline-block bg-primary text-light py-3 px-8 rounded-md hover:bg-secondary transition duration-300 transform hover:scale-105 text-lg font-semibold"
          >
            Discover Our Amenities
          </Link>
        </div>
        <StaticGallery />
      </div>
    
      

    </div>
  );
}
