import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css";
import { experiences } from "@/data";
import ExperienceCard from "./ExperienceCard";

const WorkExperience = () => {
  return (
    <div className="relative flex h-svh w-full max-w-full flex-col items-center overflow-hidden text-left">
      <h3 className="pageTitles">Experience</h3>
      <div className="my-5 flex h-full w-full select-none snap-x snap-mandatory items-center justify-center space-x-5 overflow-x-auto scroll-smooth px-4 py-2 scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-accent md:px-12">
        <Swiper
          className="h-full"
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          breakpoints={{ 1024: { slidesPerView: 2, spaceBetween: 10 } }}
        >
          {experiences.map((experience) => (
            <SwiperSlide key={experience.id}>
              <div className="h-full px-2 py-6 md:px-4 md:py-8">
                <ExperienceCard experience={experience} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default WorkExperience;
