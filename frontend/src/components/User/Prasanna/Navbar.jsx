import SearchIcon from "@mui/icons-material/Search";

function Navbar() {
  return (
    <div>
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-500 rounded-md"></div>
          <span className="text-2xl font-bold">Courshell</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-purple-900">
            Courses
          </a>
          <a href="#" className="text-gray-600 hover:text-purple-900">
            Categories
          </a>
          <a href="#" className="text-gray-600 hover:text-purple-900">
            How it works
          </a>
          <a href="#" className="text-gray-600 hover:text-purple-900">
            About
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <SearchIcon className="text-gray-400" />
          <button className="bg-violet-700 text-white px-6 py-3 rounded-[16px] hover:bg-violet-900 transition duration-300">
            Join our course
          </button>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
