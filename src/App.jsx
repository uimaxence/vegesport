import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Planning from './pages/Planning';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import Login from './pages/Login';
import Profile from './pages/Profile';

function AppRoutes() {
  const { user, favorites, savedPlannings, toggleFavorite, savePlanning } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Navbar user={user} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recettes" element={
            <Recipes favorites={favorites} toggleFavorite={toggleFavorite} />
          } />
          <Route path="/recettes/:slug" element={
            <RecipeDetail favorites={favorites} toggleFavorite={toggleFavorite} />
          } />
          <Route path="/planning" element={
            <Planning user={user} savePlanning={savePlanning} />
          } />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/profil" element={
            <Profile
              user={user}
              favorites={favorites}
              savedPlannings={savedPlannings}
            />
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen flex flex-col relative z-[1]">
            <AppRoutes />
            <Analytics />
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
