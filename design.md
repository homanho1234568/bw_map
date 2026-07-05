# Bilibili World 2026 Guide App - 設計規範 (Design System)

此文檔定義了本項目的視覺風格與 UI 設計規範，未來新增任何頁面、組件或進行修改時，必須嚴格遵守此規範，以確保整個項目的視覺風格高度統一、精緻且具備極高的專業度。

---

## 1. 視覺主題與配調 (Color Palette)

本項目採用 **極簡現代科技感 (Minimalist & Modern Tech-Forward)** 風格。主色調以高級的黑白灰（Zinc 鋅灰系列）為主，搭配精確設計的場館主題輔助色，呈現乾淨、俐落且高質感的視覺調性。

### 核心色值 (Core Colors)
*   **背景色 (Backgrounds)**:
    *   主頁面背景：`#ffffff` (Tailwind: `bg-white`)
    *   次級板塊與對比背景：`#f4f4f5` (Tailwind: `bg-zinc-50`) 或 `#fafafa`
    *   半透明磨砂背景：`rgba(255, 255, 255, 0.85)` 搭配高斯模糊 (`backdrop-blur`)
*   **文字色 (Typography Colors)**:
    *   主標題/重要文字：`#000000` (Tailwind: `text-black` 或 `text-zinc-950`) - 提供最高對比與現代感。
    *   正文/主內容：`#27272a` (Tailwind: `text-zinc-800` / `text-zinc-700`) - 高級深灰，保證長時間閱讀的舒適度。
    *   次要/說明/輔助資訊：`#71717a` (Tailwind: `text-zinc-500` / `text-zinc-400`) - 優雅的暗灰。
*   **邊框與分割線 (Borders & Dividers)**:
    *   主邊框：`#e4e4e7` (Tailwind: `border-zinc-200`) - 極細精緻線條。
    *   淺色分割：`#f4f4f5` (Tailwind: `border-zinc-100`) 或 `#e4e4e7` (Tailwind: `border-zinc-150`)。
*   **主控與焦點色 (Primary Accent)**:
    *   經典極簡黑：`#000000` (Tailwind: `bg-black`, `text-white`) 搭配懸停 `#27272a` (Tailwind: `hover:bg-zinc-850`)。

### 輔助色/場館主題色 (Hall Theme Colors)
場館地圖採用精心挑選的低飽和、高質感微亮色系，避免喧賓奪主：
*   **1.1H (夢幻/桌遊)**: 粉色系 `#ec4899` (Tailwind: `text-pink-500` / `bg-pink-50`)
*   **2.1H (虛擬/模玩)**: 翡翠綠 `#10b981` (Tailwind: `text-emerald-500` / `bg-emerald-50`)
*   **3.1H (遊戲世界 A)**: 藍色系 `#3b82f6` (Tailwind: `text-blue-500` / `bg-blue-50`)
*   **4.1H (遊戲世界 B)**: 青色系 `#06b6d4` (Tailwind: `text-cyan-500` / `bg-cyan-50`)
*   **5.1H (遊戲世界 C)**: 紫羅蘭 `#8b5cf6` (Tailwind: `text-violet-500` / `bg-violet-50`)
*   **6.1H (動漫/舞台)**: 橙紅色系 `#ef4444` (Tailwind: `text-red-500` / `bg-red-50`)
*   **8.1H (UP主/攝影)**: 琥珀色 `#f59e0b` (Tailwind: `text-amber-500` / `bg-amber-50`)
*   **7.1H (檢票大廳)**: 靜謐紫 `#7c3aed` (Tailwind: `text-purple-600` / `bg-purple-50`)

---

## 2. 字體與排版 (Typography)

Typography 是體現界面品質的核心。本項目採用三套字體搭配方案，營造韻律感：

1.  **無襯線通用字體 (Sans-Serif)**: `Inter` - 用於一般 UI 按鈕、列表、常規表單。
2.  **展示性標題字體 (Display)**: `Space Grotesk` 或 `Outfit` - 具備強烈幾何感的現代字體，用於主要大標題、頁面頂部 Header。
3.  **等寬代碼字體 (Mono)**: `JetBrains Mono` 或 `Fira Code` - 用於場館編號 (如 `3.1H`)、攤位編碼 (如 `3A33`)、數據統計等。

