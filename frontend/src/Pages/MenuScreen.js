import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenuItems } from '../services/api';
import { Search, Plus, Minus } from 'lucide-react';
import './MenuScreen.css';

// Import category icons
import drinkIcon from '../assests/icons/Drinks1.jpg';
import pizzaIcon from '../assests/icons/Pizza.png';
import burgerIcon from '../assests/icons/Burger1.jpg';
import friesIcon from '../assests/icons/FrenchFries1.jpg';
import veggiesIcon from '../assests/icons/Veggies1.jpg';

const MenuScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('pizza');
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [, setLoading] = useState(false);
  const navigate = useNavigate();

  // Memoize fetchMenuItems with useCallback and include selectedCategory dependency
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMenuItems(selectedCategory);
      const availableItems = response.data.filter(item => item.available);
      setMenuItems(availableItems);
      setFilteredItems(availableItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(menuItems);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, menuItems]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const getItemQuantity = (itemId) => {
    const item = cart.find(cartItem => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  const handleRemoveFromCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);

    if (existingItem) {
      if (existingItem.quantity === 1) {
        setCart(cart.filter(cartItem => cartItem._id !== item._id));
      } else {
        setCart(cart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        ));
      }
    }
  };

  const categories = [
    {
      id: 'burger',
      name: 'Burger',
      icon: <img src={burgerIcon} alt="Burger" className="category-icon-img" style={{ width: '27px', height: '27px' }} />
    },
    {
      id: 'pizza',
      name: 'Pizza',
      icon: <img src={pizzaIcon} alt="Pizza" className="category-icon-img" style={{ width: '27px', height: '27px' }} />
    },
    {
      id: 'drink',
      name: 'Drink',
      icon: <img src={drinkIcon} alt="Drink" className="category-icon-img" style={{ width: '27px', height: '27px' }} />
    },
    {
      id: 'fries',
      name: 'Fries',
      icon: <img src={friesIcon} alt="Fries" className="category-icon-img" style={{ width: '27px', height: '27px' }} />
    },
    {
      id: 'veggies',
      name: 'Veggies',
      icon: <img src={veggiesIcon} alt="Veggies" className="category-icon-img" style={{ width: '27px', height: '27px' }} />
    },
  ];

  return (
    <div className="menu-screen">
      <header className="header">
        <div className="greeting">
          <h1>Good evening</h1>
          <p>Place your order here</p>
        </div>

        <div className="search-container">
          <div className="search-icon">
            <Search size={24} color="#A8A8A8" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </header>

      <div className="categories">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="category-icon">{category.icon}</div>
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>

      <section className="menu-section">
        <h2 className="section-title">{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h2>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item._id} className="menu-item">
              <div className="item-image-container">
                <img
                  src={`${process.env.REACT_APP_ADMIN_URL}/uploads/${item.image}`}
                  alt={item.name}
                  className="item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <div className="item-price-action">
                  <p className="item-price">₹ {item.price}</p>
                  {getItemQuantity(item._id) > 0 ? (
                    <div className="quantity-controls">
                      <button onClick={() => handleRemoveFromCart(item)} className="quantity-btn">
                        <Minus size={16} />
                      </button>
                      <span className="quantity-value">{getItemQuantity(item._id)}</span>
                      <button onClick={() => handleAddToCart(item)} className="quantity-btn">
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="add-button"
                      onClick={() => handleAddToCart(item)}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="action-buttons">
        {cart.length > 0 && (
          <button className="next-button" onClick={handleCheckout}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuScreen;