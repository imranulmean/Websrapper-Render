import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductComparisionModal from './Modals/ProductComparision';
import { useCart } from "../context/CartContext";
import { Button, Spinner } from "flowbite-react";

export default function PostCard({ post }) {

    const { addItemToCart } = useCart();
    const [showModal,  setShowModal]= useState(false);
    
    const addToCart = (item) => {
        addItemToCart(item);
        alert("Added to cart")
    };
    return (
        <div class="w-[170px] max-w-sm bg-white md:w-[200px] product-card">
            <div>
                <img src={post.productImage} alt="product image" />                
            </div>
            <div class="px-2 pb-2 w-full">
                <h5 class="product-title">{post.productTitle}</h5>
                <div class="flex-center py-2 gap-2">
                    <span class="product-title">{post.shop}</span>
                    <span class="product-title">${post.productPrice}</span>
                </div>
                <div className='flex-center gap-2'>
                    <button class="view-all-button product-card-button"  onClick={()=>addToCart(post)}>Add To Cart</button>
                    <button class="view-all-button product-card-button" onClick={()=>setShowModal(true)}>Compare</button>
                </div>
            </div>
            <ProductComparisionModal post={post} showModal={showModal} setShowModal={setShowModal}/>
        </div>    
    );
}



    // <div className='group relative w-full border border-teal-500 hover:border-2 h-[400px] overflow-hidden rounded-lg sm:w-[330px] transition-all'>
    //   <Link to={`/post/${post.productUrl}`}>
    //     <img src={post.productImage} alt='post cover'
    //       className='h-[260px] w-full  object-cover group-hover:h-[200px] transition-all duration-300 z-20'
    //     />
    //   </Link>
    //   <div className='p-3 flex flex-col gap-2'>
    //     <p className='text-lg font-semibold line-clamp-2'>{post.productTitle}</p>
    //     <span className='italic text-sm'>{post.shop}</span>
    //     <Link
    //       to={`/post/${post.productUrl}`}
    //       className='z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2'
    //     >
    //       Read article
    //     </Link>
    //   </div>
    // </div>