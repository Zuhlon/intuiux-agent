'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrototypePage() {
  const params = useParams();
  const id = params.id as string;
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrototype = async () => {
      try {
        const response = await fetch('/api/prototype?id=' + id);
        if (!response.ok) throw new Error('Not found');
        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (err) {
        setError('Прототип не найден');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPrototype();
  }, [id]);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0f',color:'#f5b942',fontFamily:'system-ui'}}>Загрузка...</div>;
  if (error) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a0f',color:'#ef4444',fontFamily:'system-ui'}}>Ошибка: {error}</div>;
  return <iframe srcDoc={html} style={{width:'100%',height:'100vh',border:'none'}} title="Prototype" />;
}