### 字號、字重與行高規則 (Size & Weight Rules)
*   **頁面超大標題 (Page Header)**:
    *   字號：`text-2xl` 至 `text-3xl` (`24px` - `30px`)
    *   字重：`font-black` (900)
    *   行高：`leading-tight` (1.2)
    *   字體：`font-display` (Space Grotesk)
*   **模組/卡片標題 (Card Title)**:
    *   字號：`text-base` 至 `text-lg` (`16px` - `18px`)
    *   字重：`font-extrabold` (800)
    *   行高：`leading-snug` (1.3)
*   **常規正文 (Body Copy)**:
    *   字號：`text-xs` 至 `text-sm` (`12px` - `14px`)
    *   字重：`font-semibold` (600) 或 `font-medium` (500)
    *   行高：`leading-relaxed` (1.6)
*   **微型元數據/編碼 (Micro Meta)**:
    *   字號：`text-[10px]` 至 `text-[11px]`
    *   字重：`font-bold` (700) / `font-black` (900)
    *   字體：`font-mono` (JetBrains Mono)

---

## 3. 佈局與間距 (Layout & Spacing)

間距應具有呼吸感。避免擁擠，保持充足的負空間。

*   **容器最大寬度 (Max-Width Container)**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` 防止在大螢幕上無限拉伸。
*   **模組/區塊間距 (Section Gap)**: `space-y-6` 或 `gap-6` (`24px`)，卡片內置間距通常為 `p-6` (`24px`)。
*   **卡片/組件內部邊距 (Component Padding)**:
    *   大卡片：`p-6` (`24px`)
    *   普通列表項/彈窗：`p-4` (`16px`)
    *   緊湊元件/小按鈕：`p-2` / `px-3 py-1.5`
*   **交互目標 (Touch Target)**:
    *   所有可點擊元素（按鈕、選項、複選框）在行動端的觸控範圍必須大於 `44px` (`h-11` 或 `p-3`)。

---

## 4. 組件設計規則 (Component Styles)

組件的圓角、邊框、陰影及動畫必須保證統一：

### 圓角規則 (Border Radius)
*   **外層大容器/主卡片/彈窗**: `rounded-2xl` (`16px`)
*   **普通子卡片/地圖攤位/按鈕**: `rounded-xl` (`12px`)
*   **小標籤/輸入框/微型按鈕**: `rounded-lg` (`8px`) 或 `rounded` (`4px`)
*   **圓形頭像/徽標**: `rounded-full`

### 邊框與投影 (Border & Shadow)
*   **邊框樣式**: 所有的卡片、彈窗、輸入框均應配備統一的 `border border-zinc-200`，懸停時過渡至 `hover:border-black` 或 `hover:border-zinc-400`。
*   **投影 (Shadow)**:
    *   普通卡片/按鈕：`shadow-sm` (精緻極淺投影)
    *   浮動彈窗/模態框：`shadow-xl` 或 `shadow-2xl`
    *   地圖/卡片懸停狀態：過渡至 `hover:shadow-md`

### 按鈕樣式 (Button Presets)
1.  **主要按鈕 (Primary Button)**:
    *   樣式：`bg-black text-white hover:bg-zinc-800 rounded-lg font-extrabold text-xs tracking-wide transition-all shadow-sm`
2.  **次要按鈕 (Secondary Button)**:
    *   樣式：`bg-white text-zinc-700 hover:text-black hover:bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-xs transition-all`
3.  **危險/特殊按鈕**:
    *   樣式：`bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-xs transition-all`

### 滾動條美化 (Scrollbars)
所有帶有局部滾動的容器 (如側邊欄、對話框、列表) 必須使用自定義滾動條：
*   樣式：`scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent`

---

## 5. 微交互與動畫 (Micro-Interactions)

所有按鈕、可懸停元素必須具有流暢的過渡動畫：
*   **基本過渡**: `transition-all duration-300 ease-in-out`
*   **懸停動效 (Hover Feedback)**:
    *   一般卡片懸停：稍微上移且陰影加深 `hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-400`
    *   按鈕點擊動效：縮小反饋 `active:scale-[0.98]`
*   **進場與切換動畫 (Page/Route Transitions)**:
    *   使用 `motion/react` (即 `framer-motion`) 進行控制。
    *   淡入淡出配合微小位移：`initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}`。

---

> **開發者備忘**: 未來在本項目中創建任何新頁面、新彈窗或模組時，必須首先完整查閱此文檔。不允許使用隨機色值、超大不協調圓角或非規範字體。保持極簡、精確、高對比的「鋅灰與黑」科技美學。
