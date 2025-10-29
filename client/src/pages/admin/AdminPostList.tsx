import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export function AdminPostList() {
  const { data, refetch } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => (await api.get('/api/blog/posts?page=1')).data as { items: Array<{ slug: string; title: string }> }
  });
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Posts</h1>
        <Link className="border rounded px-3 py-1" to="/admin/blog/new">New</Link>
      </div>
      <div className="grid gap-2">
        {data?.items.map((p) => (
          <div key={p.slug} className="border rounded p-3 bg-white flex items-center justify-between">
            <div>{p.title}</div>
            <div className="flex gap-2">
              <Link className="border rounded px-2 py-1" to={`/admin/blog/${encodeURIComponent(p.slug)}/edit`}>Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


