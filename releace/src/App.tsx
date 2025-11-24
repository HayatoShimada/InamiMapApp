import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import News from './pages/News'
import About from './pages/About'
import Contact from './pages/Contact'
import Donation from './pages/Donation'
import Download from './pages/Download'
import ShopInquiry from './pages/ShopInquiry'
import Privacy from './pages/Privacy'
import BetaTest from './pages/BetaTest'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/download" element={<Download />} />
        <Route path="/shop-inquiry" element={<ShopInquiry />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/beta" element={<BetaTest />} />
      </Routes>
    </Layout>
  )
}

export default App
