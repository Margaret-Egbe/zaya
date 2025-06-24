import card1 from "../assets/card1.png";
import card2 from "../assets/card2.jpg";
import card3 from "../assets/card3.png";
import card4 from "../assets/card4.png";
import card5 from "../assets/card5.png";
import card6 from "../assets/card6.png";
import card7 from "../assets/card7.png";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
const cardImages = [card1, card2, card3, card4, card5, card6, card7];

// import required modules
import {
  Autoplay,
  Thumbs,
  FreeMode,
  Navigation,
} from "swiper/modules";
import { useState } from "react";

const Hero = () => {
const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  return (
    <>
      <div className="md:hidden w-full py-3 pl-3">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={1.5}
          breakpoints={{
            640: { slidesPerView: 2.5 },
            768: { slidesPerView: 3.5 },
            1024: { slidesPerView: 4.5 },
          }}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {cardImages.map((src, idx) => (
            <SwiperSlide key={idx}>
              <div className=" overflow-hidden  h-full bg-[#F5F5F5]">
                <img
                  src={src}
                  alt={`Card ${idx}`}
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden md:block px-10 py-6">
        {/* Main Slider */}
        <Swiper
          spaceBetween={10}
          navigation={true}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="w-full h-[400px] rounded-xl mb-4"
        >
          {cardImages.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`Slide ${idx}`}
                className="w-full h-full  rounded-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Thumbnails */}
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[Navigation, Thumbs, FreeMode]}
          className="w-full h-[100px]"
        >
          {cardImages.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`Thumb ${idx}`}
                className="w-full h-full rounded-sm cursor-pointer"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default Hero;
