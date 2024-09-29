import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import demoImg from "./photos/img1.jpg";
import CustomImage from "./CustomImage";

export default function Component() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold mb-4">Most Popular Courses</h1>
      <p className="text-xl mb-8">
        Start an incredible UI/UX design course with us. You can learn the most
        requested digital courses.
      </p>
      <div className="flex space-x-4 mb-8">
        <button className="px-4 py-2 border border-gray-300 rounded-full">
          UX/UI Design
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-full">
          Frontend Development
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-full">
          Backend Development
        </button>
      </div>
      <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="flex-none w-80 bg-violet-100 rounded-3xl p-6"
          >
            <div className="flex items-center mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((avatar) => (
                  <CustomImage
                    customSrc={demoImg}
                    key={avatar}
                    customAlt="Student avatar"
                    customWidth={32}
                    customHeight={32}
                    customClass="w-8 h-8 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm">+154 Student</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">UI/UX design</h3>
            <p className="mb-4">Professional certification</p>
            <button className="flex items-center text-lg font-semibold">
              Join class
              <KeyboardDoubleArrowRightIcon className="ml-2 w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
