import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";

import useAppStore from "../stores/useAppStore";

import TAMUIChildLogo from "../assets/logos/TAMU-ichild_logo.png";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const user = useAppStore((state) => state.user);
  const accessToken = useAppStore((state) => state.accessToken);

  const setUser = useAppStore(state => state.setUser);

  const { mutate: handleSignout } = useMutation(async () => {
    const headers = {
      "Authorization": "Bearer " + accessToken,
    }

    await axios.post(`${import.meta.env.VITE_API_URL}/signout`, null, { headers: { ...headers }, withCredentials: true })
  }, {
    onSettled: () => {
      sessionStorage.removeItem('accessToken');
      setUser(null);

      navigate('/signin');
    }
  })

  return (
    <div className="navbar xl:container xl:px-2 mx-auto px-5 text-black">
      <div className="navbar-start w-full flex justify-between ">

        { /* Make sure to use the <Link /> component provided by react-router to handle client side routing, or all app state will be reset */}
        <Link to="/">
          <img src={TAMUIChildLogo} alt="Texas A&M University Logo" className="btn btn-ghost normal-case object-contain transform scale-150 hover:bg-transparent hover:text-current" />
        </Link>

        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52 text-base" style={{display: "block !important"}}>
            {user ? (<li><span className="text-[length:inherit] outline-none hover:bg-[#E8DDDD] hover:!text-primary active:!text-primary hover:font-bold hover:underline active:!bg-[#D8CDCD] transition-all duration-100" onClick={() => handleSignout()}>Sign Out</span></li>) : <li><Link className="text-[length:inherit] outline-none hover:bg-[#E8DDDD] hover:!text-primary active:!text-primary hover:font-bold hover:underline active:!bg-[#D8CDCD] transition-all duration-100" to={'/signin'}>Sign In</Link></li>}
            <li><a className="text-[length:inherit] outline-none hover:bg-[#E8DDDD] hover:!text-primary active:!text-primary hover:font-bold hover:underline active:!bg-[#D8CDCD] transition-all duration-100" href="http://www.oliviahealth.org" target="_blank">OliviaHealth</a></li>
          </ul>
        </div>

      </div>
      <div className="navbar-end hidden lg:flex">
        <ul className="menu menu-horizontal text-base">
          {/* - Set menu item width explicitly to prevent bold font on hover from changing width
            * - Use justify-content instead of text-align because <a>/<span> seems to have display: grid; from Tailwind
            */}
            <li><a href="http://www.oliviahealth.org" target="_blank" className="w-[125px] justify-center outline-none hover:bg-[#E8DDDD] hover:!text-primary active:!text-primary hover:font-bold hover:underline active:!bg-[#D8CDCD] transition-all duration-100">OliviaHealth</a></li>
          {user ? (<li><span onClick={() => handleSignout()} className="w-[100px] justify-center outline-none hover:bg-[#E8DDDD] hover:!text-primary active:!text-primary hover:font-bold hover:underline active:!bg-[#D8CDCD] transition-all duration-100">Sign Out</span></li>) : <li><Link to={'/signin'} className="w-[85px] justify-center outline-none hover:bg-[#E8DDDD] hover:!text-primary active:!text-primary hover:font-bold hover:underline active:!bg-[#D8CDCD] transition-all duration-100">Sign In</Link></li>}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
