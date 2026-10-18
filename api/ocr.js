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
      error: '伺服器未讀取到 GEMINI_API_KEY，請確認 Vercel 環境變數設定並重新部署 (Redeploy)。' 
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

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

    // 支援模型自動降級嘗試：優先使用 gemini-2.5-flash，若失敗嘗試 gemini-1.5-flash
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resData = await response.json();
          const resultText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (resultText) {
            const parsed = JSON.parse(resultText);
            return res.status(200).json(parsed);
          }
        } else {
          const errText = await response.text();
          console.error(`Gemini API [${model}] error:`, errText);
          lastError = errText;
        }
      } catch (callErr) {
        lastError = callErr.message;
      }
    }

    return res.status(502).json({ 
      error: 'Gemini API 辨識請求失敗', 
      details: lastError 
    });
  } catch (error) {
    console.error('Server OCR handler error:', error);
    return res.status(500).json({ error: error.message || '辨識過程發生內部錯誤' });
  }
}
