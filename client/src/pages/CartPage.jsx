import { Button, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartPage(){

    const {cartItemsContext ,removeItemFromCart} = useCart();
    const [cartCalculationItems, setCartCalculationItems]=useState([]);
    const [loading, setLoading]= useState(false);

    useEffect(()=>{
        console.log(cartItemsContext.length)
        if(cartItemsContext.length>0){
            cartCalculation();
        }
        
    },[cartItemsContext])

    const cartCalculation =async() =>{
        setCartCalculationItems(null);
        setLoading(true);
        console.log("Start Calculating");
        const res= await fetch('/api/cart/cartCalculation',{
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify(cartItemsContext)            
        })
        const data= await res.json();
        console.log(data.products)
        setCartCalculationItems(data.products)
        setLoading(false);
    }

    return (
        <div className="grid grid-cols-3">
            {/* <Button color="dark" size="xs" onClick={cartCalculation}>Cart Calculation</Button> */}
            {/* <div className="col-span-1">
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
            </div> */}
            <div className="col-span-3">
                {
                loading && 
                <div className='flex flex-col justify-center items-center'>
                    <h1 className="text-xl font-medium text-gray-400 dark:text-white">Generating Possible Combinations ...</h1>
                    <Spinner size='xl' />
                </div>                        
                }                
                {
                    cartCalculationItems && cartCalculationItems.length>0 &&
                    <div className="flex flex-col flex-wrap md:flex-row gap-2">
                        {
                            cartCalculationItems.map((eachArray, index)=>{
                            return(
                               <ul className="md:w-[300px] p-2 bg-white border border-gray-200 rounded-lg shadow overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                                   <p className="text-sm font-medium text-gray-900 dark:text-white">Combination: {index+1}</p>
                                    {
                                        eachArray.map((c) => {
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
                            )   

                            })
                        }

                    </div>                    
                }                
            </div>
        </div>
    )
}