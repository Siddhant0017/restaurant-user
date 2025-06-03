import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, Plus, Minus } from "lucide-react"
import { createOrder, createClient } from "../services/api"
import locationImg from "../assests/icons/Group 74.jpg"
import deliveriyImg from "../assests/icons/Group 75.jpg"
import CookingInstruction from "./CookingInstruction"
import "./CheckoutScreen.css"


const CheckoutScreen = () => {
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState("dine-in")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [cookingInstructions, setCookingInstructions] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCustomerDetailsEditing, setIsCustomerDetailsEditing] = useState(true)
  const [savedCustomerDetails, setSavedCustomerDetails] = useState({ name: "", phone: "" })
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [showCookingInstructions, setShowCookingInstructions] = useState(false)

  const swipeRef = useRef(null)
  const startX = useRef(0)
  const currentX = useRef(0)

  const navigate = useNavigate()

  // Constants for pricing
  const TAX_RATE = 5
  const DELIVERY_CHARGE = orderType === "take-away" ? 50 : 0

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [navigate])

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTaxAmount = () => {
    return (getSubtotal() * TAX_RATE) / 100
  }

  const getTotal = () => {
    return getSubtotal() + getTaxAmount() + DELIVERY_CHARGE
  }

  const getTotalPizzas = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getDeliveryTime = () => {
    const totalPizzas = getTotalPizzas()
    return totalPizzas * 20 // 20 minutes per pizza
  }

  const handleQuantityChange = (itemId, change) => {
    setCart(
      cart.map((item) => {
        if (item._id === itemId) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }),
    )
  }

  const handleRemoveItem = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId))
  }

  const handleSaveCustomerDetails = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter both name and phone number")
      return
    }
    setSavedCustomerDetails({ name: customerName, phone: customerPhone })
    setIsCustomerDetailsEditing(false)
  }

  const handleEditCustomerDetails = () => {
    setIsCustomerDetailsEditing(true)
  }

  const handleCookingInstructionsClick = () => {
    setShowCookingInstructions(true)
  }

  const handleSaveCookingInstructions = (instructions) => {
    setCookingInstructions(instructions)
    showToastMessage(instructions ? "Cooking instructions added" : "Cooking instructions removed")
  }

  const handlePlaceOrder = async () => {
    if (!savedCustomerDetails.phone && !customerPhone) {
      alert("Please enter your phone number")
      return
    }

    if (orderType === "take-away" && !deliveryAddress) {
      alert("Please enter your delivery address")
      return
    }

    try {
      // Create or update client
      await createClient({
        phone: savedCustomerDetails.phone || customerPhone,
        name: savedCustomerDetails.name || customerName,
      })

      // Create order
      const orderData = {
        clientPhone: savedCustomerDetails.phone || customerPhone,
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        type: orderType,
        totalAmount: getTotal(),
        deliveryAddress: orderType === "take-away" ? deliveryAddress : undefined,
        cookingInstructions: cookingInstructions || undefined,
      }

      await createOrder(orderData)
      localStorage.removeItem("cart")
      alert("Order placed successfully!")

      // Reset swipe progress
      setSwipeProgress(0)

      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    }
  }

  // Swipe functionality
  const handleTouchStart = (e) => {
    setIsDragging(true)
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return

    currentX.current = e.touches[0].clientX
    const deltaX = currentX.current - startX.current
    const containerWidth = swipeRef.current?.offsetWidth || 390
    const maxSwipeDistance = containerWidth - 87

    if (deltaX >= 0 && deltaX <= maxSwipeDistance) {
      const progress = (deltaX / maxSwipeDistance) * 100
      setSwipeProgress(progress)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    if (swipeProgress >= 70) {
      // Order placed when 70% swiped
      handlePlaceOrder()
    } else {
      // Reset if not swiped enough
      setSwipeProgress(0)
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    startX.current = e.clientX
    currentX.current = e.clientX
  }

  // Update these event handlers
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    const containerWidth = swipeRef.current?.offsetWidth || 390;
    const maxSwipeDistance = containerWidth - 87;
    
    if (deltaX >= 0 && deltaX <= maxSwipeDistance) {
      const progress = (deltaX / maxSwipeDistance) * 100;
      setSwipeProgress(progress);
    }
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (swipeProgress >= 70) {
      handlePlaceOrder();
    } else {
      setSwipeProgress(0);
    }
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, swipeProgress]); // Add dependencies

  return (
    <div className="checkout-screen-container">
      {showToast && <div className="toast-notification">{toastMessage}</div>}

      {/* Header */}
      <div className="checkout-header">
        <div className="checkout-header-text">
          <h1>Good evening</h1>
          <p>Place you order here</p>
        </div>

        {/* Search Bar */}
        <div className="checkout-search-bar">
          <Search className="checkout-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search"
            className="checkout-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cart Items Section */}
      <div className="checkout-items">
        {cart.map((item) => (
          <div key={item._id} className="checkout-item-container">
            {/* Item Image */}
            <img 
              src={`${process.env.REACT_APP_ADMIN_URL}${item.image}`} 
              alt={item.name} 
              className="checkout-item-image" 
              onError={(e) => {
                e.target.onerror = null;
              }}
            />

            <div className="checkout-item-details">
              <div className="checkout-item-name">{item.name}</div>
              <div className="checkout-item-price">₹ {item.price}</div>
              <div className="checkout-item-size">{item.size}</div>
            </div>

            <div className="checkout-item-controls">
              {/* Quantity Controls */}
              <div className="checkout-quantity-controls">
                <button className="checkout-quantity-button" onClick={() => handleQuantityChange(item._id, -1)}>
                  <Minus size={16} />
                </button>
                <span className="checkout-quantity-value">{item.quantity}</span>
                <button className="checkout-quantity-button" onClick={() => handleQuantityChange(item._id, 1)}>
                  <Plus size={16} />
                </button>
              </div>

              {/* Remove Button */}
              <button className="checkout-remove-button" onClick={() => handleRemoveItem(item._id)}>
                <X size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Instructions */}
        <div className="checkout-add-instructions" onClick={handleCookingInstructionsClick}>
          Add cooking instructions (optional)
          {cookingInstructions && <span className="checkout-instructions-indicator"> ✓</span>}
        </div>
      </div>

      {/* Order Type Selector */}
      <div className="checkout-order-type">
        <div className="checkout-order-type-container">
          <div className={`checkout-order-type-highlight ${orderType === "dine-in" ? "dine-in" : "take-away"}`}></div>
          <button
            className={`checkout-order-type-button ${orderType === "dine-in" ? "active" : ""}`}
            onClick={() => setOrderType("dine-in")}
          >
            Dine In
          </button>
          <button
            className={`checkout-order-type-button ${orderType === "take-away" ? "active" : ""}`}
            onClick={() => setOrderType("take-away")}
          >
            Take Away
          </button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="checkout-price-summary">
        <div className="checkout-price-row">
          <span>Item Total</span>
          <span>₹{getSubtotal().toFixed(2)}</span>
        </div>
        <div className="checkout-price-row">
          <span>Delivery Charge</span>
          <span>₹{DELIVERY_CHARGE}</span>
        </div>
        <div className="checkout-price-row">
          <span>Taxes</span>
          <span>₹{getTaxAmount().toFixed(2)}</span>
        </div>
        <div className="checkout-price-row checkout-total-row">
          <span>Grand Total</span>
          <span>₹{getTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Customer Details Box */}
      <div className="checkout-customer-details-box">
        <h3>Your details</h3>
        {isCustomerDetailsEditing ? (
          <div className="checkout-customer-form">
            <input
              type="text"
              placeholder="Please enter your name"
              className="checkout-customer-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Please enter your phone number"
              className="checkout-customer-input"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <button className="checkout-save-button" onClick={handleSaveCustomerDetails}>
              Save
            </button>
          </div>
        ) : (
          <div className="checkout-customer-display">
            <p>
              {savedCustomerDetails.name}, {savedCustomerDetails.phone}
            </p>
            <button className="checkout-edit-button" onClick={handleEditCustomerDetails}>
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Delivery Details Box */}
      <div className="checkout-delivery-details-box">
        <div className="checkout-delivery-address">
          <img src={locationImg || "/placeholder.svg"} alt="Location" className="checkout-dot-icon" />
          {orderType === "take-away" ? (
            <input
              type="text"
              placeholder="Please enter your delivery address"
              className="checkout-address-input"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          ) : (
            <span>Dine In - No delivery Address needed</span>
          )}
        </div>
        <div className="checkout-delivery-time">
          <img src={deliveriyImg || "/placeholder.svg"} alt="Time" className="checkout-dot-icon" />
          <span>
            {orderType === "take-away" ? "Delivery" : "Preparation"} in <strong>{getDeliveryTime()} mins</strong>
          </span>
        </div>
      </div>

      {/* Swipe to Order */}
      <div
        className="checkout-swipe-container"
        ref={swipeRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div
          className="checkout-swipe-button"
          style={{
            transform: `translateX(${(swipeProgress / 100) * (swipeRef.current?.offsetWidth - 87 || 0)}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          <div className="checkout-swipe-arrow">→</div>
        </div>
        <div className="checkout-swipe-text">{swipeProgress >= 70 ? "Release to Order" : "Swipe to Order"}</div>
        <div className="checkout-swipe-progress" style={{ width: `${swipeProgress}%` }} />
      </div>

      {/* Cooking Instructions Modal */}
      <CookingInstruction
        isOpen={showCookingInstructions}
        onClose={() => setShowCookingInstructions(false)}
        onSave={handleSaveCookingInstructions}
        initialValue={cookingInstructions}
      />
    </div>
  )
}

export default CheckoutScreen;