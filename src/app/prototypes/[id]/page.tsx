'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrototypePage() {
  const params = useParams();
  const id = params.id as string;
  const prototypeHtml = useState<string>('');
  const html = prototypeHtml[0];
  const setHtml = prototypeHtml[1];
  const loadingState = useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];
  const errorState = useState<string | null>(null);
  const error = errorState[0];
  const setError = errorState[1];

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
