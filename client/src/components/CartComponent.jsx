import { IoCloseOutline } from "react-icons/io5";
import { useEffect, useState } from 'react';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { Card } from "flowbite-react";
import { RiCloseCircleLine } from "react-icons/ri";

export default function CartComponent({isOpen, setIsOpen}) {

    const [cartItems, setCartItems]=useState([]);
    let localStorageCartItems;
    useEffect(()=>{
        localStorageCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        console.log(localStorageCartItems);
        setCartItems(localStorageCartItems);        
    },[isOpen])

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState)
    }
    const removeItem = (item) => {
        const updatedCartItems = cartItems.filter((cartItem) => cartItem !== item);
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    }
  return (
        <>            
            <Drawer open={isOpen} onClose={toggleDrawer} direction='right' className='bla bla bla'>
                <div className="relative h-full">
                    <div className="absolute top-0 right-0">
                        <button onClick={() => setIsOpen(false)}><IoCloseOutline /></button>
                    </div>
                    <div>
                        {
                            cartItems && cartItems.length === 0 &&
                            <div>Empty Cart</div>
                        }
                        {
                            cartItems && cartItems.length > 0 &&
                            <div className="w-full p-1">
                                <div className="flow-root p-1">
                                    <ul className="py-2 h-[500px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                                        {
                                            cartItems.map((c) => {
                                                return (
                                                    <li className="py-3 sm:py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="shrink-0">
                                                                <img alt="Neil image" height="32" src={c.productImage} width="64" className="rounded-full" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.productTitle}</p>
                                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{c.shop}</p>
                                                            </div>
                                                            <div className="inline-flex text-sm items-center text-base font-medium text-gray-900 dark:text-white">${c.productPrice}</div>
                                                            <button onClick={() => removeItem(c)}><RiCloseCircleLine /></button>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </Drawer>
        </>
  );
}
