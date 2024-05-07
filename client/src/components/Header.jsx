import { Avatar, Button, Dropdown, Navbar, TextInput, Badge } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun, FaBell, FaShoppingCart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';
import CartComponent from './CartComponent';

export default function Header() {
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
  useEffect(()=>{
      localStorageCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      console.log(localStorageCartItems);
      setCartItems(localStorageCartItems);        
  },[])
  useEffect(()=>{
    localStorageCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    console.log(localStorageCartItems);
    setCartItems(localStorageCartItems);        
  },[isOpen])

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
    <Navbar className='sticky top-0 bg-white z-30 p-3'>
      <Link to='/' className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'>
        <h3 className='text-xl text-black'>Ausi Store</h3>
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
      <Button onClick={()=>setIsOpen(true)} size="sm" color="light"><FaShoppingCart /><Badge color="gray">{cartItems.length}</Badge></Button>
      <CartComponent isOpen={isOpen} setIsOpen={setIsOpen} cartItems={cartItems} setCartItems={setCartItems}/>
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
  );
}
