import React, { useState } from 'react';
import { Freebie, Booth, HALLS, BOOTHS } from '../data';
import { 
  Check, 
  Trash2, 
  MapPin, 
  Navigation, 
  ListTodo, 
  Trophy, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Footprints
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  planOptimalRoute, 
  getConvenientRecommendations, 
  estimateTotalDistance, 
  getGlobalCoordinates, 
  getDistance 
} from '../utils/routeOptimizer';

interface UserChecklistProps {
  checklist: Array<{ freebie: Freebie; booth: Booth }>;
  route: Booth[];
  isClaimed: (freebieId: string) => boolean;
  onToggleClaimed: (freebieId: string) => void;
  onRemoveFromChecklist: (freebieId: string) => void;
  onRemoveFromRoute: (boothId: string) => void;
  onFocusBooth: (boothId: string, hallId: string) => void;
  onClearChecklist: () => void;
  onClearRoute: () => void;
  onSetRoute?: (route: Booth[]) => void;
  onAddRecommended?: (booth: Booth) => void;
}

export default function UserChecklist({
  checklist,
  route,
  isClaimed,
  onToggleClaimed,
  onRemoveFromChecklist,
  onRemoveFromRoute,
  onFocusBooth,
  onClearChecklist,
  onClearRoute,
  onSetRoute,
  onAddRecommended
}: UserChecklistProps) {
  const [activeRouteTab, setActiveRouteTab] = useState<'stops' | 'recommend'>('stops');
  const [routeViewMode, setRouteViewMode] = useState<'optimal' | 'hall'>('optimal');

  const totalFreebies = checklist.length;
  const claimedCount = checklist.filter(item => isClaimed(item.freebie.id)).length;
  const progressPercent = totalFreebies > 0 ? Math.round((claimedCount / totalFreebies) * 100) : 0;

  // Group route booths by Hall (for Hall-grouped view)
  const groupedRoute = route.reduce<Record<string, Booth[]>>((acc, booth) => {
    if (!acc[booth.hall]) {
      acc[booth.hall] = [];
    }
    acc[booth.hall].push(booth);
    return acc;
  }, {});

  // Sort halls based on sequential flow: 1.1H -> 2.1H -> 3.1H -> 4.1H -> 5.1H -> 6.1H -> 8.1H
  const hallSeqOrder = ['1.1H', '2.1H', '3.1H', '4.1H', '5.1H', '6.1H', '8.1H'];
  const sortedRouteHalls = Object.keys(groupedRoute).sort((a, b) => {
    return hallSeqOrder.indexOf(a) - hallSeqOrder.indexOf(b);
  });

  // Calculate total distance in meters
  const totalMeters = estimateTotalDistance(route);
  const estimatedMinutes = Math.max(1, Math.round(totalMeters / 70)); // Assuming 70m per min average walking speed

  // Fetch convenient along-the-way recommendations
  const recommendations = getConvenientRecommendations(route, BOOTHS, 3);

  const handleOptimizeRoute = () => {
    if (onSetRoute && route.length > 1) {
      const optimized = planOptimalRoute(route);
      onSetRoute(optimized);
      setRouteViewMode('optimal');
    }
  };

  // Helper to find the step-by-step distance
  const getStepDistance = (fromBooth: Booth | null, toBooth: Booth) => {
    const fromCoords = fromBooth ? getGlobalCoordinates(fromBooth) : { x: 400, y: 850 }; // South Entrance if null
    const toCoords = getGlobalCoordinates(toBooth);
    return Math.round(getDistance(fromCoords, toCoords) * 0.8);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* ========================================= */}
      {/* ====== PART 1: FREEBIE CHECKLIST ======== */}
      {/* ========================================= */}
      <div id="freebie-checklist-panel" className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[60vh] min-h-[400px] md:h-[480px]">
        
        {/* Panel Header */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-zinc-100 text-zinc-850 border border-zinc-200">
                <ListTodo className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-black text-sm font-display">我的無料採集清單</h3>
            </div>
            {totalFreebies > 0 && (
              <button
                onClick={onClearChecklist}
                className="text-zinc-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="清空清單"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            )}
          </div>

          {/* Progress Tracker */}
          {totalFreebies > 0 ? (
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Trophy className="w-3.5 h-3.5 text-zinc-600" />
                  <span>採集進度 ({claimedCount}/{totalFreebies})</span>
                </span>
                <span className="text-xs font-mono font-bold text-black">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-black h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              {progressPercent === 100 && (
                <p className="text-[10px] text-zinc-600 font-bold mt-1 text-center font-display">
                  🎉 太強了！您已成功解鎖清單上所有的無料！
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Checklist Scroll Container */}
        <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {checklist.map((item) => {
              const claimed = isClaimed(item.freebie.id);
              return (
                <motion.div
                  key={item.freebie.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                    claimed
                      ? 'bg-zinc-50 border-zinc-200 opacity-60'
                      : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Square checkbox toggle */}
                    <button
                      onClick={() => onToggleClaimed(item.freebie.id)}
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        claimed
                          ? 'bg-black border-black text-white'
                          : 'border-zinc-300 hover:border-black bg-white'
                      }`}
                    >
                      {claimed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <span className={`text-xs font-bold line-clamp-2 leading-tight ${claimed ? 'line-through text-zinc-400 font-normal' : 'text-zinc-900 font-display'}`}>
                        {item.freebie.name}
                      </span>
                      
                      {/* Subtitle with focal link */}
                      <button
                        onClick={() => onFocusBooth(item.booth.id, item.booth.hall)}
                        className="text-[10.5px] text-zinc-500 hover:text-zinc-950 font-bold text-left mt-0.5 flex items-center gap-1 transition-colors group cursor-pointer"
                        title="在地圖上定位展位"
                      >
                        <MapPin className="w-3 h-3 text-zinc-400 group-hover:text-black" />
                        <span className="underline decoration-dotted">{item.booth.name} ({item.booth.hall} {item.booth.code})</span>
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromChecklist(item.freebie.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-zinc-50 transition-all cursor-pointer"
                    title="從清單中移除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {checklist.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <ListTodo className="w-10 h-10 text-zinc-200 mb-2 stroke-[1.5]" />
              <p className="text-xs font-bold text-zinc-500">無料清單目前空空如也</p>
              <p className="text-[10.5px] text-zinc-400 mt-1 max-w-[200px]">點擊地圖上的攤位，並將您感興趣的免費周邊加入清單吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* ====== PART 2: TOUR ROUTE PLANNER ======= */}
      {/* ========================================= */}
      <div id="tour-route-panel" className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[60vh] min-h-[400px] md:h-[480px]">
        
        {/* Panel Header & Sub-Tabs */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveRouteTab('stops')}
                className={`flex items-center gap-2 pb-1.5 text-sm font-bold relative transition-colors cursor-pointer ${
                  activeRouteTab === 'stops' ? 'text-black' : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>遊覽路線規劃</span>
                {route.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold">
                    {route.length}
                  </span>
                )}
                {activeRouteTab === 'stops' && (
                  <motion.div layoutId="activeRouteTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </button>

              <button
                onClick={() => setActiveRouteTab('recommend')}
                className={`flex items-center gap-2 pb-1.5 text-sm font-bold relative transition-colors cursor-pointer ${
                  activeRouteTab === 'recommend' ? 'text-black' : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>順路熱門推介</span>
                {recommendations.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-orange-50 border border-orange-200 text-orange-600 font-bold animate-pulse">
                    {recommendations.length}
                  </span>
                )}
                {activeRouteTab === 'recommend' && (
                  <motion.div layoutId="activeRouteTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </button>
            </div>

            {route.length > 0 && activeRouteTab === 'stops' && (
              <button
                onClick={onClearRoute}
                className="text-zinc-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="清空路線"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            )}
          </div>

          {/* Stats Slogan */}
          {route.length > 0 && activeRouteTab === 'stops' && (
            <div className="flex flex-col gap-2 mb-3 bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px] text-zinc-600 font-semibold flex-wrap gap-1.5">
                <span className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-zinc-500" />
                  <span>估算總行程：</span>
                  <strong className="text-black">{totalMeters} 米</strong>
                  <span className="text-zinc-400">|</span>
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>步行時間：</span>
                  <strong className="text-black">~{estimatedMinutes} 分鐘</strong>
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => setRouteViewMode(prev => prev === 'optimal' ? 'hall' : 'optimal')}
                    className="px-2 py-0.5 rounded text-[9.5px] font-bold border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 transition-all cursor-pointer"
                  >
                    {routeViewMode === 'optimal' ? '切換為展館分組' : '切換為最佳順序'}
                  </button>
                </div>
              </div>

              {route.length > 1 && (
                <button
                  onClick={handleOptimizeRoute}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[10.5px] font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>一鍵智能優化（最順路 TSP 排序）</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: STOPS & NAVIGATION TIMELINE */}
        {activeRouteTab === 'stops' && (
          <div className="flex-1 overflow-y-auto mb-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {route.length > 0 ? (
              routeViewMode === 'optimal' ? (
                /* LINEAR WALK-BY-WALK TIMELINE */
                <div className="relative pl-5 border-l-2 border-zinc-150 ml-3.5 space-y-3.5 py-2">
                  {/* Start Point */}
                  <div className="relative">
                    <div className="absolute -left-[24.5px] top-1.5 w-2 h-2 rounded-full bg-orange-600 ring-4 ring-orange-100" />
                    <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider font-mono">
                      起點：南大廳 7.1 檢票通道
                    </div>
                  </div>

                  {route.map((booth, idx) => {
                    const stepDist = getStepDistance(idx === 0 ? null : route[idx - 1], booth);
                    return (
                      <div key={booth.id} className="relative">
                        {/* Connecting Step Distance between stops */}
                        <div className="absolute -left-[20px] -top-3.5 h-3.5 flex items-center">
                          <span className="text-[8.5px] font-mono font-bold text-zinc-400 bg-white px-1 leading-none">
                            {stepDist} 米
                          </span>
                        </div>

                        {/* Stop Number Pin */}
                        <div className="absolute -left-[28.5px] top-0.5 w-4.5 h-4.5 rounded-full bg-black text-white text-[9.5px] font-mono font-black flex items-center justify-center ring-4 ring-zinc-50">
                          {idx + 1}
                        </div>

                        {/* Stop Card */}
                        <div className="px-3.5 py-2 bg-white border border-zinc-200 rounded-lg flex items-center justify-between hover:border-zinc-400 group transition-all">
                          <div className="min-w-0 text-left">
                            <button
                              onClick={() => onFocusBooth(booth.id, booth.hall)}
                              className="text-xs font-bold text-zinc-850 group-hover:text-black leading-tight transition-colors flex items-center gap-1.5 cursor-pointer font-display"
                              title="在地圖上定位攤位"
                            >
                              <span className="text-[9.5px] font-mono text-zinc-400 font-bold group-hover:text-black bg-zinc-100 px-1 py-0.2 rounded border border-zinc-200">
                                {booth.hall} {booth.code}
                              </span>
                              <span className="truncate">{booth.name}</span>
                            </button>
                            <p className="text-[10px] text-zinc-400 font-medium line-clamp-2 mt-0.5">
                              {booth.freebies.length > 0 ? `含有 ${booth.freebies.length} 個可採集無料` : '暫無無料贈送'}
                            </p>
                          </div>

                          <button
                            onClick={() => onRemoveFromRoute(booth.id)}
                            className="text-[10px] text-zinc-400 hover:text-red-600 font-bold transition-colors cursor-pointer opacity-0 group-hover:opacity-100 pl-2 shrink-0"
                            title="從路線移除"
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* End node */}
                  <div className="relative">
                    <div className="absolute -left-[24.5px] top-1 w-2 h-2 rounded-full bg-zinc-400 ring-4 ring-zinc-100" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">終點：漫展滿載而歸</span>
                  </div>
                </div>
              ) : (
                /* GROUPED BY HALLS VIEW */
                <div className="relative pl-4 border-l-2 border-zinc-100 ml-2 space-y-4 py-2">
                  {sortedRouteHalls.map((hallId) => {
                    const booths = groupedRoute[hallId];
                    const hallInfo = HALLS.find(h => h.id === hallId);

                    return (
                      <div key={hallId} className="relative">
                        {/* Timeline Node Point */}
                        <div className="absolute -left-[21px] top-2 w-2 h-2 rounded-full bg-zinc-950 ring-4 ring-zinc-100" />
                        
                        {/* Hall Header */}
                        <div className="mb-2 text-left">
                          <span className="text-[10.5px] font-bold text-zinc-800 font-mono bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 rounded">
                            {hallId}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold ml-1.5">
                            {hallInfo?.theme.split(' / ')[0]}
                          </span>
                        </div>

                        {/* Booths inside this Hall */}
                        <div className="space-y-1.5 pl-1.5">
                          {booths.map((booth) => (
                            <div
                              key={booth.id}
                              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg flex items-center justify-between hover:border-zinc-400 group transition-all"
                            >
                              <button
                                onClick={() => onFocusBooth(booth.id, booth.hall)}
                                className="text-xs font-bold text-zinc-850 group-hover:text-black text-left min-w-0 transition-colors flex items-center gap-1.5 cursor-pointer font-display"
                                title="在地圖上定位攤位"
                              >
                                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-black">
                                  [{booth.code}]
                                </span>
                                <span className="truncate">{booth.name}</span>
                              </button>

                              <button
                                onClick={() => onRemoveFromRoute(booth.id)}
                                className="text-[10px] text-zinc-400 hover:text-red-600 font-bold transition-colors cursor-pointer opacity-0 group-hover:opacity-100 pl-2 shrink-0"
                                title="從路線移除"
                              >
                                移除
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <Navigation className="w-10 h-10 text-zinc-200 mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-zinc-500">遊覽路線目前空空如也</p>
                <p className="text-[10.5px] text-zinc-400 mt-1 max-w-[200px]">將您心儀的攤位加入個人遊覽路線，我們將為您推薦最佳逛展順序！</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: CONVENIENT RECOMMENDATIONS */}
        {activeRouteTab === 'recommend' && (
          <div className="flex-1 overflow-y-auto mb-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent flex flex-col justify-between">
            <div>
              <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl mb-4 text-left">
                <div className="flex gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-orange-950">AI 順路無料推薦</h4>
                    <p className="text-[10px] text-orange-850 mt-0.5 leading-relaxed">
                      基於您規劃的遊覽站點，系統為您推薦距離最近、最順路且含有無料可以領取的周邊攤位！順路帶走，效率加倍。
                    </p>
                  </div>
                </div>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((booth) => {
                    // Find closest planned booth
                    const coordCand = getGlobalCoordinates(booth);
                    let nearestPlannedBooth: Booth | null = null;
                    let minDistance = Infinity;
                    
                    for (const rb of route) {
                      const coordRb = getGlobalCoordinates(rb);
                      const d = getDistance(coordCand, coordRb);
                      if (d < minDistance) {
                        minDistance = d;
                        nearestPlannedBooth = rb;
                      }
                    }

                    const distInMeters = nearestPlannedBooth 
                      ? Math.round(minDistance * 0.8) 
                      : null;

                    return (
                      <motion.div
                        key={booth.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-white border border-zinc-200 rounded-xl flex items-start justify-between gap-3 text-left hover:border-zinc-300 transition-all shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.2 rounded">
                              {booth.hall} {booth.code}
                            </span>
                            {distInMeters !== null && (
                              <span className="text-[9px] font-mono text-zinc-400 font-bold">
                                距離 planned：僅 {distInMeters} 米
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-zinc-900 mt-1.5 font-display line-clamp-2">
                            {booth.name}
                          </h5>
                          
                          {/* Reason */}
                          {nearestPlannedBooth && (
                            <p className="text-[9.5px] text-zinc-400 font-semibold mt-0.5 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                              <span>與已選的「{nearestPlannedBooth.name}」在同一區域</span>
                            </p>
                          )}

                          {/* Freebie previews */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {booth.freebies.map(f => (
                              <span key={f.id} className="text-[8.5px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                🎁 {f.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => onAddRecommended && onAddRecommended(booth)}
                          className="shrink-0 text-[10.5px] font-bold bg-zinc-950 text-white hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-950 hover:border-zinc-800 transition-all shadow-sm cursor-pointer"
                        >
                          順路加入
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <Compass className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-500">暫無順路推薦</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 max-w-[200px] mx-auto">
                    請先在左側或地圖中加入 1-2 個站點，我們將立即為您計算附近極近的無料攤位！
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
