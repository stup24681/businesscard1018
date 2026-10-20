export default async function handler(req, res) {
  // 設定跨域 Header
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

  // GET 快速檢測端點
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : '未設定'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: '伺服器未讀取到 GEMINI_API_KEY，請確認 Vercel 環境變數設定。' });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    // 解析實際的 MIME 類型 (例如 image/jpeg, image/png, image/webp)
    let mimeType = 'image/jpeg';
    const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `請仔細分析這張名片圖片，精確提取下列四項核心欄位，並只回傳純 JSON 物件：
{
  "company": "公司或機構名稱",
  "name": "聯絡人姓名 (不含總經理、經理等職稱)",
  "addresses": ["公司地址或地點，可多個"],
  "email": "電子信箱"
}
注意事項：
- 若名片中沒有某項資訊，請填寫空字串 "" 或空陣列 []，切勿瞎猜。
- 請直接回傳符合 JSON 語法的純物件，不要包含 markdown 標籤。`;

    // 依 Google 官方規範：圖片擺在前面，文字提示詞擺在後面
    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
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

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-1.5-flash'
    ];

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
          let text = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(text);
          return res.status(200).json(parsed);
        } else {
          const errText = await response.text();
          console.error(`Google API [${model}] 錯誤代碼 ${response.status}:`, errText);
          lastError = `[${model}] HTTP ${response.status}: ${errText}`;
        }
      } catch (e) {
        lastError = `[${model}] 例外錯誤: ${e.message}`;
      }
    }

    return res.status(502).json({
      error: 'Google 辨識被拒絕',
      details: lastError
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || '後端發生未知例外' });
  }
}
