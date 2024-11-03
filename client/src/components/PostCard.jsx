import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductComparisionModal from './Modals/ProductComparision';
import { useCart } from "../context/CartContext";
import { Button, Spinner } from "flowbite-react";

export default function PostCard({ post, cartPage }) {

    const { addItemToCart } = useCart();
    const [showModal,  setShowModal]= useState(false);
    
    const addToCart = (item) => {
        addItemToCart(item);
        alert("Added to cart")
    };
    return (
        <div class="w-[170px] max-w-sm bg-white md:w-[200px] product-card">
            <div>
                <img src={post.productImage} alt="product image"  loading="lazy"/>
            </div>
            <div class="px-2 pb-2 w-full" style={{'border': '1px solid #0075BD', 'box-shadow':' 0 0 1px 0px'}}>
                <h5 class="product-title">{post.productTitle}</h5>
                <div class="flex-center py-2 gap-2">
                    <span class="product-title">{post.shop}</span>
                    <span class="product-title">${post.productPrice}</span>
                    {
                        post.matched && 
                            <span class="product-title">{post.matched}</span>
                    }
                    
                </div>
                {
                    !cartPage &&
                    <div className='flex-center gap-2'>
                        <button class="view-all-button product-card-button"  onClick={()=>addToCart(post)}>Add To Cart</button>
                        <button class="view-all-button product-card-button" onClick={()=>setShowModal(true)}>Compare</button>
                    </div>                    
                }

            </div>
            <ProductComparisionModal post={post} showModal={showModal} setShowModal={setShowModal}/>
        </div>    
    );
}