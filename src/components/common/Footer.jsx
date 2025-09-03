import { Link } from "react-router-dom";
import { footerContact, footerItem, socialIcons } from "../data/Data";
import Newsletter from "../home/Newsletter";

export default function Footer() {
  return (
    <div className="bg-light border-t border-bordercolor text-primary py-10 px-4 sm:px-6 lg:px-8">
      <Newsletter />
      <div className="max-w-7xl mx-auto pt-5">
        <div className="grid grid-cols-1 py-16 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-primary rounded p-6 shadow-lg">
              <Link to="/">
                <h1 className="text-white text-2xl font-bold uppercase mb-3">
                  NaumApartments
                </h1>
              </Link>
              <p className="text-white text-sm leading-relaxed">
                Experience comfort and warmth with NaumApartments, your perfect home away from home. Discover serene rooms and exceptional service for an unforgettable stay.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h6 className="text-xl font-bold text-primary uppercase mb-4">
              Connect With Us
            </h6>
            {footerContact.map((val, index) => (
              <p className="mb-2 flex items-center" key={index}>
                <span className="mr-2 text-primary">{val.icon}</span>
                <span className="text-primary">{val.name}</span>
              </p>
            ))}
            <div className="flex space-x-2 pt-2">
              {socialIcons.slice(0, 4).map((val, index) => (
                <a
                  key={index}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300"
                  href="#"
                >
                  {val.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {footerItem.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h6 className="text-xl font-bold text-primary uppercase mb-4">
                    {section.header}
                  </h6>
                  <ul className="space-y-2">
                    {section.UnitItem.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link
                          to="#"
                          className="text-primary hover:text-primary transition-colors duration-300"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
