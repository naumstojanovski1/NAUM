import React from "react";
import CommonHeading from "../common/CommonHeading";
import { services } from "../data/Data";

export default function Services() {
  return (
    <div className="container mx-auto py-12 px-4 bg-light">
      <div className="text-center mb-10">
        <CommonHeading
          heading="Our Exceptional Services"
          title="Your Comfort is Our Priority"
          subtitle="Experience"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {services.map((item, index) => (
          <div key={index} >
            <a
              className="block p-6 rounded-lg shadow-md hover:shadow-xl  text-center bg-white border-t-4 border-primary transform hover:scale-105  transition duration-300"
              href="#"
            >
              <div className="flex items-center justify-center w-20 h-20 bg-transparent border-2 border-primary rounded-full mx-auto mb-4">
                <div className="flex items-center justify-center w-full h-full border border-primary rounded-full text-primary text-3xl">
                  {item.icon}
                </div>
              </div>
              <h5 className="text-xl font-semibold mb-3 text-primary">
                {item.name}
              </h5>
              <p className="text-gray-600 text-base mb-0 leading-relaxed">
                {item.discription === "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo magna dolore erat amet" ? "Indulge in tailored services designed to enhance your stay, from gourmet dining to rejuvenating spa treatments. We ensure every detail contributes to your ultimate comfort." : item.discription}
              </p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
