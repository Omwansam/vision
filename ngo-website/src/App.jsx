import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScrollToTop } from '@/components/ScrollToTop'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Programs from '@/pages/Programs'
import Impact from '@/pages/Impact'
import News from '@/pages/News'
import NewsDetail from '@/pages/NewsDetail'
import Gallery from '@/pages/Gallery'
import Tenders from '@/pages/Tenders'
import TenderDetail from '@/pages/TenderDetail'
import Contact from '@/pages/Contact'
import Donate from '@/pages/Donate'
import GetInvolved from '@/pages/GetInvolved'
import Transparency from '@/pages/Transparency'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/tenders/:slug" element={<TenderDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
