import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import Slider from '../components/Slider';

export default function Home() {
  const [colesProducts, setColesProducts] = useState([]);
  const [woolsProducts, setWoolsProducts] = useState([]);
  const [igaProducts, setIgaProducts] = useState([]);
  const colesProductsUrl='/api/products/getColesProducts';
  const woolsProductsUrl='/api/products/getWoolsProducts';
  const igaProductsUrl='/api/products/getIgaProducts';

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
    const fetchIgaProducts = async () => {
      const res = await fetch(igaProductsUrl);
      const data = await res.json();
      setIgaProducts(data.products);            
    };
    fetchColesProducts();
    fetchWoolsProducts();
    fetchIgaProducts();

  }, []);

  return (
    <div>
      
      <Slider />

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {colesProducts && colesProducts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold black-center'>Featured Coles Products</h2>
            <div className='flex-center flex-wrap gap-3'>
              {colesProducts.map((product) => (
                <PostCard key={product._id} post={product} />
              ))}
            </div>
          </div>
        )}
        {woolsProducts && woolsProducts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold black-center'>Featured Wools Products</h2>
            <div className='flex-center flex-wrap gap-3'>
              {woolsProducts.map((product) => (
                <PostCard key={product._id} post={product} />
              ))}
            </div>
          </div>
        )}
        {igaProducts && igaProducts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold black-center'>Featured IGA Products</h2>
            <div className='flex-center flex-wrap gap-3'>
              {igaProducts.map((product) => (
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
