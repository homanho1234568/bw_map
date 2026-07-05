import React from 'react';
import { Booth, Freebie } from '../data';
import { X, Gift, MapPin, Tag, Plus, Check, Star, Navigation, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface BoothDetailModalProps {
  booth: Booth | null;
  onClose: () => void;
  isInChecklist: (freebieId: string) => boolean;
  isInRoute: (boothId: string) => boolean;
  onToggleChecklist: (freebie: Freebie, booth: Booth) => void;
  onToggleRoute: (booth: Booth) => void;
  isClaimed: (freebieId: string) => boolean;
  onToggleClaimed: (freebieId: string) => void;
}

export default function BoothDetailModal({
  booth,
  onClose,
  isInChecklist,
  isInRoute,
  onToggleChecklist,
  onToggleRoute,
  isClaimed,
  onToggleClaimed
}: BoothDetailModalProps) {
  if (!booth) return null;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'game': return '遊戲世界';
      case 'virtual': return '虛擬樂園';
      case 'model': return '模玩英雄';
      case 'tabletop': return '一起桌遊';
      case 'creator': return 'UP主空間';
      case 'bazaar': return '夢幻集市';
      case 'romance': return '戀戀心聲';
      case 'tech': return '數碼科技';
      default: return '展會專區';
    }
  };

  const getDifficultyBadge = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">簡單 · 容易領取</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">中等 · 需要互動</span>;
      case 'hard':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">高難 · 熱門排隊</span>;
    }
  };

  const getFreebieTypeLabel = (type: string) => {
    switch (type) {
      case 'card': return '卡牌/鐳射票';
      case 'bag': return '提袋/帆布包';
      case 'badge': return '徽章/胸針';
      case 'sticker': return '限定貼紙';
      case 'fan': return '紙折扇/團扇';
      case 'poster': return '海報/明信片';
      default: return '周邊贈品';
    }
  };

  return (
    <div id="booth-detail-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Banner/Header Area */}
        <div className="relative p-6 pb-4 bg-zinc-50 border-b border-zinc-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-50 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title & Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2 pr-6">
            <span className="px-2 py-0.5 bg-black text-white border border-black rounded text-[10.5px] font-mono font-bold tracking-tight">
              {booth.hall} {booth.code}
            </span>
            <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[10.5px] font-bold text-zinc-600">
              {getCategoryLabel(booth.category)}
            </span>
            {booth.featured && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-250 rounded text-[10.5px] font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>熱門展位</span>
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-black leading-tight tracking-tight mt-1 font-display">
            {booth.name}
          </h3>

          <div className="flex items-center gap-2.5 mt-3 text-xs text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>上海國家會展中心 2026.7.10-12</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>展期 3 天全覆蓋</span>
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {/* Description */}
          <div>
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">展位簡介</h4>
            <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg font-medium">
              {booth.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {booth.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs rounded-md flex items-center gap-1 font-semibold">
                <Tag className="w-3 h-3 text-zinc-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          {/* Freebies List */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-zinc-150 pb-2">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Gift className="w-4 h-4 text-zinc-600" />
                <span>現場可領取無料 ({booth.freebies.length})</span>
              </h4>
              <span className="text-[10px] text-zinc-400 font-bold">
                領完即止 · 請儘早前往
              </span>
            </div>

            <div className="space-y-3">
              {booth.freebies.map((freebie) => {
                const checked = isInChecklist(freebie.id);
                const claimed = isClaimed(freebie.id);

                return (
                  <div
                    key={freebie.id}
                    className="p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors flex flex-col justify-between gap-3"
                  >
                    {/* Freebie Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[10px] font-bold border border-zinc-200">
                            {getFreebieTypeLabel(freebie.type)}
                          </span>
                          <span className="font-bold text-sm text-zinc-900 font-display">
                            {freebie.name}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5 font-medium">
                          {freebie.description}
                        </p>
                      </div>

                      {/* Add to checklist button */}
                      <button
                        onClick={() => onToggleChecklist(freebie, booth)}
                        className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                          checked
                            ? 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                            : 'bg-black border-black text-white hover:bg-zinc-800'
                        }`}
                        title={checked ? "從清單移除" : "加入清單"}
                      >
                        {checked ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-800 stroke-[3]" />
                            <span className="text-[10px]">已加清單</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-white" />
                            <span className="text-[10px]">加入清單</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Claim Criteria */}
                    <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between items-center flex-wrap gap-1.5">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider font-mono">領取攻略/條件</span>
                        {getDifficultyBadge(freebie.difficulty)}
                      </div>
                      <p className="text-zinc-700 font-semibold leading-relaxed mt-0.5">
                        {freebie.condition}
                      </p>
                    </div>

                    {/* Mark as Claimed directly inside Detail Modal */}
                    {checked && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onToggleClaimed(freebie.id)}
                          className={`px-2.5 py-1 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            claimed
                              ? 'bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${claimed ? 'text-white' : 'text-zinc-400'}`} />
                          <span>{claimed ? '無料已領取' : '標記為已領取'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex items-center gap-3">
          <button
            onClick={() => onToggleRoute(booth)}
            className={`flex-1 py-2.5 rounded-lg border font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isInRoute(booth.id)
                ? 'bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-50'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isInRoute(booth.id) ? 'text-white' : 'text-zinc-400'}`} />
            <span>{isInRoute(booth.id) ? '已加入遊覽路線' : '加入個人遊覽路線'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </motion.div>
    </div>
  );
}
