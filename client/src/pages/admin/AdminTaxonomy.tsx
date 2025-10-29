import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export function AdminTaxonomy() {
  const cats = useQuery({ queryKey: ['categories'], queryFn: async () => (await api.get('/api/blog/categories')).data });
  const tags = useQuery({ queryKey: ['tags'], queryFn: async () => (await api.get('/api/blog/tags')).data });
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const addCategory = async () => {
    await api.post('/api/blog/categories', { name, slug });
    setName(''); setSlug('');
    cats.refetch();
  };

  const addTag = async () => {
    await api.post('/api/blog/tags', { name, slug });
    setName(''); setSlug('');
    tags.refetch();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 grid gap-6 md:grid-cols-2">
      <div>
        <h2 className="font-semibold mb-2">Categories</h2>
        <div className="flex gap-2 mb-2">
          <input className="border rounded px-2 py-1" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <button className="border rounded px-3" onClick={addCategory}>Add</button>
        </div>
        <ul className="space-y-1">
          {cats.data?.items.map((c: any) => (
            <li key={c.id} className="flex justify-between border rounded px-2 py-1 bg-white">
              <span>{c.name}</span>
              <button className="text-red-600" onClick={async () => { await api.delete(`/api/blog/categories/${c.id}`); cats.refetch(); }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Tags</h2>
        <div className="flex gap-2 mb-2">
          <input className="border rounded px-2 py-1" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <button className="border rounded px-3" onClick={addTag}>Add</button>
        </div>
        <ul className="space-y-1">
          {tags.data?.items.map((t: any) => (
            <li key={t.id} className="flex justify-between border rounded px-2 py-1 bg-white">
              <span>{t.name}</span>
              <button className="text-red-600" onClick={async () => { await api.delete(`/api/blog/tags/${t.id}`); tags.refetch(); }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


