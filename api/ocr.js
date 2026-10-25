export const config = {
  maxDuration: 60, // 解除 Vercel 10 秒限制，確保充裕辨識時間
};

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 讀取 Vercel 設定的金鑰
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // 1. GET 診斷檢查端點
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!apiKey,
      message: apiKey ? '後端運作正常，金鑰已載入！' : '尚未在 Vercel 設定 GEMINI_API_KEY'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({ 
      error: '伺服器未讀取到 GEMINI_API_KEY，請確認 Vercel 環境變數已設定！' 
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片' });
  }

  try {
    // 移除 base64 前綴
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `請分析這張名片圖片，精確提取下列四項資訊：
1. company: 公司名稱
2. name: 姓名（不含職稱）
3. addresses: 公司地點/地址（字串陣列，若有多個地點請全部列出）
4. email: 電子信箱

嚴格規定：
- 若無法辨識該欄位，請保留為空字串或空陣列，不可自行捏造。
- 請直接回傳符合 JSON 格式的內容，不要包含額外文字。`;

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            },
            {
              text: promptText
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    };

    // 呼叫 Google 官方 Gemini 2.5 Flash 端點
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google API 報錯:', response.status, errText);
      return res.status(502).json({
        error: `Google API 回應錯誤 (${response.status})`,
        details: errText
      });
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('後端辨識例外:', err);
    return res.status(500).json({ error: err.message || '後端伺服器內部錯誤' });
  }
}
