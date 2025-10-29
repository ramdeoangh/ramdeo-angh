import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Helmet } from 'react-helmet-async';

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => (await api.get(`/api/blog/posts/${slug}`)).data as { title: string; contentHtml: string }
  });

  if (isLoading) return <div className="max-w-3xl mx-auto p-4">Loading...</div>;
  if (!data) return <div className="max-w-3xl mx-auto p-4">Not found</div>;

  return (
    <>
      <Helmet>
        <title>{data.title} | Ramdeo Angh</title>
        <meta name="description" content={data.title} />
        <link rel="canonical" href={`/blog/${slug}`} />
        <meta property="og:title" content={data.title} />
        <meta property="og:type" content="article" />
      </Helmet>
      <article className="prose prose-slate max-w-3xl mx-auto p-4">
        <h1>{data.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      </article>
    </>
  );
}


