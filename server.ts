import "dotenv/config";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js'; // Use .js extension since we are running as ES Module under tsx in dev

// Removed ESM __dirname deriving as it is unused and breaks CJS builds

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Get all exhibition data directly
  
  app.get('/api/exhibition', async (req, res) => {
    // If you need server side fetching
    res.json({ halls: [], booths: [] });
  });


  // API Route: AI Assistant Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      
      let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      supabaseUrl = supabaseUrl.trim().replace(/\/+$/, '');
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
      const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
      let boothsData = [];
      if (supabase) {
        const { data } = await supabase.from('booths').select('*, freebies(*)');
        boothsData = data || [];
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ 
          error: 'Gemini API Key is not configured. Please add GEMINI_API_KEY to your Secrets panel under Settings.' 
        });
      }

      // Initialize GoogleGenAI SDK with recommended header
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct system instruction with full exhibition context
      const systemInstruction = `你是一位熱情、專業且幽默的 Bilibili World (BW) 2026 年夏季動漫展會「智能導覽助手」（AI 小電視導遊）。
你的任務是協助參展觀眾（使用者）規劃路線、查詢攤位位置、了解無料（免費周邊/贈品）領取條件、以及提供逛展攻略。

你擁有以下 2026 年 BW 展會的完整攤位和無料資訊：
${JSON.stringify(boothsData, null, 2)}

請遵守以下【回覆規範】：
1. 語言風格：請使用「繁體中文」（Traditional Chinese）回覆，語氣要親切活潑，可以適度融入一些動漫梗、B站梗（如：乾杯、小電視、乾巴爹、大佬）。
2. 無料資訊：當使用者詢問「無料」、「免費贈品」、「怎麼拿」時，請詳細說明該攤位的無料名稱、領取條件、獲取難易度，並給予防暑、排隊時間預估等實用小建議。
3. 【最重要 - 互動攤位連結】：
   當你在回覆中提到本數據庫中的特定攤位時，請務必使用特殊的格式 \`[攤位名稱](booth:攤位ID)\`。例如：
   - 「你可以去 [崩壞：星穹鐵道 (官方)](booth:3-hsr) 領取限定車票和手提袋...」
   - 「如果你喜歡虛擬主播，別錯過 [hololive production](booth:2-hololive) 的現場連線！」
   這樣前端會自動將其渲染為閃亮的可點擊按鈕。點擊後，網頁的地圖會「自動切換到對應館別、並飛入高亮定位該攤位」！這對使用者非常有幫助，因此請務必精準填入 booth: 後方的攤位ID（必須完全匹配數據庫中的 ID，例如 '3-hsr', '2-hololive', '5-genshin', '4-wukong', '1-mtg' 等）。
4. 路線推薦：如果使用者想逛某一類主題（如「二次元遊戲」、「虛擬V圈」、「相機體驗/大飽眼福」、「桌遊大賽」、「無料拿到手軟」），請幫他規劃一條涵蓋多個館別（例如 3.1H -> 4.1H -> 5.1H）的順暢行走路線，並告訴他每個館別的主打明星展位，路線中提到的攤位同樣要用 \`[攤位名稱](booth:攤位ID)\` 標註！
5. 如果使用者問及非本資料庫內的攤位，你可以禮貌地說明：「目前資料庫主要收錄了 BW 2026 的各大主流展商與創作者專區，您可以前往 BW 官方 APP 查詢最新資訊喔！過來我推薦你看看這幾個相似的超讚展台：...」

現在，請根據使用者的提問，給予最精準又生動的導覽建議！`;

      // Format history into SDK-compatible chat contents
      // The SDK chats.create or models.generateContent contents can accept array of contents
      const contents = [];
      if (history && history.length > 0) {
        for (const turn of history) {
          contents.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text || '';
      res.json({ text });

    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Error occurred while calling Gemini API' });
    }
  });

  // Serve static assets in production, otherwise mount Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] BW 2026 Interactive Map running on http://localhost:${PORT}`);
  });
}

startServer();
