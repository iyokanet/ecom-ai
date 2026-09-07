'use client';

import { useState } from 'react';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!preview) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: preview, mimeType }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Sunucu hatası');
      }

      setResult(data);
    } catch (err: any) {
      alert('Sistem Uyarısı: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">E-Ticaret AI Metin Dönüştürücü</h1>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
          <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          {preview && <img src={preview} alt="Önizleme" className="max-h-48 mx-auto rounded-lg shadow" />}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!preview || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
        >
          {loading ? 'AI Görseli Analiz Ediyor...' : 'AI Başlık ve Açıklama Üret'}
        </button>

        {result && (
          <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase">Önerilen Başlık</h3>
              <p className="text-base font-semibold text-gray-800">{result.title}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase">Pazarlama Açıklaması</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm">{result.description}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
