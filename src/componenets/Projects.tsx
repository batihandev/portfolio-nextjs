"use client";
import { motion } from "framer-motion";
import { tree } from "next/dist/build/templates/app-page";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useEffect, useState } from "react";
import urlFor from "sanityhelper";
import { Project } from "typings";
import ProjectCard from "./ProjectCard";
import experience from "sanity/schemas/experience";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css";

const styles = {
  slide: {
    padding: 15,
    minHeight: 100,
  },
};
type Props = {
  projects: Project[];
};

function Projects({ projects }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative z-0 mx-auto flex h-[100svh] max-w-full flex-col items-center justify-start overflow-hidden text-left md:flex-col"
    >
      <h3 className="pageTitles">Projects</h3>
      <div className="relative z-20  flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar overflow-y-hidden scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {projects?.map((project) => (
            <SwiperSlide key={project._id}>
              <ProjectCard project={project} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="absolute top-[30%] left-0 h-[500px] w-full -skew-y-12 bg-[#F7AB0A]/10"></div>
    </motion.div>
  );
}

export default Projects;
