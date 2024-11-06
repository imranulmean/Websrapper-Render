import { Avatar, Button, Dropdown, Navbar, TextInput, Badge } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun, FaBell, FaShoppingCart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';
import CartComponent from './CartComponent';
import { useCart } from '../context/CartContext';
import ImageMarque from './ImageMarque';


export default function Header() {
  const {cartItemsContext} =useCart();
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false)
  const [cartItems, setCartItems]=useState([]);
  let localStorageCartItems;


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <>
      <ImageMarque textMarque={1}/>
      <Navbar className='sticky top-0 bg-[#0075BD] z-30 p-3' style={{"background":'linear-gradient(45deg, #0075BD 50%, white 50%)'}}>
      <Link to='/' className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'>
        <h3 className='text-xl text-white'>Ausi Store</h3>
      </Link>
      <form onSubmit={handleSubmit} className='relative'>
        {/* <TextInput type='text' placeholder='Search...'           
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        /> */}
          <input
            type='text'
            placeholder='Search'
            className='bg-gray-50 border border-gray-200 rounded text-sm w-full py-2 px-4 max-w-[210px] pr-10'
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />        
          <button type="submit" className="absolute top-0 right-0 mt-3 mr-3 h-5 w-5 text-gray-400">
            <AiOutlineSearch />
          </button>
      </form>
      <button className="py-1.5 px-0.5 group flex items-center justify-center text-center font-medium relative focus:z-10 focus:outline-none text-gray-900 bg-white border border-gray-300 enabled:hover:bg-gray-100 focus:ring-cyan-300 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2" 
              onClick={()=>setIsOpen(true)}>
                <FaShoppingCart /><Badge color="gray" size="xs">{cartItemsContext.length}</Badge>
      </button>
      <CartComponent isOpen={isOpen} setIsOpen={setIsOpen} />
      {/* <Button className='w-12 h-10 lg:hidden' color='gray' pill>
        <AiOutlineSearch />
      </Button> */}
      {/* <div className='flex gap-2 md:order-2'>
        <Button
          className='w-12 h-10 hidden sm:inline'
          color='gray'
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt='user' img={currentUser.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className='block text-sm'>@{currentUser.username}</span>
              <span className='block text-sm font-medium truncate'>
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={'/dashboard?tab=profile'}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
             {
               currentUser.isAdmin &&
               <>
                <Link to={'/dashboard'}>
                  <Dropdown.Item>Dashboard</Dropdown.Item>
                </Link>
                <Dropdown.Divider />
              </>
             }
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to='/sign-in'>
            <Button gradientDuoTone='purpleToBlue' outline>
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div> */}
      {/* <Navbar.Collapse>
        <Navbar.Link active={path === '/'} as={'div'}>
          <Link to='/'>Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === '/about'} as={'div'}>
          <Link to='/about'>About</Link>
        </Navbar.Link>
        <Navbar.Link active={path === '/projects'} as={'div'}>
          <Link to='/projects'>Projects</Link>
        </Navbar.Link>
      </Navbar.Collapse> */}
    </Navbar>      
    </>

  );
}
