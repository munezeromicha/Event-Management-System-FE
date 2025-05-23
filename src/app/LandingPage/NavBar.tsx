"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/images/RNIT_Logo.png';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-20 w-20 bg-gradient-to-tr from-rnit-blue to-rnit-light-blue  flex items-center justify-center">
            <Image src={logo} alt="RNIT Logo" width={100} height={100} />
          </div>
          <span className="font-bold text-xl text-[#232560]">Rwanda National <span className="text-[#232560]">Investment Trust Ltd</span></span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-rnit-blue font-medium">Home</Link>
          <Link href="/events" className="text-gray-700 hover:text-rnit-blue font-medium">Events</Link>
        </nav>



        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link href="/" className="text-gray-700 hover:text-rnit-blue font-medium py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/events" className="text-gray-700 hover:text-rnit-blue font-medium py-2" onClick={() => setIsMenuOpen(false)}>Events</Link>
            <Link href="/about" className="text-gray-700 hover:text-rnit-blue font-medium py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-rnit-blue font-medium py-2" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" className="text-rnit-blue border-rnit-blue hover:bg-rnit-blue hover:text-white w-full">
                Sign In
              </Button>
              <Button className="bg-rnit-blue hover:bg-rnit-light-blue text-white w-full">
                Register
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;