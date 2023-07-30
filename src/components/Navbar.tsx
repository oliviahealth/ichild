import React from "react";
import { Link } from "react-router-dom";

import useAppStore from "../stores/useAppStore";
import TAMUIChildLogo from "../assets/logos/TAMU-ichild_logo.png";

const Navbar: React.FC = () => {
  const session = useAppStore((state) => state.session);

  return (
    <div className="navbar xl:container xl:px-2 mx-auto px-5">
      <div className="navbar-start w-full flex justify-between ">
        <Link to="/">
          <img src={TAMUIChildLogo} alt="Texas A&M University Logo" className="btn btn-ghost normal-case object-contain transform scale-150 hover:bg-transparent hover:text-current" />
        </Link>
        <div className="dropdown dropdown-end opacity-100 z-10" >
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-32">
            <li><Link to="/auth">{session ? "Sign Out" : "Sign In"}</Link></li>
          </ul>
        </div>
      </div>
      <div className="navbar-end hidden lg:flex">
        <ul className="menu menu-horizontal">
          <li><Link to="/auth">{session ? "Sign Out" : "Sign In"}</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
