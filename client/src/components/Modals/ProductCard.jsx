import { Modal, Button, Spinner } from 'flowbite-react';

export default function ProductCard({product, addToCart}){
    return(
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img class="p-1 rounded-t-lg" src={product.productImage} alt="product image" />
            <div class="px-2 pb-2">
                <h5 class="text-md font-semibold tracking-tight text-gray-900 dark:text-white">{product.productTitle}</h5>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-600 dark:text-white">{product.shop}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-md font-bold text-gray-900 dark:text-white">${product.productPrice}</span>
                </div>
                <Button size="xs" color="dark" onClick={()=>addToCart(product)}>Add To Cart</Button>
            </div>                                      
        </div>         
    )
}