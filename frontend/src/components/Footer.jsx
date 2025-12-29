import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
              90PlusStore
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              Your premier destination for best quality football merchandise and
              collectibles.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">
              Company Info
            </h4>
            <ul className="text-gray-400 space-y-2 text-xs sm:text-sm">
              <li>Founder: Apurba Maji</li>
              <li>Established: 2026</li>
              <li>Company Origin: India</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="text-gray-400 space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Query
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">
              Contact
            </h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-2 break-words">
              Email: 90plusstore0@gmail.com
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Phone: +91 1234567890
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; 2026 90PlusStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
