import { Modal, Button, Spinner } from 'flowbite-react';

export default function ProductCard({product, addToCart}){
    return(
        <div class="product-card">
            <img src={product.productImage} alt="product image" />
            <div class="px-2 pb-2 w-full">
                <h5 class="product-title">{product.productTitle}</h5>
                <div class="flex-center py-2 gap-2">
                    <span class="product-title">{product.shop}</span>
                    <span class="product-title">${product.productPrice}</span>
                </div>
                
                <button class="view-all-button product-card-button" onClick={()=>addToCart(product)}>Add To Cart</button>
            </div>                                      
        </div>         
    )
}