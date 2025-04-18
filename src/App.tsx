import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import AudioDetailPage from './pages/AudioDetailPage';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAppStore } from './store/appStore';

function App() {
  const { fetchCategories, fetchTags } = useAppStore();

  useEffect(() => {
    // Initialize app by loading categories and tags
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/audio/:id" element={<AudioDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;