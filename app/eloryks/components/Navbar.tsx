import { IoCarSport } from "react-icons/io5";
import Link from "next/link";

const Navbar = () => {
  return (
    <header>
      <nav>
        <div className="Navbar">
          <Link href="/">
            <IoCarSport className="icon-car" />
          </Link>
          <h1 className="Navbar-title">Eloryks</h1>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
