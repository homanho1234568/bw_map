import React, { useState, useEffect } from 'react';
import type { Booth, Freebie, Hall } from '../types';
import { fetchBooths, fetchHalls } from '../services/api';
import MapCanvas from '../components/MapCanvas';
import BoothDetailModal from '../components/BoothDetailModal';
import AIChatBot from '../components/AIChatBot';
import UserChecklist from '../components/UserChecklist';
import WeatherWidget from '../components/WeatherWidget';
import { 
  Search, 
  Filter, 
  Compass, 
  Gift, 
  MapPin, 
  Sparkles, 
  ListTodo, 
  Info, 
  Navigation,
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MapPage() {
  const [BOOTHS, setBOOTHS] = useState<Booth[]>([]);
  const [HALLS, setHALLS] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [fetchedHalls, fetchedBooths] = await Promise.all([fetchHalls(), fetchBooths()]);
      setHALLS(fetchedHalls);
      setBOOTHS(fetchedBooths);
      setLoading(false);
    }
    loadData();
  }, []);

  // --- States ---
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [hoveredBoothId, setHoveredBoothId] = useState<string | null>(null);
  const [highlightedBoothId, setHighlightedBoothId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [checklist, setChecklist] = useState<Array<{ freebie: Freebie; booth: Booth }>>([]);
  const [route, setRoute] = useState<Booth[]>([]);
  const [claimedFreebies, setClaimedFreebies] = useState<string[]>([]);

  // --- Load localStorage Data ---
  useEffect(() => {
    try {
      const storedChecklist = localStorage.getItem('bw2026_checklist');
      if (storedChecklist) setChecklist(JSON.parse(storedChecklist));

      const storedRoute = localStorage.getItem('bw2026_route');
      if (storedRoute) setRoute(JSON.parse(storedRoute));

      const storedClaimed = localStorage.getItem('bw2026_claimed');
      if (storedClaimed) setClaimedFreebies(JSON.parse(storedClaimed));
    } catch (err) {
      console.error('Error loading localStorage data:', err);
    }
  }, []);

  // --- Save to localStorage ---
  useEffect(() => {
    localStorage.setItem('bw2026_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('bw2026_route', JSON.stringify(route));
  }, [route]);

  useEffect(() => {
    localStorage.setItem('bw2026_claimed', JSON.stringify(claimedFreebies));
  }, [claimedFreebies]);

  // --- Action Handlers ---
  const handleSelectHall = (hallId: string | null) => {
    setSelectedHallId(hallId);
    setHighlightedBoothId(null);
  };

  const handleSelectBooth = (boothId: string) => {
    setSelectedBoothId(boothId);
  };

  const handleFocusBooth = (boothId: string, hallId: string) => {
    setSelectedHallId(hallId);
    setHighlightedBoothId(boothId);
    setSelectedBoothId(boothId);
    
    // Smooth scroll map container into view
    setTimeout(() => {
      const mapElem = document.getElementById('map-container');
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const handleToggleChecklist = (freebie: Freebie, booth: Booth) => {
    const isAlreadyIn = checklist.some(item => item.freebie.id === freebie.id);
    if (isAlreadyIn) {
      setChecklist(prev => prev.filter(item => item.freebie.id !== freebie.id));
      // also remove from claimed if removed from checklist
      setClaimedFreebies(prev => prev.filter(id => id !== freebie.id));
    } else {
      setChecklist(prev => [...prev, { freebie, booth }]);
      // Auto add booth to route if they add its freebie! Convenient!
      handleToggleRoute(booth, true);
    }
  };

  const handleToggleRoute = (booth: Booth, forceAdd = false) => {
    const isAlreadyIn = route.some(item => item.id === booth.id);
    if (isAlreadyIn && !forceAdd) {
      setRoute(prev => prev.filter(item => item.id !== booth.id));
    } else if (!isAlreadyIn) {
      setRoute(prev => [...prev, booth]);
    }
  };

  const isClaimed = (freebieId: string) => claimedFreebies.includes(freebieId);

  const handleToggleClaimed = (freebieId: string) => {
    if (claimedFreebies.includes(freebieId)) {
      setClaimedFreebies(prev => prev.filter(id => id !== freebieId));
    } else {
      setClaimedFreebies(prev => [...prev, freebieId]);
    }
  };

  // --- Filtered Booths in Directory ---
  const filteredBoothsDirectory = BOOTHS.filter(booth => {
    if (filterCategory !== 'all' && booth.category !== filterCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        booth.name.toLowerCase().includes(q) ||
        booth.code.toLowerCase().includes(q) ||
        booth.tags.some(t => t.toLowerCase().includes(q)) ||
        booth.freebies.some(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddRecommended = (booth: Booth) => {
    // Add all its freebies to the checklist
    setChecklist(prev => {
      let updated = [...prev];
      booth.freebies.forEach(f => {
        if (!updated.some(item => item.freebie.id === f.id)) {
          updated.push({ freebie: f, booth });
        }
      });
      return updated;
    });
    // Add the booth to the route
    setRoute(prev => {
      if (!prev.some(b => b.id === booth.id)) {
        return [...prev, booth];
      }
      return prev;
    });
  };

  const selectedBoothObj = BOOTHS.find(b => b.id === selectedBoothId) || null;

  // Filter Categories list
  const categories = [
    { id: 'all', name: '全部展區' },
    { id: 'game', name: '遊戲世界' },
    { id: 'virtual', name: '虛擬樂園' },
    { id: 'model', name: '模玩英雄' },
    { id: 'tabletop', name: '一起桌遊' },
    { id: 'creator', name: 'UP主空間' },
    { id: 'bazaar', name: '同人集市' },
    { id: 'romance', name: '戀戀心聲' },
    { id: 'tech', name: '科技體驗' }
  ];

  // --- Derived State ---
  const totalExpected = checklist.length;
  const totalCollected = claimedFreebies.length;
  const progressPercentage = totalExpected === 0 ? 0 : Math.round((totalCollected / totalExpected) * 100);

  // --- Countdown State ---
  const targetDate = new Date('2026-07-10T09:00:00+08:00').getTime(); // July 10, 2026 9:00 AM CST
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, targetDate - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, targetDate - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (ms: number) => {
    if (ms === 0) return '展會已開始！';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium font-sans">載入地圖數據中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 font-sans selection:bg-black selection:text-white pb-16 antialiased">
      
      {/* Top Premium Notion-Style Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSelectHall(null)}>
              <span className="w-6 h-6 rounded bg-black flex items-center justify-center text-[10px] font-black text-white font-display">
                BW
              </span>
              <span className="font-display font-extrabold text-sm tracking-tight text-black flex items-center gap-1.5">
                BW 2026
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                  MAP
                </span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-zinc-500">
              <span className="w-1 h-1 rounded-full bg-zinc-300" />
              <button 
                onClick={() => handleSelectHall(null)}
                className={`hover:text-black transition-colors cursor-pointer py-1 ${!selectedHallId ? 'text-black border-b-2 border-black font-bold' : ''}`}
              >
                全場館總覽
              </button>
              {HALLS.map(h => (
                <button 
                  key={h.id}
                  onClick={() => handleSelectHall(h.id)}
                  className={`hover:text-black transition-colors cursor-pointer py-1 ${selectedHallId === h.id ? 'text-black border-b-2 border-black font-bold' : ''}`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-zinc-900 text-white border border-zinc-800 px-3 py-1.5 rounded-lg shadow-sm shrink-0">
              <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">展會倒數</span>
              <span className="text-xs font-mono font-bold tracking-tight whitespace-nowrap">{formatCountdown(timeLeft)}</span>
            </div>

            {/* Exhibition Exploration Progress Bar */}
            <div className="hidden sm:flex items-center gap-3 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm shrink-0">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-800 w-28 leading-none">
                  <span>展會探索完成度</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="h-1.5 w-28 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
              </div>
              <div className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded leading-none">
                {totalCollected} / {totalExpected}
              </div>
            </div>

            <button 
              onClick={() => {
                setChecklist([]);
                setRoute([]);
                setClaimedFreebies([]);
                localStorage.removeItem('bw2026_checklist');
                localStorage.removeItem('bw2026_route');
                localStorage.removeItem('bw2026_claimed');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer bg-white shadow-sm"
            >
              重置數據
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-all shadow-sm cursor-pointer border border-black">
              模擬登入
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-white border-b border-zinc-200 pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono">
              BILIBILI WORLD 2026
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium font-mono">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>上海 · 國家會展中心 (7.10 - 7.12)</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black font-display mb-4">
            BW 2026 互動展會地圖
          </h1>
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            極簡 Notion 風格的無料贈品與路徑規劃工具。整合 7 大展館、人氣同人攤位與品牌展位，
            提供無料領取條件追蹤、地圖高亮引導與 AI 小電視助手，助您無憂規劃完美漫展行程。
          </p>

          <div className="flex justify-center gap-4 mt-8 select-none font-mono">
            <div className="px-5 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">已收錄攤位</div>
              <div className="text-xl font-bold text-black mt-0.5">{BOOTHS.length} <span className="text-xs font-normal text-zinc-400">個</span></div>
            </div>
            <div className="px-5 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">可收集無料</div>
              <div className="text-xl font-bold text-black mt-0.5">
                {BOOTHS.reduce((sum, b) => sum + b.freebies.length, 0)} <span className="text-xs font-normal text-zinc-400">款</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Search & Category Filter bar */}
        <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                id="search-input"
                type="text"
                placeholder="搜尋攤位名稱、代號 (如: 3A33)、遊戲作品、或無料贈品 (如: 徽章, 明信片)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-black text-sm text-black placeholder-zinc-400 rounded-lg pl-11 pr-10 py-3.5 focus:outline-none transition-all focus:ring-1 focus:ring-black"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black text-xs font-bold cursor-pointer"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-2 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span>篩選專區:</span>
            </span>
            <div className="flex gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 cursor-pointer ${
                    filterCategory === cat.id
                      ? 'bg-black border-black text-white shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HUD Grid: Left (Map + List) & Right (AI Guide) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Map & Booth list (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Map Canvas Card */}
            <div id="map-container" className="scroll-mt-24">
              <MapCanvas 
                halls={HALLS}
                booths={BOOTHS}

                selectedHallId={selectedHallId}
                onSelectHall={handleSelectHall}
                selectedBoothId={selectedBoothId}
                onSelectBooth={handleSelectBooth}
                hoveredBoothId={hoveredBoothId}
                setHoveredBoothId={setHoveredBoothId}
                highlightedBoothId={highlightedBoothId}
                filterCategory={filterCategory}
                searchQuery={searchQuery}
                route={route}
              />
            </div>

            {/* Expanded Booth Directory below map */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded bg-black" />
                  <h3 className="font-bold text-black text-sm font-display">
                    {selectedHallId ? `${selectedHallId} 館` : '全場館'} 攤位快速目錄
                  </h3>
                  <span className="text-[10px] font-mono bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-zinc-500">
                    顯示 {selectedHallId ? filteredBoothsDirectory.filter(b => b.hall === selectedHallId).length : filteredBoothsDirectory.length} 筆
                  </span>
                </div>
                <span className="text-xs text-zinc-400 hidden sm:inline font-medium">
                  點擊地圖按鈕，或在此選取攤位以定位
                </span>
              </div>

              {/* Grid or List list of Directory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] lg:max-h-[360px] overflow-y-auto pr-1">
                {filteredBoothsDirectory
                  .filter(b => !selectedHallId || b.hall === selectedHallId)
                  .map((booth) => {
                    const hasFreebies = booth.freebies.length > 0;
                    const isHighlighted = highlightedBoothId === booth.id;
                    return (
                      <button
                        key={booth.id}
                        onClick={() => handleFocusBooth(booth.id, booth.hall)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 group flex justify-between items-start gap-3 cursor-pointer ${
                          isHighlighted 
                            ? 'bg-zinc-50 border-black ring-1 ring-black' 
                            : 'bg-white border-zinc-200 hover:border-zinc-450 hover:bg-zinc-50/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                              {booth.hall} {booth.code}
                            </span>
                            {booth.featured && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-black font-bold tracking-wide border border-zinc-200">
                                熱門
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-xs font-bold text-black group-hover:text-black transition-colors line-clamp-2 font-display">
                            {booth.name}
                          </h4>
                          <p className="text-[10.5px] text-zinc-500 line-clamp-2 mt-1 leading-normal font-sans">
                            {booth.description}
                          </p>
                        </div>

                        {/* Freebie tag indicator */}
                        {hasFreebies && (
                          <div className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-600 text-[9px] font-bold shrink-0 flex items-center gap-1">
                            <Gift className="w-3 h-3 text-zinc-400" />
                            <span>{booth.freebies.length}無料</span>
                          </div>
                        )}
                      </button>
                    );
                  })}

                {filteredBoothsDirectory.filter(b => !selectedHallId || b.hall === selectedHallId).length === 0 && (
                  <div className="col-span-2 text-center py-16 text-zinc-400">
                    <HelpCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2.5" />
                    <p className="text-xs font-bold text-zinc-500">查無任何匹配的攤位</p>
                    <p className="text-[10.5px] text-zinc-400 mt-1">請嘗試縮減過濾字詞或切換篩選專區</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Guide bot (4 cols on lg) */}
          <div className="lg:col-span-4 h-full">
            <AIChatBot 
              onFocusBooth={handleFocusBooth}
              allBooths={BOOTHS.map(b => ({ id: b.id, name: b.name, hall: b.hall, code: b.code }))}
            />
          </div>
        </div>

        {/* Full lower section: User's planned checklist & route path */}
         <UserChecklist 
          halls={HALLS}
          booths={BOOTHS}

          checklist={checklist}
          route={route}
          isClaimed={isClaimed}
          onToggleClaimed={handleToggleClaimed}
          onRemoveFromChecklist={(id) => setChecklist(prev => prev.filter(item => item.freebie.id !== id))}
          onRemoveFromRoute={(id) => setRoute(prev => prev.filter(item => item.id !== id))}
          onFocusBooth={handleFocusBooth}
          onClearChecklist={() => {
            setChecklist([]);
            setClaimedFreebies([]);
          }}
          onClearRoute={() => setRoute([])}
          onSetRoute={setRoute}
          onAddRecommended={handleAddRecommended}
        />

        {/* Handy Info Panel */}
        <section className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-black text-sm flex items-center gap-1.5 mb-4 font-display">
            <Info className="w-4 h-4 text-zinc-500" />
            <span>BW 2026 夏季漫展參展須知與小撇步</span>
          </h3>

          <WeatherWidget />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-zinc-500 leading-relaxed">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h4 className="font-bold text-black mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                <span>無料領取黃金時間</span>
              </h4>
              <p className="text-[11px] text-zinc-500">各大官方展台（如星鐵、原神、黑神話）的無料往往非常熱門，建議於上午 **9:30 - 11:30** 優先前往排隊收集，下午大機率會發放完畢喔！</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h4 className="font-bold text-black mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                <span>排隊與UID證明備份</span>
              </h4>
              <p className="text-[11px] text-zinc-500">部分二次元遊戲攤位需要出示您的遊戲登入畫面或 UID。由於場館內人數眾多、信號可能不佳，建議提前將遊戲登入畫面和 UID 截圖備份在手機中，避免現場加載不出來！</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h4 className="font-bold text-black mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                <span>防暑補水與大容量袋</span>
              </h4>
              <p className="text-[11px] text-zinc-500">7月的上海非常炎熱，場館內走動頻繁，請自備礦泉水及小風扇。此外，帶上一個厚實的雙肩包，或優先前往 B站會員購領取大容量紙提袋，更方便容納戰利品！</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1 font-mono">
          <p>© 2026 BW 互動展會地圖 · 本導覽為同人非官方製作工具</p>
          <p className="text-[10px] text-zinc-300">所有圖像及商標權利歸屬各自版權所有方（Bilibili, miHoYo, 鷹角網絡, 庫洛遊戲等）所有。</p>
        </div>
        <div className="flex gap-4">
          <a href="https://bw.bilibili.com" target="_blank" rel="noopener noreferrer" className="hover:text-black font-bold transition-colors flex items-center gap-1 text-zinc-500 font-display">
            <span>前往 BW 官方網站</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

      {/* --- Overlay Modals --- */}
      <AnimatePresence>
        {selectedBoothObj && (
          <BoothDetailModal 
            booth={selectedBoothObj}
            onClose={() => setSelectedBoothId(null)}
            isInChecklist={(freebieId) => checklist.some(item => item.freebie.id === freebieId)}
            isInRoute={(boothId) => route.some(item => item.id === boothId)}
            onToggleChecklist={handleToggleChecklist}
            onToggleRoute={handleToggleRoute}
            isClaimed={isClaimed}
            onToggleClaimed={handleToggleClaimed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
