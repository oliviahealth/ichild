import React from "react";

import TAMUIChildLogo from "../assets/logos/TAMU-ichild_logo.png";

const Navbar: React.FC = () => {
  return (
    <div className="navbar container mx-auto px-6">
      <div className="navbar-start w-full flex justify-between">
        <a href="https://www.tamu.edu" target="_blank">
          <img src={TAMUIChildLogo} alt="Texas A&M University Logo" className="btn btn-ghost normal-case object-contain transform scale-150 hover:bg-transparent hover:text-current" />
        </a>
        <div className="dropdown dropdown-end opacity-100 z-10" >
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 shadow bg-white rounded-box">
            <li>
              <a>Login</a>
            </li>
            <li>
              <a>Resources</a>
            </li>
            <li>
              <a href="https://www.oliviahealth.org" target="_blank">OliviaHealth</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-end hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Login</a>
          </li>
          <li>
            <a>Resources</a>
          </li>
          <li>
            <a href="https://www.oliviahealth.org" target="_blank">OliviaHealth</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
