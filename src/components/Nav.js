import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import M from "materialize-css";

const Navbar = () => {
  useEffect(() => {
    document.addEventListener("DOMContentLoaded", function () {
      let elems = document.querySelectorAll(".sidenav");
      M.Sidenav.init(elems);
    });
  }, []);

  return (
    <>
      <nav className="nav-extended">
        <div className="nav-wrapper">
          <Link to="#" className="brand-logo" style={{ marginLeft: "10px" }}>
            Meeting
          </Link>
          <Link to="#" data-target="mobile-demo" className="sidenav-trigger">
            <i className="fa fa-bars" aria-hidden="true" />
          </Link>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            {/* Additional nav items can be added here */}
          </ul>
        </div>
      </nav>

      <ul className="sidenav" id="mobile-demo">
        {/* Additional sidenav items can be added here */}
      </ul>
    </>
  );
};

export default Navbar;
