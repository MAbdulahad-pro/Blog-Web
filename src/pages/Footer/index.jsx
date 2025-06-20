import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white p-6 mt-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

                <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-400">
                        Welcome to our blog, your go-to source for insightful articles, tips, and tutorials designed to help you grow your skills and stay updated with the latest trends in web development and design.                  </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
                    <ul className="space-y-1">
                        <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
                        <li><a href="#" className="text-gray-300 hover:text-white">About</a></li>
                        <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Contact</h3>
                    <p className="text-gray-400">Email: info@example.com</p>
                    <p className="text-gray-400">Phone: +92-300-1234567</p>
                </div>
            </div>

            <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-500 text-sm">
                © 2025 Ayan Ali. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
