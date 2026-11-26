import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar }     from './components/common/Navbar';
import { CartDrawer } from './components/shop/CartDrawer';
import Home              from './pages/Home';
import Shop              from './pages/Shop';
import ProductDetail     from './pages/ProductDetail';
import Checkout          from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/shop"                element={<Shop />} />
        <Route path="/product/:slug"       element={<ProductDetail />} />
        <Route path="/checkout"            element={<Checkout />} />
        <Route path="/order-confirmation"  element={<OrderConfirmation />} />
      </Routes>
    </BrowserRouter>
  );
}
