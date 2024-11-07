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
    const [similarProducts_DiffShop, setSimilarProducts_DiffShop]= useState([]);
    const [comparisonProducts, setComparisonProducts]=useState([]);
    const [weightsProducts, setWeightsProducts]=useState([]);
    const [brandWeightProducts, setBrandWeightProducts]=useState([]);
    const [loading, setLoading]=useState(false);
    const searchTerm=post.productTitle.replace(' |','');
    const productPrice = post.productPrice.toString(); // Convert productPrice to string

    useEffect(() => {
        if (initialRender.current) {            
            initialRender.current = false;            
        } else if (showModal) {
            console.log(post)
            getSimilarProducts_DiffShop();
            // comparisonApi();
        }
    }, [showModal]);

    const getSimilarProducts_DiffShop= async() =>{
        setLoading(true);
        const res= await fetch('/api/products/getSimilarProducts_DiffShop',{
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify(post)            
        })
        const data= await res.json();
        setSimilarProducts_DiffShop(data.products)
        setLoading(false);
    }

    const comparisonApi = async () =>{
        const urlParams = new URLSearchParams(location.search);
        let searchQueryObj={
            searchTermFromUrl:urlParams.get('searchTerm'),
            searchTerm: searchTerm,
            productPrice: productPrice,
            mainCategoryName:post.mainCategoryName
        }
        
        setLoading(true);
        searchQueryObj['queryType']="brand_category";
        let searchQuery = new URLSearchParams(searchQueryObj).toString();
        const fetch_brand_category = fetch(`/api/products/getComparisonProducts_with_Type_Weights?${searchQuery}`);

        searchQueryObj['queryType']="category_weight";
        searchQuery = new URLSearchParams(searchQueryObj).toString();
        const fetch_category_weight = fetch(`/api/products/getComparisonProducts_with_Type_Weights?${searchQuery}`);

        searchQueryObj['queryType']="brand_weight";
        searchQuery = new URLSearchParams(searchQueryObj).toString();
        const fetch_brand_weight = fetch(`/api/products/getComparisonProducts_with_Type_Weights?${searchQuery}`);        
        
        const [brand_category_res, category_weight_res, brand_weight_res]= await Promise.all([fetch_brand_category, fetch_category_weight, fetch_brand_weight]);
        // if(res.ok){
            setLoading(false);
            const data= await brand_category_res.json();
            setComparisonProducts(data.products);
        // }

        if(category_weight_res.ok){
            const weightData= await category_weight_res.json();
            setWeightsProducts(weightData.products); 
        }
        if(brand_weight_res.ok){
            const brandWeightData= await brand_weight_res.json();
            setBrandWeightProducts(brandWeightData.products);             
        }
    } 

    const addToCart = (item) => {
        addItemToCart(item);
        alert("Added to cart")
    };

  return (
    <>
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='8xl'>
      <Modal.Header></Modal.Header>
        <Modal.Body className="p-1">
          <div className='flex gap-2 justify-center'>                
                {/* Main Product Left*/}
                <div className='flex flex-col gap-2 justify-center' style={{'alignItems':'center'}}>
                <h1 className="product-title w-full" style={{"background":"#0075BD", "color":"#fff"}}>Selected Product</h1>
                    <PostCard post={post} productCompareModal={true} cartPage={true}/>                               
                </div>
                {/* Comparision Products Right */}
                <div className="flex flex-col" style={{"border-radius":"5px", "box-shadow":"0 0 2px 0px", 'overflow':'hidden'}}>                    
                    <h1 className="product-title w-full" style={{"background":"#0075BD", "color":"#fff"}}>Similar Products from Other Shops</h1>
                    {
                        loading &&
                        <div className="m-auto">
                            <Spinner size='xl' />
                        </div>
                        
                    }                    
                    <div className="flex flex-col h-[250px] overflow-y-auto gap-2 md:flex-row md:w-[800px] md:h-full md:overflow-x-auto">
                        {
                            similarProducts_DiffShop.map((product)=>
                                <div className="flex-center">
                                    <PostCard post={product} productCompareModal={true} cartPage={true}/>
                                </div>
                            )
                        }
                    </div>
                </div>
                {/* /////////// Other Criteria Starts///////// */}
                    {/* <div className='col-span-3 h-[650px] overflow-y-auto'>
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
                                        <Table.HeadCell>Same Brand Same Category</Table.HeadCell>
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
                                        <Table.HeadCell>Same Category Same Weight:</Table.HeadCell>
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
                            <div>
                                <Table hoverable>
                                    <Table.Head>
                                        <Table.HeadCell>Same Brand Same Weight:</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {
                                            brandWeightProducts.length<1 &&
                                            <p className='text-md font-semibold tracking-tight text-zinc-950 dark:text-white'>No Compared Products Less than The Selected Price</p>
                                        }
                                        {
                                            brandWeightProducts.map((product) =>
                                                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                    <ProductCard product={product} addToCart={addToCart}/>
                                                </Table.Row>                                                                 
                                            )
                                        }
                                    </Table.Body>
                                </Table>
                            </div>                        
                        </div>
                    </div> */}
                {/* /////////// Other Criteria Ends///////// */}
          </div>
        </Modal.Body>
      </Modal>
    </> 
  );
}
