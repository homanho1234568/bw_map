import React, { useState, useEffect, useRef } from 'react';
import type { Booth, Hall } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Gift, MapPin, Compass, Info, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGlobalCoordinates, HALL_POSITIONS } from '../utils/routeOptimizer';

interface MapCanvasProps {
  halls: Hall[];
  booths: Booth[];
  selectedHallId: string | null;
  onSelectHall: (hallId: string | null) => void;
  selectedBoothId: string | null;
  onSelectBooth: (boothId: string) => void;
  hoveredBoothId: string | null;
  setHoveredBoothId: (boothId: string | null) => void;
  highlightedBoothId: string | null;
  filterCategory: string;
  searchQuery: string;
  route?: Booth[];
}

export default function MapCanvas({
  halls,
  booths,
  selectedHallId,
  onSelectHall,
  selectedBoothId,
  onSelectBooth,
  hoveredBoothId,
  setHoveredBoothId,
  highlightedBoothId,
  filterCategory,
  searchQuery,
  route = []
}: MapCanvasProps) {
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const [zoomLevel, setZoomLevel] = useState<number>(0.35); // Fit 1500x1500 in ~550px container by default
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const detailMapRef = useRef<HTMLDivElement>(null);

  // Mouse drag-to-pan state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left-click
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsDragging(true);

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Threshold of 3px to differentiate drag from single click
    if (Math.hypot(dx, dy) > 3) {
      hasDraggedRef.current = true;
    }

    if (hasDraggedRef.current) {
      // Adjust dragging speed by zoom level so it feels 1:1 with cursor
      setPan({
        x: clamp(panStartRef.current.x + dx / zoomLevel, -750, 750),
        y: clamp(panStartRef.current.y + dy / zoomLevel, -750, 750)
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    // Keep hasDraggedRef true for a tiny tick to prevent immediate click selection triggering on booth buttons
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  };

  // Capture double-click to zoom in
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    if (!detailMapRef.current) return;

    const rect = detailMapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Viewport center relative to the container
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Click position relative to viewport center
    const mx = clickX - centerX;
    const my = clickY - centerY;

    const nextZoom = Math.min(10.0, zoomLevel + 0.35);

    if (nextZoom !== zoomLevel) {
      const factor = (1 / zoomLevel) - (1 / nextZoom);
      const nextPanX = clamp(pan.x - mx * factor, -750, 750);
      const nextPanY = clamp(pan.y - my * factor, -750, 750);

      setZoomLevel(nextZoom);
      setPan({ x: nextPanX, y: nextPanY });
    }
  };

  // Capture mouse wheel scroll for precise zoom around cursor
  useEffect(() => {
    const container = detailMapRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Stop entire page from scrolling while zooming

      const zoomFactor = 1.08;
      let nextZoom = zoomLevel;
      if (e.deltaY < 0) {
        nextZoom = Math.min(10.0, zoomLevel * zoomFactor);
      } else {
        nextZoom = Math.max(0.25, zoomLevel / zoomFactor);
      }

      if (nextZoom !== zoomLevel) {
        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Viewport center relative to the container
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Click position relative to viewport center
        const mx = clickX - centerX;
        const my = clickY - centerY;

        // Apply our stunning formula:
        const factor = (1 / zoomLevel) - (1 / nextZoom);
        const nextPanX = clamp(pan.x - mx * factor, -750, 750);
        const nextPanY = clamp(pan.y - my * factor, -750, 750);

        setZoomLevel(nextZoom);
        setPan({ x: nextPanX, y: nextPanY });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoomLevel, pan]);

  // Unified Camera Effect to center on focused element (booth or hall)
  useEffect(() => {
    // 1. Check if there's a focused booth (either highlighted or selected)
    const activeBoothId = highlightedBoothId || selectedBoothId;
    if (activeBoothId) {
      const booth = booths.find(b => b.id === activeBoothId);
      if (booth) {
        const targetZoom = 1.35; // A slightly higher zoom for booth focus
        setZoomLevel(targetZoom);
        
        // Sync parent/local state for hall selection if not matching
        if (selectedHallId !== booth.hall) {
          onSelectHall(booth.hall);
        }

        const coords = getGlobalCoordinates(booth);
        setPan({
          x: 750 - coords.x,
          y: 750 - coords.y
        });
        return; // Done
      }
    }

    // 2. Check if there's a selected hall
    if (selectedHallId) {
      const pos = HALL_POSITIONS[selectedHallId];
      if (pos) {
        const targetZoom = 1.1;
        setZoomLevel(targetZoom);
        setPan({
          x: 750 - pos.centerX,
          y: 750 - pos.centerY
        });
        return; // Done
      }
    }

    // 3. Fallback: reset zoom and center
    setZoomLevel(0.35);
    setPan({ x: 0, y: 0 });
  }, [highlightedBoothId, selectedBoothId, selectedHallId]);

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(10.0, prev + 0.15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.25, prev - 0.15));
  const handleResetZoom = () => {
    setZoomLevel(0.35);
    setPan({ x: 0, y: 0 });
    onSelectHall(null);
  };

  // Color mappings
  const getCategoryBgColor = (cat: string, isHovered: boolean, isHighlighted: boolean, isSelected: boolean) => {
    if (isSelected) return 'bg-black text-white border-black shadow-md scale-105 z-20 font-bold';
    if (isHighlighted) return 'bg-amber-100 text-amber-900 border-amber-400 shadow-md ring-2 ring-amber-400 z-30 scale-105 font-bold';
    if (isHovered) return 'bg-zinc-100 text-zinc-950 border-zinc-400 scale-102 z-10 shadow-xs';

    switch (cat) {
      case 'game': return 'bg-blue-50/90 border-blue-200 hover:border-blue-300 text-blue-900';
      case 'virtual': return 'bg-emerald-50/90 border-emerald-200 hover:border-emerald-300 text-emerald-900';
      case 'model': return 'bg-purple-50/90 border-purple-200 hover:border-purple-300 text-purple-900';
      case 'tabletop': return 'bg-pink-50/90 border-pink-200 hover:border-pink-300 text-pink-900';
      case 'creator': return 'bg-amber-50/90 border-amber-200 hover:border-amber-300 text-amber-900';
      case 'bazaar': return 'bg-rose-50/90 border-rose-200 hover:border-rose-300 text-rose-900';
      case 'romance': return 'bg-fuchsia-50/90 border-fuchsia-200 hover:border-fuchsia-300 text-fuchsia-900';
      case 'tech': return 'bg-cyan-50/90 border-cyan-200 hover:border-cyan-300 text-cyan-900';
      default: return 'bg-zinc-50 border-zinc-200 text-zinc-800';
    }
  };

  const isZoomedOut = zoomLevel < 0.75;
  const currentBoothObj = booths.find(b => b.id === selectedBoothId) || null;
  const currentHallObj = selectedHallId ? halls.find(h => h.id === selectedHallId) : null;

  return (
    <div id="map-container" ref={containerRef} className="relative w-full h-[60vh] min-h-[450px] lg:h-[580px] bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between">
      
      {/* Dynamic Map Control Ribbon */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex gap-2">
          {selectedHallId ? (
            <button 
              onClick={() => {
                onSelectHall(null);
                setZoomLevel(0.35);
                setPan({ x: 0, y: 0 });
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 text-black border border-zinc-200 rounded-lg shadow-sm font-extrabold text-xs transition-all cursor-pointer"
            >
              <span>🔍 顯示全館</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-white text-zinc-850 border border-zinc-200 rounded-lg text-xs font-black shadow-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
              <span>全館一體化互動地圖 (滑鼠滾輪縮放、按住拖曳、雙擊放大)</span>
            </div>
          )}
        </div>

        {/* Floating Zoom Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-white border border-zinc-200 rounded-lg shadow-sm">
          <button 
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-zinc-50 rounded text-zinc-500 hover:text-black transition-colors cursor-pointer"
            title="縮小"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-bold px-1.5 text-zinc-700 text-center w-11">{Math.round(zoomLevel * 100)}%</span>
          <button 
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-zinc-50 rounded text-zinc-500 hover:text-black transition-colors cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-zinc-50 rounded text-zinc-500 hover:text-black transition-colors border-l border-zinc-200 pl-2 cursor-pointer"
            title="適應全螢幕 / 重設"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage with Drag to Pan */}
      <div 
        ref={detailMapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className="flex-1 w-full overflow-hidden select-none relative bg-zinc-100/50"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Centering Inner Div */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          
          {/* Main 1000x1000 Canvas with Framer Motion */}
          <motion.div 
            className="relative bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-md shrink-0 origin-center"
            style={{ 
              width: '1500px',
              height: '1500px',
            }}
            animate={{ 
              scale: zoomLevel,
              x: pan.x,
              y: pan.y,
            }}
            transition={isDragging ? {
              type: 'tween',
              duration: 0.05,
              ease: 'linear'
            } : {
              type: 'spring',
              stiffness: 140,
              damping: 24,
              mass: 1
            }}
          >
            {/* Engineering Grid Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-65 pointer-events-none" />

            {/* SVG Clover Layout Geometry */}
              <svg viewBox="0 0 1500 1500" className="absolute inset-0 w-full h-full select-none z-0">
                {/* Radial Guide Ring Paths */}
                <circle cx="750" cy="750" r="277.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="750" cy="750" r="450" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="750" cy="750" r="630" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                
                {/* Radial spoke corridors */}
                <line x1="225" y1="225" x2="1275" y2="1275" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="1275" y1="225" x2="225" y2="1275" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Symmetrical Clover Leaf colored zones (4 petals) rotated by 45 degrees */}
                {/* NW Petal (Game Blue) */}
                <rect x="-270" y="-390" width="540" height="780" rx="96" transform="translate(345, 345) rotate(45)" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2.5" fillOpacity="0.3" strokeOpacity="0.4" />
                <text x="502" y="652" fill="#2563eb" className="text-[12.5px] font-black font-sans tracking-tight" textAnchor="middle">
                  遊戲世界展區 (3.1H / 4.1H)
                </text>
                
                {/* NE Petal (Virtual/Toys Pink) */}
                <rect x="-270" y="-390" width="540" height="780" rx="96" transform="translate(1155, 345) rotate(-45)" fill="#fdf2f8" stroke="#ec4899" strokeWidth="2.5" fillOpacity="0.3" strokeOpacity="0.4" />
                <text x="997" y="652" fill="#db2777" className="text-[12.5px] font-black font-sans tracking-tight" textAnchor="middle">
                  虛擬樂園 & 模玩 & 夢幻集市 (1.1H / 2.1H)
                </text>

                {/* SW Petal (Anime Stage Purple) */}
                <rect x="-270" y="-390" width="540" height="780" rx="96" transform="translate(345, 1155) rotate(-45)" fill="#faf5ff" stroke="#a855f7" strokeWidth="2.5" fillOpacity="0.3" strokeOpacity="0.4" />
                <text x="502" y="862" fill="#7c3aed" className="text-[12.5px] font-black font-sans tracking-tight" textAnchor="middle">
                  動漫舞台與遊戲世界 (5.1H / 6.1H)
                </text>

                {/* SE Petal (UP space / Ticket Amber) */}
                <rect x="-270" y="-390" width="540" height="780" rx="96" transform="translate(1155, 1155) rotate(45)" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2.5" fillOpacity="0.3" strokeOpacity="0.4" />
                <text x="997" y="862" fill="#d97706" className="text-[12.5px] font-black font-sans tracking-tight" textAnchor="middle">
                  創作者空間 & 大舞台 (7.1H / 8.1H)
                </text>

                {/* Central Plaza water circles */}
                <circle cx="750" cy="750" r="105" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="750" cy="750" r="93" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              </svg>

              {/* Central Plaza Floating Label */}
              <div className="absolute left-[652px] top-[652px] w-[195px] h-[195px] rounded-full bg-white border border-zinc-200 shadow-md flex flex-col items-center justify-center text-center z-10">
                <span className="text-[12px] font-black text-black font-display tracking-tight">中央廣場</span>
                <span className="text-[8px] text-zinc-400 font-mono font-bold">CENTRAL PLAZA</span>
                <div className="w-9 h-9 rounded-full border border-dashed border-zinc-200 mt-1 animate-[spin_60s_linear_infinite]" />
              </div>

              {/* Symmetrical Cardinal Lobbies with High Fidelity Real Layout Styling */}
              {/* North Lobby */}
              <div className="absolute top-[127px] left-[750px] -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="px-3.5 py-1.5 bg-red-600 text-white border border-red-700 rounded-lg text-[10px] font-black shadow-sm uppercase tracking-wider font-sans flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-300 animate-ping" />
                  <span>北廳入口 (VIP / 邀請函)</span>
                </div>
              </div>

              {/* South Lobby (Start point) */}
              <div className="absolute bottom-[127px] left-[750px] -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="px-4 py-2 bg-purple-700 text-white border border-purple-800 rounded-lg text-[10.5px] font-black shadow-md uppercase tracking-wider font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>南大廳 (7.1H 檢票大廳)</span>
                </div>
              </div>

              {/* West Lobby */}
              <div className="absolute left-[127px] top-[750px] -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="px-2.5 py-2.5 bg-zinc-800 text-white border border-zinc-950 rounded-lg text-[10px] font-black shadow-sm uppercase tracking-wider font-sans [writing-mode:vertical-lr] text-center flex items-center gap-1">
                  <span>西大廳 (2號線地鐵)</span>
                </div>
              </div>

              {/* East Lobby */}
              <div className="absolute right-[127px] top-[750px] -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="px-2.5 py-2.5 bg-zinc-800 text-white border border-zinc-950 rounded-lg text-[10px] font-black shadow-sm uppercase tracking-wider font-sans [writing-mode:vertical-lr] text-center flex items-center gap-1">
                  <span>東大廳入口</span>
                </div>
              </div>

              {/* Global Continuous Route Arrow Path Overlay */}
              {route.length >= 1 && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full z-15">
                  <defs>
                    <marker
                      id="arrow-marker-global"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c" />
                    </marker>
                  </defs>
                  
                  {/* Connecting Line from Entrance to the very first stop */}
                  {(() => {
                    const firstBooth = route[0];
                    const startX = 750;
                    const startY = 1410;
                    const firstCoords = getGlobalCoordinates(firstBooth);
                    return (
                      <g key="route-start">
                        <line
                          x1={startX}
                          y1={startY}
                          x2={firstCoords.x}
                          y2={firstCoords.y}
                          stroke="#f59e0b"
                          strokeWidth="5"
                          strokeOpacity="0.2"
                          strokeLinecap="round"
                        />
                        <line
                          x1={startX}
                          y1={startY}
                          x2={firstCoords.x}
                          y2={firstCoords.y}
                          stroke="#ea580c"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          strokeLinecap="round"
                          markerEnd="url(#arrow-marker-global)"
                        />
                        {/* Pulsing start center indicator */}
                        <circle cx={startX} cy={startY} r="6" fill="#ea580c" className="animate-pulse" />
                        <circle cx={startX} cy={startY} r="10" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeOpacity="0.4" />
                      </g>
                    );
                  })()}

                  {/* Consecutive path lines */}
                  {route.map((booth, idx) => {
                    if (idx === route.length - 1) return null;
                    const nextBooth = route[idx + 1];

                    const c1 = getGlobalCoordinates(booth);
                    const c2 = getGlobalCoordinates(nextBooth);

                    return (
                      <g key={`global-path-${booth.id}-${nextBooth.id}`}>
                        {/* Thick back-glow */}
                        <line
                          x1={c1.x}
                          y1={c1.y}
                          x2={c2.x}
                          y2={c2.y}
                          stroke="#f59e0b"
                          strokeWidth="6"
                          strokeOpacity="0.25"
                          strokeLinecap="round"
                        />
                        {/* Active directional dash line */}
                        <line
                          x1={c1.x}
                          y1={c1.y}
                          x2={c2.x}
                          y2={c2.y}
                          stroke="#ea580c"
                          strokeWidth="2.5"
                          strokeDasharray="6 5"
                          strokeLinecap="round"
                          markerEnd="url(#arrow-marker-global)"
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Render 8 Hall Cards simultaneously on the 1500x1500 grid */}
              {halls.map((hall) => {
                const pos = HALL_POSITIONS[hall.id];
                const isSelectedHall = selectedHallId === hall.id;
                
                const boothsInHall = booths.filter(b => b.hall === hall.id);
                const filteredBooths = boothsInHall.filter(booth => {
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

                return (
                  <div
                    key={hall.id}
                    onClick={(e) => {
                      // Only select hall if clicking background of the hall card
                      if (e.target === e.currentTarget) {
                        onSelectHall(isSelectedHall ? null : hall.id);
                      }
                    }}
                    className={`absolute bg-white/95 border-2 rounded-2xl p-2.5 transition-all duration-300 cursor-pointer overflow-hidden ${
                      isSelectedHall 
                        ? 'border-zinc-950 shadow-lg ring-4 ring-zinc-950/5 z-15' 
                        : 'border-zinc-200/80 hover:border-zinc-400 shadow-xs hover:shadow-md z-10'
                    }`}
                    style={{
                      left: `${pos.centerX}px`,
                      top: `${pos.centerY}px`,
                      width: `${pos.width}px`,
                      height: `${pos.height}px`,
                      transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`
                    }}
                  >
                    {/* Hall Watermark Code background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                      <span className="text-[104px] font-black font-mono text-zinc-200/25 tracking-tighter uppercase leading-none">
                        {hall.id}
                      </span>
                    </div>

                    {/* Hall Header labels */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none">
                      <div>
                        <span className="text-[12px] font-black font-mono text-zinc-800 bg-white/95 backdrop-blur-[1px] border border-zinc-200 px-2 py-0.5 rounded-md shadow-xs">
                          {hall.name}
                        </span>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1 bg-white/80 backdrop-blur-[1px] px-1.5 py-0.5 rounded w-fit">{hall.theme.split(' / ')[0]}</p>
                      </div>
                    </div>

                    {/* Grid lines pattern inside card */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-50 pointer-events-none" />

                    {/* Booths Container */}
                    <div className="absolute inset-0 z-10">
                      {filteredBooths.map((booth) => {
                        const isHovered = hoveredBoothId === booth.id;
                        const isHighlighted = highlightedBoothId === booth.id;
                        const isSelected = selectedBoothId === booth.id;
                        const routeIndex = route.findIndex(r => r.id === booth.id);

                        const w = booth.width || 12;
                        const h = booth.height || 10;
                        const left = booth.mapX - w / 2;
                        const top = booth.mapY - h / 2;

                        return (
                          <button
                            id={`booth-btn-${booth.id}`}
                            key={booth.id}
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering parent hall selection click
                              if (hasDraggedRef.current) {
                                return; // Ignore click if a drag-panning operation happened
                              }
                              onSelectBooth(booth.id);
                              if (selectedHallId !== booth.hall) {
                                onSelectHall(booth.hall);
                              }
                            }}
                            onMouseEnter={() => setHoveredBoothId(booth.id)}
                            onMouseLeave={() => setHoveredBoothId(null)}
                            className={`absolute rounded-lg border flex flex-col justify-between p-1 text-left cursor-pointer transition-all duration-200 ${getCategoryBgColor(
                              booth.category,
                              isHovered,
                              isHighlighted,
                              isSelected
                            )}`}
                            style={{
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${w}%`,
                              minHeight: `${h}%`,
                            }}
                            title={`${booth.name} [${booth.code}] - 點擊檢視無料詳情`}
                          >
                            {/* Route stop sequential order indicator */}
                            {routeIndex !== -1 && (
                              <div className="absolute -top-2 -right-2 w-5.5 h-5.5 rounded-full bg-orange-600 border border-white text-white text-[10px] font-mono font-black flex items-center justify-center shadow-sm z-20">
                                {routeIndex + 1}
                              </div>
                            )}

                            {/* Code Code */}
                            <div className="flex justify-between items-center w-full gap-0.5 leading-none">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 group-hover:text-zinc-600 leading-none">
                                {booth.code}
                              </span>
                              
                              {/* Freebies Gift Icon Indicator */}
                              {booth.freebies.length > 0 && !isZoomedOut && (
                                <span className="flex items-center text-[9px] text-zinc-500 font-bold leading-none shrink-0">
                                  <Gift className="w-2 h-2 text-zinc-400 mr-0.5" />
                                  <span>{booth.freebies.length}</span>
                                </span>
                              )}
                            </div>

                            {/* Simplified / Complete Booth Title depending on Zoom level */}
                            <div className="flex-1 flex items-center mt-0.5 leading-none overflow-hidden">
                              <span className={`text-[10.5px] font-bold line-clamp-2 leading-tight tracking-tight ${
                                isSelected ? 'text-white' : 'text-zinc-800 font-display'
                              }`}>
                                {booth.name}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

      {/* Synchronized Information Bar (Footer Ribbon) */}
      <div className="px-5 py-3 bg-white border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 shadow-sm">
        {currentBoothObj ? (
          /* BOOTH FOCUS VIEW */
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-sm text-orange-600 shrink-0">
              📍
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] font-mono font-black text-orange-700 bg-orange-50 border border-orange-150 px-1.5 py-0.2 rounded leading-none">
                  {currentBoothObj.hall} {currentBoothObj.code}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">| {currentBoothObj.category.toUpperCase()}</span>
              </div>
              <h4 className="text-xs font-black text-zinc-900 mt-1 font-display line-clamp-2">{currentBoothObj.name}</h4>
            </div>
          </div>
        ) : currentHallObj ? (
          /* HALL FOCUS VIEW */
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-black text-xs text-black shrink-0">
              {currentHallObj.id}
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 font-display flex items-center gap-2">
                <span>{currentHallObj.name}</span>
                <span className="text-[10.5px] text-zinc-400 font-medium">— {currentHallObj.theme}</span>
              </h4>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium line-clamp-2">{currentHallObj.description}</p>
            </div>
          </div>
        ) : (
          /* GENERAL WELCOME */
          <div className="flex items-center gap-2.5 text-left">
            <Compass className="w-5 h-5 text-zinc-400 shrink-0" />
            <div>
              <span className="text-xs font-black text-zinc-800 font-display">雙擊或使用滾輪進行精細縮放</span>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                按住滑鼠左鍵可拖動遊覽地圖，點選任意攤位即可領取其對應無料周邊！
              </p>
            </div>
          </div>
        )}

        {/* Categories Legend Panel */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-zinc-400 font-bold pt-1.5 sm:pt-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>遊戲世界</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>虛擬樂園</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>模玩英雄</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>一起桌遊</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>UP空間</span>
          </span>
        </div>
      </div>
    </div>
  );
}
