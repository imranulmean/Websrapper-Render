import { Button, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import ProductCard from "../components/Modals/ProductCard";
import PostCard from "../components/PostCard";
import { useCart } from "../context/CartContext";

export default function CartPage(){

    const {cartItemsContext ,removeItemFromCart} = useCart();
    const [cartItems, setCartItems]=useState(cartItemsContext);
    const [cartCalculationItems, setCartCalculationItems]=useState([]);
    const [loading, setLoading]= useState(false);

    useEffect(()=>{
        if(cartItemsContext.length>0){
            setCartItems(cartItemsContext);
            // cartCalculation();
        }        
    },[cartItemsContext])

    useEffect(() => {
        if (cartItems.length > 0) {
            getSimilarProducts_DiffShop();
        }
      }, [cartItems]);

      const getSimilarProducts_DiffShop = async () => {
        const updatedItems = await Promise.all(
          cartItems.map(async (item) => {
              const res = await fetch('/api/products/getSimilarProducts_DiffShop', {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
              });
              const data = await res.json();
              return { ...item, similar_prods: data.products };
          })
        );
        setCartItems(updatedItems); 
      };

    const cartCalculation =async() =>{
        if(cartItemsContext.length>0){
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

    }

    return(
        <div className="flex">
            {
                cartItems && cartItems.length===0 &&
                <div>Empty Cart</div>
            }
            <div className="flex flex-col">
                {                    
                    cartItems && cartItems.length>0 &&                
                        cartItems.map((c)=>{
                            return(
                                <div class="flex gap-2">
                                    <div>
                                        <PostCard post={c} cartPage={true}/>
                                    </div> 
                                    <div className="flex-center overflow-x-auto w-[400px] md:w-[800px] gap-2">
                                        {
                                            c.similar_prods && c.similar_prods.length>0 &&
                                            c.similar_prods.map((sp)=>{
                                                return(
                                                        <PostCard post={sp} cartPage={true}/>                                                    
                                                )
                                            })
                                                
                                        }
                                    </div>

                                </div>    
                            )
                        })                
                }
            </div>

        </div>
    )
    // return (
    //     <div>
    //         <div>                
    //             {
    //             loading && 
    //             <div className='flex flex-col justify-center items-center'>
    //                 <h1 className="text-xl font-medium text-gray-400 dark:text-white">Generating Possible Combinations Minimum to Maximum...</h1>
    //                 <Spinner size='xl' />
    //             </div>                        
    //             }                
    //             {
    //                 cartCalculationItems && cartCalculationItems.length>0 &&
    //                 <div className="flex flex-col flex-wrap md:flex-row gap-2">
    //                     <button class="view-all-button product-card-button" onClick={cartCalculation}>Generate Combination</button>
    //                     {
    //                         cartCalculationItems.map((eachArray, index)=>{
    //                             // const totalPrice = eachArray.reduce((acc, c) => acc + c.productPrice, 0);
    //                         return(
    //                            <ul className="md:w-[300px] p-2 overflow-y-auto divide-y divide-gray-200">
    //                                <p className="product-title">Combination: {index+1}</p>
    //                                 {
    //                                     eachArray.combination.map((c) => {
    //                                         return (
    //                                             <li className="py-3 sm:py-4">
    //                                                 <div className="flex items-center">
    //                                                     <div>
    //                                                         <img alt="Neil image" src={c.productImage} className="rounded-full w-28" />
    //                                                     </div>
    //                                                     <div className="w-full">
    //                                                         <p className="product-title">{c.productTitle}</p>
    //                                                         <p className="product-title">{c.shop}</p>
    //                                                     </div>
    //                                                     <div className="product-title">${c.productPrice}</div>
    //                                                 </div>
    //                                             </li>
    //                                         )
    //                                     })                                        
    //                                 }
    //                                 <div className="flex justify-end">
    //                                     <p className="text-sm font-medium text-gray-900 dark:text-white">Total: ${eachArray.totalPrice.toFixed(2)}</p>
    //                                 </div>                                    
    //                             </ul>
    //                         )
    //                         })
    //                     }

    //                 </div>                    
    //             }                
    //         </div>
    //     </div>
    // )
}
