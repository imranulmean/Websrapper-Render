import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import Slider from '../components/Slider';

export default function Home() {
  const [colesProducts, setColesProducts] = useState([]);
  const [woolsProducts, setWoolsProducts] = useState([]);
  const colesProductsUrl='/api/products/getColesProducts';
  const woolsProductsUrl='/api/products/getWoolsProducts';

  useEffect(() => {
    const fetchColesProducts = async () => {
      const res = await fetch(colesProductsUrl);
      const data = await res.json();
      setColesProducts(data.products);            
    };
    const fetchWoolsProducts = async () => {
      const res = await fetch(woolsProductsUrl);
      const data = await res.json();
      setWoolsProducts(data.products);            
    };

    fetchColesProducts();
    fetchWoolsProducts();

  }, []);

  return (
    <div>
      
      <Slider />

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {colesProducts && colesProducts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Featured Coles Products</h2>
            <div className='flex flex-wrap gap-4'>
              {colesProducts.map((product) => (
                <PostCard key={product._id} post={product} />
              ))}
            </div>
          </div>
        )}
        {woolsProducts && woolsProducts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Featured Wools Products</h2>
            <div className='flex flex-wrap gap-4'>
              {woolsProducts.map((product) => (
                <PostCard key={product._id} post={product} />
              ))}
            </div>
          </div>
        )}        
            <Link to={'/search'} className='text-lg text-teal-500 hover:underline text-center'>
              View all Products
            </Link>        
      </div>
    </div>
  );
}
