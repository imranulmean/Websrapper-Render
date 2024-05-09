import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun, FaBell } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';
import { Carousel } from "flowbite-react";

export default function Slider() {
    return (
      <section style={{'background-size': 'cover'}} class="bg-center bg-size-cover bg-no-repeat bg-[url('https://www.shutterstock.com/image-photo/various-dairy-products-600nw-627224804.jpg')] bg-blend-multiply">
          <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
              <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0" style={{'padding':'90px'}}>
              <Link to="/search" class="inline-flex justify-center items-center py-3 px-3 text-base font-medium text-center text-yellow-950 rounded-lg bg-zinc-950 bg-opacity-10 hover:bg-opacity-75 border border-yellow-900 hover:border-zinc-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                    View all products
                      <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                      </svg>
                  </Link>  
              </div>
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
