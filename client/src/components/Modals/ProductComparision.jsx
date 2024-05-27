import { Link } from 'react-router-dom';
import { Modal, Button, Spinner, Table  } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import PostCard from '../PostCard';
import { useCart } from '../../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';


export default function ProductComparisionModal({ post, showModal,  setShowModal}) {   
    const location = useLocation();
    const { addItemToCart } = useCart();
    const initialRender = useRef(true);
    const [comparisonProducts, setComparisonProducts]=useState([]);
    const [weightsProducts, setWeightsProducts]=useState([]);
    const [loading, setLoading]=useState(false);
    const searchTerm=post.productTitle;
    const productPrice = post.productPrice.toString(); // Convert productPrice to string

    useEffect(() => {
        if (initialRender.current) {            
            initialRender.current = false;            
        } else if (showModal) {
            console.log(post)
            comparisonApi();
        }
    }, [showModal]);

    const comparisonApi = async () =>{
        const urlParams = new URLSearchParams(location.search);
        console.log(urlParams.get('searchTerm'));
        const searchQuery = new URLSearchParams({
            searchTermFromUrl:urlParams.get('searchTerm'),
            searchTerm: searchTerm,
            productPrice: productPrice,
            mainCategoryName:post.mainCategoryName
        }).toString();          
        setLoading(true);
        const res = await fetch(`/api/products/getComparisonProducts_with_Type_Weights?${searchQuery}`);
        // if(res.ok){
            setLoading(false);
            const data= await res.json();
            setComparisonProducts(data.products);
        // }
        const weightRes = await fetch(`/api/products/getComparisonProducts_with_Only_Weights?${searchQuery}`,{
            method:"POST",
            headers: {
                "Content-Type": "application/json" // Set the Content-Type header
            },            
            body:JSON.stringify(data.products)
        });        
        if(weightRes.ok){
            const weightData= await weightRes.json();
            setWeightsProducts(weightData.products); 
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
        <Modal.Body className="p-1">
          <div className='grid grid-cols-3 gap-1'>                
                {/* Main Product Left*/}
                <div className='col-span-1 inline-grid'>                 
                 {/* <div>                    
                    <h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Selected Product</h5>
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
                  </div>     */}
                    <Table hoverable>
                        <Table.Head>
                            <Table.HeadCell>Selected Product</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            <div>
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
                        </Table.Body>
                    </Table>                                
                </div>
                {/* Comparision Products Right */}
                <div className='col-span-2 h-[650px] overflow-y-auto'>
                     {/* /////////////////// */}
                     {
                        loading && 
                        <div className='flex justify-center items-center'>
                            <Spinner size='xl' />
                        </div>                        
                      }                     
                    <div className='flex flex-row'>
                        <div>
                            <Table hoverable>
                                <Table.Head>
                                    <Table.HeadCell>Same Brand Comparision Products</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {
                                        comparisonProducts.length<1 &&
                                        <p className='text-md font-semibold tracking-tight text-zinc-950 dark:text-white'>No Compared Products Less than The Selected Price</p>
                                    }
                                    {
                                        comparisonProducts.map((product) =>
                                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <ProductCard product={product} addToCart={addToCart}/>
                                        </Table.Row>                                                                        
                                        )
                                    }
                                </Table.Body>
                            </Table>
                        </div>
                        <div>
                            <Table hoverable>
                                <Table.Head>
                                    <Table.HeadCell>Same Weighted Products:</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {
                                        weightsProducts.length<1 &&
                                        <p className='text-md font-semibold tracking-tight text-zinc-950 dark:text-white'>No Compared Products Less than The Selected Price</p>
                                    }
                                    {
                                        weightsProducts.map((product) =>
                                            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <ProductCard product={product} addToCart={addToCart}/>
                                            </Table.Row>                                                                 
                                        )
                                    }
                                </Table.Body>
                            </Table>
                        </div>
                    </div>

                    {/* //////////////////////// */}
                    {/* <h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Same Brand Comparision Products</h5>
                      {
                        loading && 
                        <div className='flex justify-center items-center'>
                            <Spinner size='xl' />
                        </div>                        
                      }
                    <div>
                        <div className='grid grid-cols-2'>
                            {
                                comparisonProducts.length<1 &&
                                <p className='text-md font-semibold tracking-tight text-zinc-950 dark:text-white'>No Compared Products Less than The Selected Price</p>
                            }
                            {
                                comparisonProducts.map((product) =>
                                <div className='col-span-1'>
                                    <ProductCard product={product} addToCart={addToCart}/>
                                </div>
                                )
                            }                      
                        </div>                        
                    </div>  
                    <h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Same Weighted Products:</h5>
                    <div className='grid grid-cols-2'>                        
                        {
                                weightsProducts.map((product) =>
                                <div className='col-span-1'>
                                    <ProductCard product={product} addToCart={addToCart}/>                               
                                </div>
                                )
                            }                         
                    </div> */}
                </div>
          </div>
        </Modal.Body>
      </Modal>
    </> 
  );
}
