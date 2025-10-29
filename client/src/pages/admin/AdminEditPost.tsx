import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '@ui/components/Button';

export function AdminEditPost() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentMarkdown, setContent] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/blog/posts/${id}`);
        setTitle(res.data.title);
      } catch {}
    })();
  }, [id]);

  const onSave = async () => {
    setLoading(true);
    try {
      await api.put(`/api/blog/posts/${id}`, { title, slug, contentMarkdown });
      alert('Updated');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete?')) return;
    await api.delete(`/api/blog/posts/${id}`);
    alert('Deleted');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2">
      <h1 className="text-xl font-semibold">Edit Post</h1>
      <input className="border rounded px-2 py-1 w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="border rounded px-2 py-1 w-full" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <textarea className="border rounded px-2 py-1 w-full h-64 font-mono" placeholder="Markdown" value={contentMarkdown} onChange={(e) => setContent(e.target.value)} />
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={loading}>Save</Button>
        <Button variant="secondary" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  );
}


