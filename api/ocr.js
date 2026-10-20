export default async function handler(req, res) {
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

  if (req.method === 'GET') {
    let testResult = '未測試';
    let availableModels = [];
    if (apiKey) {
      try {
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
      message: 'OCR API 運作中 (高精準速效版)',
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
      error: '伺服器未讀取到 GEMINI_API_KEY，請確認已在 Vercel 設定環境變數。' 
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // 精準提示詞：明確聚焦於繁體中文與名片各區塊排版識別
    const promptText = `你是一個專業的名片視覺辨識引擎。請辨識名片中的四大欄位：
1. company: 公司/企業全名或主要商號
2. name: 人物姓名（若有名稱與職稱在一起，請僅保留姓名）
3. addresses: 公司地點或地址（陣列，有多處地址或分公司請完整列出，若名片有地址請務必提取出來）
4. email: 電子郵件信箱

規則：名片完全沒有提供的欄位填空字串 "" 或空陣列 []，不得捏造。請直接輸出 JSON。`;

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
        temperature: 0.1,
        // 關鍵提速技巧：限制輸出 Token 數，名片資料簡短，限制後模型不再漫長推導
        maxOutputTokens: 350,
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

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash'
    ];

    let lastErrorDetail = null;

    for (const model of candidateModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
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
