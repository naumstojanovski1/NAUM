import React from "react";
import { Link } from "react-router-dom";

export default function Heading({ heading, title, subtitle }) {
  return (
      <div
        className="relative h-64 md:h-80 mb-5 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/img/commonHeadingBG.jpg')" }}
      >
        <div className="absolute inset-0 bg-dark-opacity-50"></div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-white mb-3 text-4xl md:text-5xl font-bold animate-slideInDown">
            {heading}
          </h1>
          <nav aria-label="breadcrumb">
            <ol className="flex justify-center uppercase text-white space-x-2">
              <li className="breadcrumb-item">
                <Link to="/" className="hover:text-secondary">
                  {title}
                </Link>
              </li>
              <li className="breadcrumb-item text-white active" aria-current="page">
                / {subtitle}
              </li>
            </ol>
          </nav>
        </div>
      </div>
  );
}
