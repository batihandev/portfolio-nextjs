"use client";
import { motion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css";
import { projects } from "@/data";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  if (projects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative z-0 mx-auto flex h-svh max-w-full flex-col items-center justify-start overflow-hidden text-left"
    >
      <h3 className="pageTitles">Projects</h3>
      <div className="relative z-20 flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-accent">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
        >
          {projects.map((project) => (
            <SwiperSlide key={project.id}>
              <ProjectCard project={project} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="absolute left-0 top-[30%] h-125 w-full -skew-y-12 bg-accent/10" />
    </motion.div>
  );
};

export default Projects;
