import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { BookOpen, Facebook, Instagram, Mail, Twitter } from "lucide-react";

export default function Component() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Subscription Form */}
        <div className="bg-violet-100 rounded-3xl p-8 mb-12 relative overflow-hidden">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Subscribe To The Page For More Information
            </h2>
            <div className="flex mt-6">
              <input
                type="email"
                placeholder="Mail"
                className="flex-grow px-4 py-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button className="bg-violet-700 text-white p-2 rounded-full">
                <Mail className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-violet-500 rounded-tl-full"></div>
        </div>

        {/* Teach Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center text-violet-800 text-3xl font-bold mb-4">
              <BookOpen className="mr-2" />
              Courshell
            </div>
            <p className="text-gray-600 max-w-md">
              Start an incredible UI/UX design course with us. You can learn the
              most requested digital skills.
            </p>
            <div className="flex mt-4 space-x-4">
              <Facebook className="text-gray-400" />
              <Twitter className="text-gray-400" />
              <Instagram className="text-gray-400" />
            </div>
          </div>
          <div className="space-y-6 w-full md:w-1/2">
            {["Courses", "Categories", "How it works", "About"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b border-gray-200 pb-2"
                >
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-300 mr-4">
                      0{index + 1}
                    </span>
                    <span className="text-xl font-semibold text-gray-800">
                      {item}
                    </span>
                  </div>
                  <KeyboardDoubleArrowRightIcon className="text-violet-500" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
