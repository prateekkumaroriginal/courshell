import CustomImage from "./CustomImage";
import demoImg from "./photos/img1.jpg";

export default function HeroSection() {
  return (
    <div className="bg-white min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left column */}
          <div className="pl-10 md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Best Digital
              <span className="block relative">
                Online Courses
                <path
                  d="M0 50C20 30 50 0 100 50"
                  stroke="currentColor"
                  strokeWidth="8"
                />
              </span>
            </h1>
            <p className="text-gray-600 mb-6 max-w-md">
              Digital online courses provide an accessible and flexible way for
              individuals to acquire new knowledge and skills in various fields.
            </p>
            <button className="bg-violet-700 text-white font-semibold py-4 px-8 rounded-[20px] hover:bg-violet-900 transition duration-300">
              Get started
            </button>
          </div>

          {/* Right column */}
          <div className="md:w-1/2 relative">
            <div className="bg-gray-100 rounded-full w-80 h-80 md:w-96 md:h-96 relative overflow-hidden">
              <img src={demoImg} alt="Smiling woman" className="rounded-full" />
            </div>

            {/* UI/UX badge */}
            <div className="absolute -top-4 -right-4 bg-gray-800 text-white px-4 py-2 rounded-full">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-400 rounded-sm mr-2"></div>
                <span className="text-sm font-semibold">UI / UX</span>
              </div>
            </div>

            {/* Star decoration */}
            <svg
              className="absolute top-0 left-0 w-16 h-16 text-gray-200"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 0L61 39H100L69 63L80 100L50 77L20 100L31 63L0 39H39L50 0Z"
                fill="currentColor"
              />
            </svg>

            {/* UI Design Patterns card */}
            <div className="absolute bottom-20 -left-10 bg-orange-100 rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold mb-2">UI Design Patterns</h3>
              <div className="flex items-center">
                <img
                  src={demoImg}
                  alt="Vernoica"
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <span className="text-sm text-gray-600">Vernoica</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">123 courses</p>
            </div>

            {/* Karen card */}
            <div className="absolute -bottom-4 right-10 bg-green-100 rounded-lg p-3 shadow-lg">
              <div className="flex items-center">
                <CustomImage
                  customSrc={demoImg}
                  customAlt="Karen"
                  customWidth={32}
                  customHeight={32}
                  customClass="rounded-full mr-2"
                />
                <div>
                  <h4 className="font-semibold text-sm">Karen</h4>
                  <p className="text-xs text-gray-600">UI/UX designer</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-1">$45 h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
