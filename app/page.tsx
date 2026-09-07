'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchCredits(user.id);
    };
    getUser();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (data) setCredits(data.credits);
  };

  const handleAuth = async (isSignUp: boolean) => {
    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else if (data.user) {
      setUser(data.user);
      fetchCredits(data.user.id);
    }
  };

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
    if (!preview || credits === null || credits <= 0) {
      alert('Krediniz yetersiz! Lütfen paket satın alın.');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: preview, mimeType }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Krediyi 1 düşür
      await supabase.from('profiles').update({ credits: credits - 1 }).eq('id', user.id);
      setCredits(credits - 1);
      setResult(data);
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full space-y-4 text-gray-800">
          <h2 className="text-xl font-bold text-center">Giriş Yap / Kayıt Ol</h2>
          <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
          <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" />
          <div className="flex gap-2">
            <button onClick={() => handleAuth(false)} className="flex-1 bg-indigo-600 text-white py-2 rounded">Giriş Yap</button>
            <button onClick={() => handleAuth(true)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">Kayıt Ol</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
            Kalan Kredi: {credits ?? '...'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center">E-Ticaret AI Metin Dönüştürücü</h1>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4 block w-full text-sm text-slate-500" />
          {preview && <img src={preview} alt="Önizleme" className="max-h-48 mx-auto rounded-lg shadow" />}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!preview || loading || (credits !== null && credits <= 0)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
        >
          {loading ? 'AI Görseli Analiz Ediyor...' : 'AI Başlık ve Açıklama Üret (1 Kredi)'}
        </button>

        {credits === 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center space-y-2">
            <p className="text-amber-800 font-medium">Ücretsiz kredileriniz bitti!</p>
            <a href="https://lemon-squeezy-veya-iyzico-linki" target="_blank" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
              100 Kredi Satın Al (299 TL)
            </a>
          </div>
        )}

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
