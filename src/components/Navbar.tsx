import React from "react";

import TamuBoxLogo from "../assets/logos/TAMU-Box-Logo.png";

const Navbar: React.FC = () => {
  return (
    <div className="navbar w-3/4 mx-auto p-4">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Parent</a>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div>
        <a href="www.tamu.edu" target="_blank" className="flex-1 flex items-center">
          <img src={TamuBoxLogo} className="btn btn-ghost normal-case object-contain transform scale-150 hover:bg-transparent hover:text-current" />

          <div>
            <p className="font-semibold text-sm">Texas A&M University</p>
            <p className="text-xl">IntelligentCHILD</p>
          </div>
        </a>
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
            <p>OliviaHealth</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
