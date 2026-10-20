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

  // 診斷檢測
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
          availableModels = (listData.models || []).map(m => m.name.replace('models/', ''));
          testResult = 'Google 驗證成功 (200 OK)';
        } else {
          testResult = `Google 回應錯誤 (${listRes.status})`;
        }
      } catch (err) {
        testResult = `測試請求例外: ${err.message}`;
      }
    }

    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!apiKey,
      keyVerification: testResult,
      modelsSample: availableModels.slice(0, 5)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: '伺服器未讀取到 GEMINI_API_KEY，請確認 Vercel 環境變數。' });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    // 精準提示詞：完整定義名片核心四要素，還原最穩定的提取邏輯
    const promptText = `請仔細分析這張名片圖片，精確辨識並提取下列四項核心資訊：
1. company: 公司/機構名稱（若有中英文名稱，請以主要中文字號為主）
2. name: 聯絡人姓名（若名片上姓名與職稱在一起，例如「總經理 陳大明」，請只提取真實姓名「陳大明」）
3. addresses: 公司地點或地址（以字串陣列回傳。若有多個分公司或工廠地址請完整提取，若名片上有郵遞區號或完整街道門牌請完整保留）
4. email: 電子郵件信箱（常見如 @gmail.com 或公司自訂網域名稱）

規則：
- 名片中完全沒有提供的資訊，請填寫空字串 "" 或空陣列 []，絕對不要自行瞎猜或捏造。
- 必須以標準 JSON 物件回傳。`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            },
            { text: promptText }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        // 不限制過小的 token，保證繁體中文字與多地址能完整輸出不截斷
        maxOutputTokens: 1024,
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

    // 依據您 Google 帳號支援的模型優先順序
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
          console.error(`Gemini [${model}] 錯誤:`, errBody);
          lastErrorDetail = `[${model} HTTP ${response.status}] ${errBody}`;
        }
      } catch (err) {
        lastErrorDetail = `[${model}] ${err.message}`;
      }
    }

    return res.status(502).json({
      error: 'Google Gemini 辨識失敗',
      details: lastErrorDetail
    });
  } catch (error) {
    console.error('OCR 異常:', error);
    return res.status(500).json({ error: error.message || '伺服器內部錯誤' });
  }
}
