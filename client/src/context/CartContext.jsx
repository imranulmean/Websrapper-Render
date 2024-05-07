import{ createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItemsContext, setCartItemsContext] = useState([]);

  useEffect(() => {
    const localStorageCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItemsContext(localStorageCartItems);
  }, []);

  const addItemToCart = (item) => {
    const updatedCartItems = [...cartItemsContext, item];
    setCartItemsContext(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  };

  const removeItemFromCart = (item) => {
    console.log(item)
    // const updatedCartItems = cartItemsContext.filter((cartItem) => cartItem !== item);
    // setCartItemsContext(updatedCartItems);
    // localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        const updatedCartItems = cartItemsContext.filter((cartItem) => cartItem !== item);
        setCartItemsContext(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));    
  };

  const clearCart = () => {
    setCartItemsContext([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItemsContext, addItemToCart, removeItemFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};