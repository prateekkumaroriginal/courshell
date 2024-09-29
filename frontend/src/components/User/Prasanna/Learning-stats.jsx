import VideocamIcon from "@mui/icons-material/Videocam";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import CustomImage from "./CustomImage";
import demoImg from "./photos/img1.jpg";

export default function LearningStats() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Study at your own place card */}
        <div className="bg-green-100 rounded-3xl p-6 relative">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <CustomImage
              customSrc={demoImg}
              customAlt="Karen"
              customWidth={32}
              customHeight={32}
              customClass="rounded-full mr-2"
            />
          </div>
          <h3 className="text-xl font-bold mb-2">Study at your own place</h3>
          <div className="absolute bottom-6 right-6 bg-white rounded-full p-2">
            <KeyboardDoubleArrowRightIcon className="w-6 h-6 text-green-500" />
          </div>
        </div>

        {/* The learning process is simple card */}
        <div className="bg-violet-100 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-violet-800 rounded-full p-2">
              <VideocamIcon className="w-6 h-6 text-white" />
            </div>
            <span className="bg-white text-violet-600 text-sm font-medium px-3 py-1 rounded-full">
              Online
            </span>
          </div>
          <h3 className="text-xl font-bold">The learning process is simple</h3>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-3xl p-6 flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <h4 className="text-3xl font-bold">231+</h4>
              <p className="text-gray-500 text-sm">Courses & subjects</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold">319+</h4>
              <p className="text-gray-500 text-sm">Instructors</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold">72k+</h4>
              <p className="text-gray-500 text-sm">Using the app</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              {[...Array(5)].map((_, i) => (
                <CustomImage
                  key={i}
                  src="/placeholder.svg"
                  alt={`Student ${i + 1}`}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span className="text-gray-600">
              <span className="font-semibold">+ 72k</span> Happy student
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
