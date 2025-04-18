import { Search, Upload, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center mr-2 
                group-hover:bg-primary-700 transition-colors">
                <Music size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-primary-600 font-bold text-xl leading-tight group-hover:text-primary-700">
                  AudioRetrival
                </span>
                <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                  Share your sound
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Search */}
          <div className="hidden sm:flex items-center flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search audios..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  shadow-sm transition-shadow duration-200 hover:shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </form>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center">
            <Link
              to="/search"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Browse
            </Link>
            <Link
              to="/upload"
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 flex items-center
              transition-colors duration-200 shadow-sm"
            >
              <Upload size={16} className="mr-2" />
              Upload
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-primary-600 focus:outline-none transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white pb-3 px-4 animate-fade-in">
          <form onSubmit={handleSearch} className="pt-2 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search audios..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </form>
          <div className="flex flex-col space-y-2">
            <Link
              to="/search"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              Browse
            </Link>
            <Link
              to="/upload"
              onClick={() => setIsMenuOpen(false)}
              className="px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 flex items-center justify-center
              transition-colors duration-200 shadow-sm"
            >
              <Upload size={16} className="mr-2" />
              Upload
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;