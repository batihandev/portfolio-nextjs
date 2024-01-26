import React, { useRef, useEffect } from "react";
import { Experience } from "typings";
import ExperienceCard from "./ExperienceCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css";

type Props = { experiences: Experience[] };

const WorkExperience = ({ experiences }: Props) => {
  return (
    <div className="relative flex h-[100svh] w-full max-w-full flex-col items-center overflow-hidden  text-left ">
      <h3 className="pageTitles">Experience</h3>
      <div className="flex my-5 items-center justify-center h-full w-full select-none snap-x snap-mandatory space-x-5 overflow-x-auto scroll-smooth py-2 scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        <Swiper
          className="h-full"
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          breakpoints={{
            1024: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
          }}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {experiences?.map((experience) => (
            <SwiperSlide key={experience._id}>
              <ExperienceCard experience={experience} />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* {experiences.map((experience) => (
          <ExperienceCard key={experience._id} experience={experience} />
        ))} */}
      </div>
    </div>
  );
};

export default WorkExperience;
