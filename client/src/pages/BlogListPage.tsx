import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export function BlogListPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['posts', { search, category, tag, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      params.set('page', String(page));
      const res = await api.get(`/api/blog/posts?${params.toString()}`);
      return res.data as { items: Array<{ slug: string; title: string; excerpt?: string }>; page: number; totalPages: number };
    }
  });

  const cats = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/api/blog/categories')).data as { items: Array<{ id: number; name: string; slug: string }> }
  });
  const tags = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/api/blog/tags')).data as { items: Array<{ id: number; name: string; slug: string }> }
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input className="border rounded px-2 py-1" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border rounded px-2 py-1" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</noption>
          {cats.data?.items.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select className="border rounded px-2 py-1" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All Tags</option>
          {tags.data?.items.map((t) => (
            <option key={t.id} value={t.slug}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3">
        {data?.items?.map((p) => (
          <Link to={`/blog/${p.slug}`} key={p.slug} className="block border rounded p-3 bg-white hover:bg-gray-50">
            <div className="font-medium">{p.title}</div>
            {p.excerpt && <div className="text-sm text-gray-600">{p.excerpt}</div>}
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <button className="border rounded px-3 py-1" disabled={(data?.page || 1) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <div className="text-sm">Page {data?.page || 1} / {data?.totalPages || 1}</div>
        <button className="border rounded px-3 py-1" disabled={(data?.page || 1) >= (data?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}


