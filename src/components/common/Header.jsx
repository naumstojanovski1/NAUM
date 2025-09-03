import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { navList } from "../data/Data";

export default function Header() {
  const [navbarCollapse, setNavbarCollapse] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleMouseEnter = (itemId) => {
    setActiveDropdown(itemId);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
      <header className="sticky top-0 z-50 w-full bg-light shadow-lg border-b border-bordercolor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0 transform hover:scale-105 transition duration-300">
              <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
                  aria-label="Go to home"
                  className="text-primary text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide transition duration-300"
              >
                NaumApartments
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:block">
              <nav className="flex space-x-6">
                {navList.map((item, index) => (
                    <div key={index} className="relative group">
                      {item.subItems ? (
                          <div
                              onMouseEnter={() => handleMouseEnter(item.id)}
                              onMouseLeave={handleMouseLeave}
                          >
                            <NavLink
                                to="#"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-lg font-medium transition duration-300 ${isActive ? "text-primary underline underline-offset-4" : "text-secondary hover:text-primary"}`
                                }
                            >
                              {item.text}
                            </NavLink>
                            <div
                                className={`absolute left-0 mt-2 w-48 rounded-md shadow-xl bg-white border border-bordercolor focus:outline-none transform transition duration-300 group-hover:block ${activeDropdown === item.id ? "block" : "hidden"}`}
                            >
                              <div className="py-1">
                                {item.subItems.map((sub, subIndex) => (
                                    <NavLink
                                        key={subIndex}
                                        to={sub.path}
                                        className={({ isActive }) =>
                                            `block px-4 py-2 text-base transition duration-300 ${isActive ? "text-primary underline underline-offset-4" : "text-secondary hover:bg-primary hover:text-white"}`
                                        }
                                    >
                                      {sub.text}
                                    </NavLink>
                                ))}
                              </div>
                            </div>
                          </div>
                      ) : (
                          <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                  `px-3 py-2 rounded-md text-lg font-medium transition duration-300 ${isActive ? "text-primary underline underline-offset-4" : "text-secondary hover:text-primary"}`
                              }
                          >
                            {item.text}
                          </NavLink>
                      )}
                    </div>
                ))}
              </nav>
            </div>

            {/* Mobile button */}
            <div className="flex md:hidden">
              <button
                  onClick={() => setNavbarCollapse(!navbarCollapse)}
                  type="button"
                  className="inline-flex items-center bg-primary justify-center p-2 rounded-md text-light hover:text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition duration-300"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!navbarCollapse ? (
                    <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                ) : (
                    <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div
            className={`${navbarCollapse ? "block" : "hidden"} md:hidden bg-light border-t border-bordercolor pb-4`}
            id="mobile-menu"
        >
          <div className="px-4 pt-3 space-y-2">
            {navList.map((item, index) => (
                <div key={index}>
                  {item.subItems ? (
                      <div className="group relative">
                        <NavLink
                            to="#"
                            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                            className={({ isActive }) =>
                                `block px-3 py-3 rounded-md text-base font-medium transition duration-300 ${isActive ? "text-primary underline underline-offset-4" : "text-secondary hover:text-primary"}`
                            }
                        >
                          {item.text}
                        </NavLink>
                        <div
                            className={`pl-6 mt-1 space-y-1 ${
                                activeDropdown === item.id ? "block" : "hidden"
                            }`}
                        >
                          {item.subItems.map((sub, subIndex) => (
                              <NavLink
                                  key={subIndex}
                                  to={sub.path}
                                  onClick={() => setNavbarCollapse(false)}
                                  className={({ isActive }) =>
                                      `block px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${isActive ? "text-primary underline underline-offset-4" : "text-secondary hover:text-primary"}`
                                  }
                              >
                                {sub.text}
                              </NavLink>
                          ))}
                        </div>
                      </div>
                  ) : (
                      <NavLink
                          to={item.path}
                          onClick={() => setNavbarCollapse(false)}
                          className={({ isActive }) =>
                              `block px-3 py-3 rounded-md text-base font-medium transition duration-300 ${isActive ? "text-primary underline underline-offset-4" : "text-secondary hover:text-primary"}`
                          }
                      >
                        {item.text}
                      </NavLink>
                  )}
                </div>
            ))}
          </div>
        </div>
      </header>
  );
}
