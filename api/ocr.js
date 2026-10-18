export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-goog-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // 1. 診斷與測試模式：直接開啟網址不僅看狀態，更直接向 Google 發送一則微型測試確保金鑰可用
  if (req.method === 'GET') {
    let testResult = '未測試';
    let availableModels = [];
    if (apiKey) {
      try {
        // 先測試清單端點，驗證金鑰同時獲取帳號可用的模型
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listRes = await fetch(listUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          }
        });

        if (listRes.ok) {
          const listData = await listRes.json();
          availableModels = (listData.models || [])
            .map(m => m.name.replace('models/', ''))
            .filter(m => m.includes('flash') || m.includes('pro'))
            .slice(0, 5);
          testResult = 'Google 驗證成功 (200 OK)';
        } else {
          const errDetail = await listRes.text();
          testResult = `Google 回應錯誤 (${listRes.status}): ${errDetail}`;
        }
      } catch (err) {
        testResult = `測試請求例外: ${err.message}`;
      }
    }

    return res.status(200).json({
      status: 'ok',
      message: 'OCR API 端點運作正常',
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : '尚未設定 GEMINI_API_KEY',
      keyVerification: testResult,
      modelsSample: availableModels
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({ 
      error: '伺服器未讀取到 GEMINI_API_KEY，請確認已在 Vercel Settings -> Environment Variables 設定好並重新部署。' 
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    // 移除 base64 標頭
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `請分析這張名片圖片，精確提取下列四項資訊：
1. company: 公司名稱
2. name: 姓名
3. addresses: 公司地點/地址（字串陣列，若有多個分公司或辦公室請全部列出）
4. email: 電子信箱

嚴格規定：
- 若名片中未提供或無法辨識該欄位，請保留為空字串或空陣列，絕對不可自行捏造或猜測。
- 請直接回傳符合 JSON 格式的資料。`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            company: { type: 'STRING' },
            name: { type: 'STRING' },
            addresses: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            },
            email: { type: 'STRING' }
          },
          required: ['company', 'name', 'addresses', 'email']
        }
      }
    };

    // 依據您 Google 帳號實測驗證回傳的可用模型清單
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro'
    ];

    let lastErrorDetail = null;

    for (const model of candidateModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey // 同時提供 header 與 query string，確保 100% 相容
          },
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
          const errBody = await response.text();
          console.error(`Gemini API [${model}] 錯誤:`, errBody);
          lastErrorDetail = `[${model} HTTP ${response.status}] ${errBody}`;
        }
      } catch (err) {
        lastErrorDetail = `[${model}] 例外: ${err.message}`;
      }
    }

    return res.status(502).json({
      error: 'Google Gemini 辨識呼叫失敗',
      details: lastErrorDetail
    });
  } catch (error) {
    console.error('後端 OCR 處理失敗:', error);
    return res.status(500).json({ error: error.message || '伺服器內部錯誤' });
  }
}
