import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import { Button } from '@ui/components/Button';

export function AdminBlogNew() {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentMarkdown, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/blog/posts', { title, slug, contentMarkdown, status: 'draft', tagIds: [] });
      alert('Created');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') return <div className="max-w-3xl mx-auto p-4">Unauthorized</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2">
      <h1 className="text-xl font-semibold">New Post</h1>
      <input className="border rounded px-2 py-1 w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="border rounded px-2 py-1 w-full" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <textarea className="border rounded px-2 py-1 w-full h-64 font-mono" placeholder="Markdown" value={contentMarkdown} onChange={(e) => setContent(e.target.value)} />
      <div>
        <Button onClick={onSave} disabled={saving || !title || !slug}>Save</Button>
      </div>
    </div>
  );
}


