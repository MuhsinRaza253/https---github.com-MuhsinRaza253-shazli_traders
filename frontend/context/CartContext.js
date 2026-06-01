import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API = process.env.NEXT_PUBLIC_API_URL;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // Store settings configured by the admin (delivery + contact details)
  const [settings, setSettings] = useState({});
  const [deliveryCharge, setDeliveryCharge] = useState(200);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);

  // Persist cart in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Load store delivery settings
  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(({ data }) => {
        setSettings(data || {});
        if (data.deliveryCharge !== undefined) setDeliveryCharge(Number(data.deliveryCharge));
        if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(data.freeShippingThreshold));
      })
      .catch(() => {});
  }, []);

  // attributes: [{ name, value }] covering Size, Color and any custom features.
  const addItem = (product, quantity = 1, attributes = []) => {
    const find = re => (attributes.find(a => re.test(a.name)) || {}).value || '';
    const size = find(/^size$/i);
    const color = find(/^colou?r$/i);
    const key = `${product._id}-${attributes.map(a => `${a.name}=${a.value}`).join('&')}`;
    setItems(prev => {
      const existing = prev.find(i => i.cartKey === key);
      if (existing) {
        return prev.map(i => i.cartKey === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity, attributes, size, color, cartKey: key }];
    });
  };

  const removeItem = (cartKey) => {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey));
  };

  const updateQty = (cartKey, quantity) => {
    if (quantity < 1) return removeItem(cartKey);
    setItems(prev => prev.map(i => i.cartKey === cartKey ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.salePrice || i.price) * i.quantity, 0);
  const qualifiesFree = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shipping = items.length === 0 ? 0 : (qualifiesFree ? 0 : deliveryCharge);
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal, shipping, total, deliveryCharge, freeShippingThreshold, settings }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
