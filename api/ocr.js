export default async function handler(req, res) {
  // 設定 CORS 與僅允許 POST 請求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: '伺服器端尚未設定 GEMINI_API_KEY，請至 Vercel 專案後台的 Environment Variables 中進行設定。' 
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未提供圖片資料' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `你是一個專業的名片識別助理。請從提供的名片圖片中精確提取四大主要資訊：
1. company: 公司名稱
2. name: 姓名
3. addresses: 公司地點/完整地址（字串陣列，若有多個分公司地址請全部列出）
4. email: E-mail 電子信箱

嚴格規定：
- 若名片中未提供或無法清晰辨識該欄位，請保留為空字串或空陣列，絕對不可以自行猜測或虛構任何資訊。`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            company: { type: "STRING" },
            name: { type: "STRING" },
            addresses: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            email: { type: "STRING" }
          },
          required: ["company", "name", "addresses", "email"]
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return res.status(response.status).json({ error: 'Gemini API 辨識請求失敗', details: errText });
    }

    const resData = await response.json();
    const resultText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      return res.status(500).json({ error: '未能取得辨識結果' });
    }

    const parsed = JSON.parse(resultText);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Server OCR error:', error);
    return res.status(500).json({ error: error.message || '辨識過程發生內部錯誤' });
  }
}
