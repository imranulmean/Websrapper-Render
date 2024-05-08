import { Link } from 'react-router-dom';
import { Modal, Button, Spinner } from 'flowbite-react';
import { useState } from 'react';
import PostCard from '../PostCard';
import { useCart } from '../../context/CartContext';


export default function ProductComparisionModal({ post, showModal,  setShowModal}) {   
    const { addItemToCart } = useCart();
    const [comparisonProducts, setComparisonProducts]=useState([]);
    const [loading, setLoading]=useState(false);
    const searchTerm=post.productTitle;
    const productPrice = post.productPrice.toString(); // Convert productPrice to string
    const searchQuery = new URLSearchParams({
        searchTerm: searchTerm,
        productPrice: productPrice,
        mainCategoryName:post.mainCategoryName
    }).toString();

    const comparisonApi = async () =>{
        setLoading(true);
        const res = await fetch(`/api/products/getComparisonProducts?${searchQuery}`);
        if(res.ok){
            setLoading(false);
            const data= await res.json();
            setComparisonProducts(data.products);
        }
    }

    const addToCart = (item) => {
        addItemToCart(item);
        alert("Added to cart")
    };

  return (
    <>
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='6xl'>
      <Modal.Header></Modal.Header>
        <Modal.Body>
          <div className='grid grid-cols-3 gap-2'>                
                {/* Main Product Left*/}
                <div className='col-span-1 inline-grid'>
                 <div>
                    <Button onClick={comparisonApi} size="xs" color="dark">Compare Now</Button>
                    <div class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            <img onClick={()=>setShowModal(true)} class="p-1 rounded-t-lg" src={post.productImage} alt="product image" />
                        <div class="px-2 pb-2">
                            <h5 class="text-md font-semibold tracking-tight text-gray-900 dark:text-white">{post.productTitle}</h5>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-600 dark:text-white">{post.shop}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-md font-bold text-gray-900 dark:text-white">${post.productPrice}</span>
                            </div>                            
                        </div>                        
                    </div>
                    <Button size="xs" color="dark" onClick={()=>addToCart(post)}>Add To Cart</Button>                                         
                  </div>                  
                </div>
                {/* Comparision Products Right */}
                <div className='col-span-2 h-[650px] overflow-y-auto'>
                      Comparision Products  
                      {
                        loading && 
                        <div className='flex justify-center items-center'>
                            <Spinner size='xl' />
                        </div>                        
                      }
                    <div>
                        <div className='grid grid-cols-2'>
                            {
                            comparisonProducts.map((product) =>
                            <div className='col-span-1'>
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
                            </div>
                            )
                        }
                        </div>                        
                    </div>  


                </div>

          </div>
        </Modal.Body>
      </Modal>
    </> 
  );
}
