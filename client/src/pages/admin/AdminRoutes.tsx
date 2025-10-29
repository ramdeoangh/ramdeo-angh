import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { AdminBlogNew } from './AdminBlogNew';
import { AdminPostList } from './AdminPostList';
import { AdminEditPost } from './AdminEditPost';
import { AdminTaxonomy } from './AdminTaxonomy';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, fetchMe } = useAuthStore();
  useEffect(() => { fetchMe(); }, [fetchMe]);
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminHome() {
  return <div className="max-w-4xl mx-auto p-4">Admin Dashboard (coming soon)</div>;
}

export function AdminRoutes() {
  return (
    <Guard>
      <Routes>
        <Route path="" element={<AdminHome />} />
        <Route path="blog" element={<AdminPostList />} />
        <Route path="blog/new" element={<AdminBlogNew />} />
        <Route path="blog/:id/edit" element={<AdminEditPost />} />
        <Route path="taxonomy" element={<AdminTaxonomy />} />
      </Routes>
    </Guard>
  );
}


