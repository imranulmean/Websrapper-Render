import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Search() {

  const getSearchProductsUrl='/api/search/getSearchProducts';
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    shop: '',
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const shopFromUrl = urlParams.get('shop');
    if (searchTermFromUrl || sortFromUrl || shopFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        shop: shopFromUrl,
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(`${getSearchProductsUrl}?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setLoading(false);
        if (data.products.length > 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === 'searchTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === 'sort') {
      const order = e.target.value || 'desc';
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === 'shop') {
      const shop = e.target.value || '';
      setSidebarData({ ...sidebarData, shop });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('shop', sidebarData.shop);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = products.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`${getSearchProductsUrl}?${searchQuery}`);
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setProducts([...products, ...data.products]);      
      if (data.products.length > 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  return (
    <div className='flex flex-col md:flex-row'>

      {/* SideBar */}
      
      <div className='p-4 border-b md:border-r md:min-h-screen border-white-500'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex   items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Search Term:
            </label>
            <TextInput placeholder='Search...' id='searchTerm' type='text' value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Shop:</label>
            <Select onChange={handleChange} value={sidebarData.shop} id='shop'>
              <option value=''>All</option>
              <option value='coles'>Coles</option>
              <option value='woolworths'>Woolworths</option>
            </Select>
          </div>          
          <Button type='submit' color="dark">
            Apply Filters
          </Button>
        </form>
      </div>

      {/* Products Section */}

      <div className='w-full'>
        <div className='p-3 flex flex-wrap gap-2'>
          {!loading && products.length === 0 && (
            <p className='text-xl text-gray-500'>No posts found.</p>
          )}
          {loading && <p className='text-xl text-gray-500'>Loading...</p>}
          {!loading &&
            products &&
            products.map((product) => <PostCard key={product._id} post={product} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className='text-teal-500 text-lg hover:underline p-7 w-full'
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>

    // <main className='grid grid-cols-1 md:grid-cols-6 md:w-full mx-auto'>      
    // {/* Sidebar (Left) */}
    //   <section className='hidden md:inline-grid md:col-span-1'>
    //     <div className='fixed w-[226px]'>              
    //      <div className='p-4 border-b md:border-r md:min-h-screen border-white-500'>
    //        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
    //          <div className='flex   items-center gap-2'>
    //            <label className='whitespace-nowrap font-semibold'>
    //              Search Term:
    //            </label>
    //            <TextInput placeholder='Search...' id='searchTerm' type='text' value={sidebarData.searchTerm}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div className='flex items-center gap-2'>
    //           <label className='font-semibold'>Shop:</label>
    //           <Select onChange={handleChange} value={sidebarData.shop} id='shop'>
    //             <option value=''>All</option>
    //             <option value='coles'>Coles</option>
    //             <option value='woolworths'>Woolworths</option>
    //           </Select>
    //         </div>          
    //         <Button type='submit' color="dark">
    //           Apply Filters
    //         </Button>
    //       </form>
    //     </div>
    //     </div>
    //   </section> 

    //   {/* Products Section (Right) */}
    //   <section className='md:col-span-5'>
    //     <div className='w-full'>
    //      <div className='p-7 flex flex-wrap gap-2'>
    //         {!loading && products.length === 0 && (
    //           <p className='text-xl text-gray-500'>No posts found.</p>
    //         )}
    //         {loading && <p className='text-xl text-gray-500'>Loading...</p>}
    //         {!loading &&
    //           products &&
    //           products.map((product) => <PostCard key={product._id} post={product} />)}
    //         {showMore && (
    //           <button
    //             onClick={handleShowMore}
    //             className='text-teal-500 text-lg hover:underline p-7 w-full'
    //           >
    //             Show More
    //           </button>
    //         )}
    //      </div>
    //    </div>    
    //   </section>
    // </main>    
  );
}
