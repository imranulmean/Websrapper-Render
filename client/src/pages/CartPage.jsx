import { Button, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartPage(){

    const {cartItemsContext ,removeItemFromCart} = useCart();
    const [cartItems, setCartItems]=useState(cartItemsContext);
    useEffect(()=>{
        setCartItems(cartItemsContext);        
    },[cartItemsContext])

    const cartCalculation =async() =>{
        console.log("Start Calculating");
        const res= await fetch('/api/cart/cartCalculation',{
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify(cartItems)            
        })
        const data= await res.json();
        console.log(data);
    }

    return (
        <>
        <div className="grid grid-cols-3">
            <div className="col-span-1">
                {
                    cartItems && cartItems.length > 0 &&
                    <div className="w-full p-1">
                            <ul className="py-2 h-[500px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                                {
                                    cartItems.map((c) => {
                                        return (
                                            <li className="py-3 sm:py-4">
                                                <div className="flex items-center">
                                                    <div className="shrink-0">
                                                        <img alt="Neil image" src={c.productImage} className="rounded-full w-28" />
                                                    </div>
                                                    <div className="w-full">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.productTitle}</p>
                                                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{c.shop}</p>
                                                    </div>
                                                    <div className="inline-flex text-sm items-center text-base font-medium text-gray-900 dark:text-white">${c.productPrice}</div>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                    </div>
                }                             
            </div>
            <div className="col-span-2">
                Calculating State
                <Button color="dark" size="xs" onClick={cartCalculation}>Cart Calculation</Button>
            </div>
        </div>


        </>
    )
}