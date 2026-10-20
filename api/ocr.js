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

  // 1. 診斷模式
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
      message: 'OCR API 端點運作正常 (已啟用極速無思考模式)',
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

    const promptText = `你是一個極速名片辨識引擎。請辨識名片中的四大欄位：
1. company: 公司名稱
2. name: 姓名
3. addresses: 公司地點/完整地址（字串陣列，有多處地址請全列出）
4. email: 電子信箱

嚴格規則：名片未載明或模糊不清的欄位一律給空字串 "" 或空陣列 []，嚴禁虛構猜測。請直接輸出 JSON。`;

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
        // 核心加速關鍵：關閉 Thinking 深度推理，消除 10~20 秒的推導延遲
        thinkingConfig: {
          thinkingBudget: 0
        },
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

    // 優先使用速度最快的 flash 模型
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
          // 若該模型不支援 thinkingConfig 語法，自動退回不帶 thinkingConfig 的配置嘗試
          if (response.status === 400) {
            const fallbackPayload = { ...payload };
            delete fallbackPayload.generationConfig.thinkingConfig;
            const retryRes = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: JSON.stringify(fallbackPayload)
            });
            if (retryRes.ok) {
              const resData = await retryRes.json();
              const resultText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (resultText) return res.status(200).json(JSON.parse(resultText));
            }
          }

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
