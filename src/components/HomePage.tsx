import Explore from "@/products/Explore";
import Categories from "@/products/Categories";
import FreeDelivery from "@/products/FreeDelivery";
import SuperDeals from "@/products/SuperDeals";
import WeeklyDeals from "@/products/WeeklyDeals";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

const HomePage = () => {
  return (
    <>
    <div className="w-full py-5 px-4 md:px-10 bg-white mt-1 mb-7">
    
         <h2 className="text-lg font-medium mb-4 ">Categories</h2>
        <Categories />
      </div>

      {/* Super Deals */}
      <div className="w-full py-2 px-4 bg-[#A306BD] text-white md:px-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold ">Super Deals</h2>
          <h3 className="text-sm italic font-light">Incredible.... prices</h3>
        </div>
        <ArrowRightAltIcon />
      </div>
      <div className="w-full pl-4 md:pl-10 mt-2 mb-7">
        <SuperDeals  />
      </div>

      {/* Free Delivery */}
      <div className="w-full py-3 px-4 md:px-10 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium ">Free Delivery</h2>
          </div>
          <ArrowRightAltIcon />
        </div>
        <FreeDelivery />
      </div>

      {/* Weekly Deals */}
      <div className="w-full py-3 px-4 md:px-10 bg-white mb-7">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium ">Weekly Deals</h2>
            <h3 className="text-sm text-gray-500">Low price for 30 days</h3>
          </div>
          <ArrowRightAltIcon />
        </div>
        <WeeklyDeals />
      </div>

       {/* Explore*/}
      <div className="w-full py-3 px-4 md:px-10 bg-white mb-7">
         <h2 className="text-lg font-medium ">More To Explore</h2>
        <Explore />
      </div>
    </>
  );
};

export default HomePage;
