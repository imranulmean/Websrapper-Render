import { Link } from 'react-router-dom';
import { Modal, Button } from 'flowbite-react';
import { useState } from 'react';
import PostCard from '../PostCard';

export default function ProductComparisionModal({ post, showModal,  setShowModal}) {

    const [comparisonProducts, setComparisonProducts]=useState([]);
    const searchTerm=post.productTitle;
    const productPrice = post.productPrice.toString(); // Convert productPrice to string
    const searchQuery = new URLSearchParams({
        searchTerm: searchTerm,
        productPrice: productPrice,
        mainCategoryName:post.mainCategoryName
    }).toString();
    const comparisonApi = async () =>{
        const res = await fetch(`/api/products/getComparisonProducts?${searchQuery}`);
        const data= await res.json();
        setComparisonProducts(data.products);
        console.log(data);
    }

  return (
    <>
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='6xl'>
      <Modal.Header></Modal.Header>
        <Modal.Body>
          <div className='grid grid-cols-3 gap-2'>              
                {/* Main Product Left*/}
                <div className='col-span-1 inline-grid'>
                 <div>
                    <Button onClick={comparisonApi} size="xs" color="dark">See Comparison</Button>
                    <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            <img onClick={()=>setShowModal(true)} class="p-1 rounded-t-lg" src={post.productImage} alt="product image" />
                        <div class="px-2 pb-2">
                            <h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">{post.productTitle}</h5>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-600 dark:text-white">{post.shop}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-bold text-gray-900 dark:text-white">${post.productPrice}</span>
                            </div>
                        </div>
                    </div> 
                  </div>
                </div>
                {/* Comparision Products Right */}
                <div className='col-span-2 h-[650px] overflow-y-auto'>
                      Comparision Products  
                    <div className='border border-l-1 border-gray-500'>
                        <div className='grid grid-cols-2'>
                            {
                            comparisonProducts.map((product) =>
                            <div className='col-span-1'>
                                <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                    <img class="p-1 rounded-t-lg" src={product.productImage} alt="product image" />
                                    <div class="px-2 pb-2">
                                        <h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">{post.productTitle}</h5>
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm font-medium text-gray-600 dark:text-white">{product.shop}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-lg font-bold text-gray-900 dark:text-white">${product.productPrice}</span>
                                        </div>
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
