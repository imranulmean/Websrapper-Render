import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Carousel } from "flowbite-react";

export default function Slider() {
    return (
      <section class="image-banner flex-center">
          <div>
            <Link to="/search" class="flex-center view-all-button">
                    View all products
                      <svg class="w-3.5 h-3.5 ms-2 mt-0.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                      </svg>
            </Link>
          </div>

      </section>
    //     <div className="h-56 sm:h-64 xl:h-80 xl:pr-24 xl:pl-24 2xl:h-96">
    //     <Carousel slide={false}>
    //       <img src='https://media.licdn.com/dms/image/D5612AQEMBc-WygyG6Q/article-cover_image-shrink_720_1280/0/1657089972204?e=2147483647&v=beta&t=uXIEblHuMzT27b_3hFSlsNtqnh2s5gLxiksnDTmX08o' alt="..." />
    //       <img src="https://www.shutterstock.com/image-photo/various-dairy-products-600nw-627224804.jpg" alt="..." />
    //       <img src="https://t3.ftcdn.net/jpg/05/85/50/46/360_F_585504652_mx2E5zY3SZxOE9yjuHArUIMWFweAgHY6.jpg" alt="..." />
    //     </Carousel>
    //   </div>
      );
}
