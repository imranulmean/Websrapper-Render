import { GrClose } from "react-icons/gr";
import { useEffect, useState } from 'react';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { Card } from "flowbite-react";
import { RiCloseCircleLine } from "react-icons/ri";
import { useCart } from "../context/CartContext";
import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';


export default function CartComponent({isOpen, setIsOpen}) {
    const navigate = useNavigate();
    const {cartItemsContext ,removeItemFromCart} = useCart();
    const [cartItems, setCartItems]=useState(cartItemsContext);
    // let localStorageCartItems;
    useEffect(()=>{
        setCartItems(cartItemsContext);        
    },[cartItemsContext])

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState)
    }
    const removeItem = (item) => {
        removeItemFromCart(item);
    }
    const goCartPage =()=>{
        toggleDrawer();
        navigate('/cart');
    }
  return (
        <>            
            <Drawer open={isOpen} onClose={toggleDrawer} direction='right' style={{width:"330px"}}>
                <div className="relative h-full">
                    <div className="absolute top-2 right-3">
                        <button className="group flex items-center justify-center text-center font-medium relative focus:z-10 focus:outline-none text-gray-900 enabled:hover:bg-gray-100 focus:ring-cyan-300 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2" onClick={() => setIsOpen(false)}>
                            <GrClose />
                        </button>
                    </div>
                    <div>
                        {
                            cartItems && cartItems.length === 0 &&
                            <div>Empty Cart</div>
                        }
                        {
                            cartItems && cartItems.length > 0 &&
                            <div className="w-full p-1">
                                    <ul className="py-2 h-[500px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                                        {
                                            cartItems.map((c) => {
                                                return (
                                                    <li className="py-3 sm:py-4">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <img alt="Neil image" src={c.productImage} className="rounded-full w-28" />
                                                            </div>
                                                            <div className="w-full">
                                                                <p className="product-title">{c.productTitle}</p>
                                                                <p className="product-title">{c.shop}</p>
                                                            </div>
                                                            <div className="product-title">${c.productPrice}</div>
                                                            <button onClick={() => removeItem(c)}><RiCloseCircleLine /></button>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                    <button onClick={goCartPage} class="view-all-button product-card-button w-[160px]">Finalize Cart</button>
                            </div>
                        }
                        
                    </div>
                </div>
            </Drawer>
        </>
  );
}
