import React, { useRef, useEffect } from "react";
import { Experience } from "typings";
import ExperienceCard from "./ExperienceCard";

type Props = { experiences: Experience[] };

const WorkExperience = ({ experiences }: Props) => {
  const scrollDiv = useRef(null);
  useEffect(() => {
    const handleWheel = (e: any) => {
      // Get the screen width
      const screenWidth = window.innerWidth;

      // Get the current and maximum scroll position
      const currentScroll = scrollDiv.current.scrollLeft;
      const maxScroll =
        scrollDiv.current.scrollWidth - scrollDiv.current.clientWidth;

      // Check if we're at the start or end of the scrollable area
      if (
        (currentScroll === 0 && e.deltaY < 0) ||
        (currentScroll === maxScroll && e.deltaY > 0)
      ) {
        // We're at the start and trying to scroll up, or at the end and trying to scroll down
        // So let the wheel event do its default behavior (vertical scrolling)
        return;
      }

      // Prevent the default behavior of the wheel event (vertical scrolling)
      e.preventDefault();

      // Adjust the scrollLeft property based on the deltaY property
      if (e.deltaY > 0) {
        // User is scrolling down, so scroll to the next element
        scrollDiv.current.scrollLeft += screenWidth;
      } else {
        // User is scrolling up, so scroll to the previous element
        scrollDiv.current.scrollLeft -= screenWidth;
      }
    };

    scrollDiv.current.addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      scrollDiv.current.removeEventListener("wheel", handleWheel);
    };
  }, []);
  return (
    <div className="relative flex h-[100svh] w-full max-w-full flex-col items-center justify-between overflow-hidden  text-left ">
      <h3 className="pageTitles">Experience</h3>
      <div
        ref={scrollDiv}
        className="m-5 flex w-full select-none snap-x snap-mandatory space-x-5 overflow-x-scroll scroll-smooth py-2 scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80"
      >
        {experiences.map((experience) => (
          <ExperienceCard key={experience._id} experience={experience} />
        ))}
      </div>
    </div>
  );
};

export default WorkExperience;
