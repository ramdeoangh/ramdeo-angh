import React from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { JsonFormatterPage } from './pages/JsonFormatterPage';
import { AboutPage } from './pages/AboutPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AdminRoutes } from './pages/admin/AdminRoutes';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">Ramdeo Angh</Link>
          <div className="flex items-center gap-4">
            <Link to="/">Home</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/about">About Me</Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<JsonFormatterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <Outlet />
      </main>
      <footer className="border-t bg-white text-center py-4 text-sm text-gray-500">© {new Date().getFullYear()} Ramdeo Angh</footer>
    </div>
  );
}


