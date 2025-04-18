import { Link } from "react-router-dom";
import { Github, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="text-primary-600 font-bold text-xl">
              AudioRetrival
            </Link>
          </div>

          <div className="mt-4 md:mt-0">
            <p className="text-center md:text-left text-sm text-gray-500"></p>
          </div>

          {/* <div className="mt-4 flex justify-center md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-700 mx-2">
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 mx-2">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 mx-2">
              <Instagram size={20} />
            </a>
          </div> */}
        </div>

        <div className="mt-8 md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link
              to="/search"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Browse
            </Link>
            <Link
              to="/upload"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Upload
            </Link>
            {/* <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Terms of Service
            </a> */}
          </div>

          <p className="mt-8 text-sm text-gray-500 md:mt-0">
            &copy; {new Date().getFullYear()} AudioRetrival. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
