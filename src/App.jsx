import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminGuard from './components/admin/AdminGuard';

const Home = lazy(() => import('./pages/Home'));
const Recipes = lazy(() => import('./pages/Recipes'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const Planning = lazy(() => import('./pages/Planning'));
const PlanningFunnel = lazy(() => import('./pages/PlanningFunnel'));
const PlanningSetup = lazy(() => import('./pages/PlanningSetup'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Profile = lazy(() => import('./pages/Profile'));
const PersonalData = lazy(() => import('./pages/PersonalData'));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales'));
const AdminRecipes = lazy(() => import('./pages/admin/AdminRecipes'));
const AdminRecipeForm = lazy(() => import('./pages/admin/AdminRecipeForm'));
const AdminIngredients = lazy(() => import('./pages/admin/AdminIngredients'));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <p className="text-text-light">Chargement…</p>
    </div>
  );
}

function AppRoutes() {
  const { user, favorites, savedPlannings, toggleFavorite, savePlanning } = useAuth();
  const location = useLocation();
  const isPlanningSetup = location.pathname.startsWith('/planning/setup');

  return (
    <>
      <ScrollToTop />
      {!isPlanningSetup && <Navbar user={user} />}
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recettes" element={
              <Recipes favorites={favorites} toggleFavorite={toggleFavorite} />
            } />
            <Route path="/recettes/:slug" element={
              <RecipeDetail favorites={favorites} toggleFavorite={toggleFavorite} />
            } />
            <Route path="/planning/:planningId/recette/:slug" element={
              <RecipeDetail favorites={favorites} toggleFavorite={toggleFavorite} />
            } />
            <Route path="/planning" element={<PlanningFunnel />} />
            <Route path="/planning/setup" element={<PlanningSetup />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id/:slug?" element={<BlogArticle />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profil" element={
              <Profile
                user={user}
                favorites={favorites}
                savedPlannings={savedPlannings}
              />
            } />
            <Route path="/donnees-personnelles" element={<PersonalData />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminRecipes />} />
              <Route path="/admin/recettes/nouvelle" element={<AdminRecipeForm />} />
              <Route path="/admin/recettes/:id/edit" element={<AdminRecipeForm />} />
              <Route path="/admin/ingredients" element={<AdminIngredients />} />
              <Route path="/admin/articles" element={<AdminArticles />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isPlanningSetup && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col relative z-[1]">
              <AppRoutes />
              <Analytics />
            </div>
          </ErrorBoundary>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
