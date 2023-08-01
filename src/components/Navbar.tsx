import React from "react";
import { Link } from "react-router-dom";

import TAMUIChildLogo from "../assets/logos/TAMU-ichild_logo.png";

const Navbar: React.FC = () => {
  return (
    <div className="navbar xl:container xl:px-2 mx-auto px-5">
      <div className="navbar-start w-full flex justify-between ">

        { /* Make sure to use the <Link /> component provided by react-router to handle client side routing, or all app state will be reset */}
        <Link to="/">
          <img src={TAMUIChildLogo} alt="Texas A&M University Logo" className="btn btn-ghost normal-case object-contain transform scale-150 hover:bg-transparent hover:text-current" />
        </Link>

        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52">
            <li><Link to={'/signin'}>Login</Link></li>
            <li><a>OliviaHealth</a></li>
          </ul>
        </div>

      </div>
      <div className="navbar-end hidden lg:flex">
        <ul className="menu menu-horizontal">
          <li><a>OliviaHealth</a></li>
          <li><Link to={'/signin'}>Login</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
