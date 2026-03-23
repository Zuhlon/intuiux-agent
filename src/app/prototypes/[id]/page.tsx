'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrototypePage() {
  const params = useParams();
  const id = params.id as string;
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    const fetchPrototype = async () => {
      try {
        setDebug(`Fetching prototype: ${id}`);
        
        // Используем наш API для проксирования (избегаем CORS)
        const response = await fetch(`/api/prototype?id=${id}`);
        
        setDebug(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          setDebug(`Error response: ${errorText}`);
          throw new Error(`Not found: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        setDebug(`HTML length: ${htmlContent.length}`);
        
        // Check if HTML is valid
        if (!htmlContent || htmlContent.length < 50) {
          throw new Error('HTML content too short or empty');
        }
        
        // Log first 500 chars for debugging
        console.log('[Prototype] HTML preview:', htmlContent.substring(0, 500));
        
        setHtml(htmlContent);
      } catch (err) {
        console.error('[Prototype] Error:', err);
        setError(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrototype();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '18px',
        gap: '16px'
      }}>
        <div>⏳ Загрузка прототипа...</div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>{debug}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#ffffff',
        color: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <div style={{ fontSize: '18px', color: '#1e293b' }}>{error}</div>
        <div style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
          {debug}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '16px' }}>
          Попробуйте обновить страницу через минуту
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
      title="Prototype"
    />
  );
}
