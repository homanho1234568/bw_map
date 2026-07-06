import React, { useState, useEffect } from 'react';
import { addBooth, fetchBooths, updateBooth, deleteBooth } from '../services/api';
import { ExternalLink, Plus, Trash2, CheckCircle, ArrowLeft, Edit2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Freebie, Booth } from '../types';

export default function AdminPage() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [editingBoothId, setEditingBoothId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hall: '1.1H',
    category: 'game',
    description: '',
    tags: '',
    mapX: 50,
    mapY: 50,
    featured: false,
    status: 1,
    game_ip: '',
    anime_ip: '',
    official_link: '',
    image_url: ''
  });
  
  const [freebies, setFreebies] = useState<(Partial<Freebie> & { is_announced?: boolean })[]>([]);
  const [freebiesTba, setFreebiesTba] = useState(false);
  const [status, setStatus] = useState<{type: 'idle'|'loading'|'success'|'error', msg: string}>({type: 'idle', msg: ''});

  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = async () => {
    try {
      const data = await fetchBooths();
      // Sort by creation or just code
      setBooths(data.sort((a, b) => a.code.localeCompare(b.code)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (booth: Booth) => {
    setEditingBoothId(booth.id);
    setFormData({
      name: booth.name,
      code: booth.code,
      hall: booth.hall,
      category: booth.category,
      description: booth.description,
      tags: booth.tags.join(', '),
      mapX: booth.mapX,
      mapY: booth.mapY,
      featured: booth.featured,
      status: booth.status !== undefined ? booth.status : 1,
      game_ip: booth.game_ip || '',
      anime_ip: booth.anime_ip || '',
      official_link: booth.official_link || '',
      image_url: booth.image_url || ''
    });
    setFreebies(booth.freebies.map(f => ({
      name: f.name,
      type: f.type,
      description: f.description,
      condition: f.condition,
      difficulty: f.difficulty,
      game_ip: f.game_ip || '',
      anime_ip: f.anime_ip || '',
      official_link: f.official_link || '',
      image_url: f.image_url || '',
      is_announced: f.is_announced
    })));
    setFreebiesTba(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingBoothId(null);
    setFormData({
      name: '', code: '', hall: '1.1H', category: 'unknown', description: '', tags: '', mapX: 50, mapY: 50, featured: false, status: 1, game_ip: '', anime_ip: '', official_link: '', image_url: ''
    });
    setFreebies([]);
    setFreebiesTba(false);
  };

  const handleDeleteClick = async (boothId: string) => {
    if (!window.confirm('確定要刪除此攤位嗎？此操作無法還原。')) return;
    setStatus({ type: 'loading', msg: '刪除攤位中...' });
    try {
      await deleteBooth(boothId);
      setStatus({ type: 'success', msg: '成功刪除攤位！' });
      await loadBooths();
      if (editingBoothId === boothId) cancelEdit();
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message || '刪除失敗' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addFreebie = () => {
    setFreebies(prev => [...prev, { name: '', type: 'other', description: '', condition: '', difficulty: 'easy', is_announced: true }]);
  };

  const updateFreebie = (index: number, field: string, value: any) => {
    setFreebies(prev => {
      const newFreebies = [...prev];
      newFreebies[index] = { ...newFreebies[index], [field]: value };
      return newFreebies;
    });
  };

  const removeFreebie = (index: number) => {
    setFreebies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: editingBoothId ? '更新攤位中...' : '新增攤位中...' });
    
    try {
      const boothPayload = {
        name: formData.name,
        code: formData.code,
        hall: formData.hall,
        category: formData.category,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        mapX: Number(formData.mapX),
        mapY: Number(formData.mapY),
        featured: formData.featured,
        status: Number(formData.status),
        width: 14,
        height: 14,
        game_ip: formData.game_ip,
        anime_ip: formData.anime_ip,
        official_link: formData.official_link,
        image_url: formData.image_url
      };
      
      let freebiesPayload;
      if (freebiesTba) {
        freebiesPayload = [{
          name: '無料資訊待公布',
          type: 'other',
          description: '官方尚未公布細節，請留意後續更新',
          condition: '待公布',
          difficulty: 'easy',
          is_announced: false
        }];
      } else {
        freebiesPayload = freebies.map(f => ({
          name: f.name,
          type: f.type,
          description: f.description,
          condition: f.condition,
          difficulty: f.difficulty,
          game_ip: f.game_ip,
          anime_ip: f.anime_ip,
          official_link: f.official_link,
          image_url: f.image_url,
          is_announced: f.is_announced ?? true
        }));
      }
      
      if (editingBoothId) {
        await updateBooth(editingBoothId, boothPayload, freebiesPayload);
        setStatus({ type: 'success', msg: '成功更新攤位！' });
      } else {
        await addBooth(boothPayload, freebiesPayload);
        setStatus({ type: 'success', msg: '成功新增攤位！' });
      }
      
      cancelEdit();
      await loadBooths();
      
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 3000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message || (editingBoothId ? '更新失敗' : '新增失敗') });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 font-sans selection:bg-black selection:text-white pb-16 antialiased">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="w-6 h-6 rounded bg-black flex items-center justify-center text-[10px] font-black text-white font-display">
                BW
              </span>
              <span className="font-display font-extrabold text-sm tracking-tight text-black flex items-center gap-1.5">
                BW 2026
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                  ADMIN
                </span>
              </span>
            </Link>
          </div>
          <Link to="/" className="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回前台地圖</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 space-y-12">
        
        {/* Form Section */}
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-black font-display mb-2">
                {editingBoothId ? '編輯攤位' : '新增攤位數據'}
              </h1>
              <p className="text-sm text-zinc-500">
                {editingBoothId ? '修改現有的參展攤位資訊。' : '在後台添加新的參展攤位資訊，數據將同步至 Supabase 資料庫中。'}
              </p>
            </div>
            {editingBoothId && (
              <button onClick={cancelEdit} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                取消編輯
              </button>
            )}
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Booth Basic Info */}
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-black font-display border-b border-zinc-100 pb-3">基本資訊</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">攤位名稱 <span className="text-rose-500">*</span></label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="例如: Bilibili 官方展台" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">攤位編號 <span className="text-rose-500">*</span></label>
                <input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black font-mono placeholder:font-sans" placeholder="例如: 3A33" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">所屬場館 <span className="text-rose-500">*</span></label>
                <select required name="hall" value={formData.hall} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black">
                  <option value="1.1H">1.1H 館</option>
                  <option value="2.1H">2.1H 館</option>
                  <option value="3.1H">3.1H 館</option>
                  <option value="4.1H">4.1H 館</option>
                  <option value="5.1H">5.1H 館</option>
                  <option value="6.1H">6.1H 館</option>
                  <option value="7.1H">7.1H 館</option>
                  <option value="8.1H">8.1H 館</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">分類分區 <span className="text-rose-500">*</span></label>
                <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black">
                  <option value="unknown">未知 / 待確定</option>
                  <option value="game">遊戲世界</option>
                  <option value="virtual">虛擬樂園</option>
                  <option value="model">模玩英雄</option>
                  <option value="tabletop">一起桌遊</option>
                  <option value="creator">UP主空間</option>
                  <option value="bazaar">同人集市</option>
                  <option value="romance">戀戀心聲</option>
                  <option value="tech">科技體驗</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">標籤 (Tags)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="以逗號分隔，例如: 原神, 米哈游, 大廠" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">詳細介紹</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="輸入攤位活動簡介..."></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">遊戲作品 (如有)</label>
                <input type="text" name="game_ip" value={formData.game_ip || ''} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="例如: 原神" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">動漫作品 (如有)</label>
                <input type="text" name="anime_ip" value={formData.anime_ip || ''} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="例如: 鬼滅之刃" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">官方公布連結</label>
                <input type="text" name="official_link" value={formData.official_link || ''} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="多個連結請用空格或逗號分隔" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">圖片網址</label>
                <input type="url" name="image_url" value={formData.image_url || ''} onChange={handleInputChange} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="https://..." />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 flex justify-between">
                  <span>地圖座標 X (0-100) <span className="text-rose-500">*</span></span>
                  <span className="font-mono text-[10px] text-zinc-400">當前: {formData.mapX}%</span>
                </label>
                <input required type="range" min="0" max="100" name="mapX" value={formData.mapX} onChange={handleInputChange} className="w-full accent-black" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 flex justify-between">
                  <span>地圖座標 Y (0-100) <span className="text-rose-500">*</span></span>
                  <span className="font-mono text-[10px] text-zinc-400">當前: {formData.mapY}%</span>
                </label>
                <input required type="range" min="0" max="100" name="mapY" value={formData.mapY} onChange={handleInputChange} className="w-full accent-black" />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleInputChange} className="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black accent-black" />
                <label htmlFor="featured" className="text-sm font-semibold text-zinc-800 cursor-pointer">標記為熱門攤位 (Featured)</label>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="status" className="text-sm font-semibold text-zinc-800">發布狀態:</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="bg-zinc-50 border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-1.5 outline-none transition-all focus:ring-1 focus:ring-black">
                  <option value={1}>已公布 (1)</option>
                  <option value={0}>待公布 (0)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Freebies */}
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-3">
              <h2 className="text-lg font-extrabold text-black font-display">無料贈品資訊</h2>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg hover:border-black transition-colors">
                  <input 
                    type="checkbox" 
                    checked={freebiesTba}
                    onChange={(e) => {
                      setFreebiesTba(e.target.checked);
                      if (e.target.checked) setFreebies([]); // clear when TBA checked
                    }}
                    className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black" 
                  />
                  <span className="text-xs font-bold text-zinc-700">官方尚未公布 (標記待公布)</span>
                </label>
                
                <button type="button" onClick={addFreebie} disabled={freebiesTba} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 hover:border-black text-black rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增無料</span>
                </button>
              </div>
            </div>

            {freebiesTba ? (
              <div className="text-center py-8 text-amber-600 text-sm font-semibold border-2 border-dashed border-amber-200 bg-amber-50 rounded-xl">
                已標記為待公布。送出後將自動建立「無料資訊待公布」項目。
              </div>
            ) : freebies.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-sm font-semibold border-2 border-dashed border-zinc-200 rounded-xl">
                目前沒有配置任何無料贈品
              </div>
            ) : (
              <div className="space-y-4">
                {freebies.map((freebie, idx) => (
                  <div key={idx} className="relative bg-zinc-50 border border-zinc-200 rounded-xl p-4 pt-5">
                    <button type="button" onClick={() => removeFreebie(idx)} className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">贈品名稱 <span className="text-rose-500">*</span></label>
                        <input required type="text" value={freebie.name} onChange={(e) => updateFreebie(idx, 'name', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="如: 限定明信片" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">類型 <span className="text-rose-500">*</span></label>
                        <select required value={freebie.type} onChange={(e) => updateFreebie(idx, 'type', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black">
                          <option value="card">卡片/明信片 (card)</option>
                          <option value="bag">提袋 (bag)</option>
                          <option value="badge">徽章/吧唧 (badge)</option>
                          <option value="sticker">貼紙 (sticker)</option>
                          <option value="fan">扇子 (fan)</option>
                          <option value="poster">海報 (poster)</option>
                          <option value="other">其他 (other)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">獲取難度 <span className="text-rose-500">*</span></label>
                        <select required value={freebie.difficulty} onChange={(e) => updateFreebie(idx, 'difficulty', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black">
                          <option value="easy">簡單 (打卡/關注)</option>
                          <option value="medium">中等 (試玩/集章)</option>
                          <option value="hard">困難 (消費/限量抽獎)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">獲取條件說明 <span className="text-rose-500">*</span></label>
                        <input required type="text" value={freebie.condition} onChange={(e) => updateFreebie(idx, 'condition', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="如: 關注官方帳號並發送社媒" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">贈品詳情描述</label>
                        <input type="text" value={freebie.description} onChange={(e) => updateFreebie(idx, 'description', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="BW2026 現場限定..." />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">無料遊戲作品 (如有)</label>
                        <input type="text" value={freebie.game_ip || ''} onChange={(e) => updateFreebie(idx, 'game_ip', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="如: 原神" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">無料動漫作品 (如有)</label>
                        <input type="text" value={freebie.anime_ip || ''} onChange={(e) => updateFreebie(idx, 'anime_ip', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="如: 鬼滅之刃" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">官方公布連結</label>
                        <input type="text" value={freebie.official_link || ''} onChange={(e) => updateFreebie(idx, 'official_link', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="多個連結請用空格或逗號分隔" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600">圖片網址</label>
                        <input type="url" value={freebie.image_url || ''} onChange={(e) => updateFreebie(idx, 'image_url', e.target.value)} className="w-full bg-white border border-zinc-200 focus:border-black text-sm text-black rounded-lg px-3 py-2 outline-none transition-all focus:ring-1 focus:ring-black" placeholder="https://..." />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-zinc-100">
                      <input type="checkbox" id={`announced-${idx}`} checked={freebie.is_announced !== false} onChange={(e) => updateFreebie(idx, 'is_announced', e.target.checked)} className="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black accent-black" />
                      <label htmlFor={`announced-${idx}`} className="text-sm font-semibold text-zinc-800 cursor-pointer">無料已由官方公布 (is_announced)</label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-4">
            {status.type === 'error' && (
              <span className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                {status.msg}
              </span>
            )}
            {status.type === 'success' && (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                {status.msg}
              </span>
            )}
            <button 
              type="submit" 
              disabled={status.type === 'loading'}
              className="px-6 py-3 bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-400 rounded-lg font-extrabold text-sm tracking-wide transition-all shadow-sm"
            >
              {status.type === 'loading' ? '處理中...' : (editingBoothId ? '更新攤位數據' : '發佈攤位數據')}
            </button>
          </div>

        </form>
        </div>

        {/* Booths List Section */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-black font-display">現有攤位列表</h2>
            <p className="text-xs text-zinc-500">點擊編輯按鈕可修改攤位資料與無料資訊</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3">編號</th>
                  <th className="px-4 py-3">名稱</th>
                  <th className="px-4 py-3">場館</th>
                  <th className="px-4 py-3 text-center">無料數</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {booths.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-black">{b.code}</td>
                    <td className="px-4 py-3 text-zinc-800 font-bold">{b.name}</td>
                    <td className="px-4 py-3 text-zinc-600">{b.hall}</td>
                    <td className="px-4 py-3 text-center text-zinc-600">{b.freebies.length}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-bold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        編輯
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(b.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
                {booths.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 font-medium text-sm">
                      目前沒有任何攤位資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
