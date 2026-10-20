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
    return res.status(500).json({ error: '伺服器環境變數未讀取到 GEMINI_API_KEY' });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `你是一個專業的名片 OCR 辨識系統。請仔細分析這張名片圖片，精確提取下列四個欄位，並只回傳純 JSON 物件：
{
  "company": "公司或機構名稱",
  "name": "聯絡人中文或英文姓名（不要包含總經理、業務等職稱）",
  "addresses": ["公司地址或地點，可多個，保留完整縣市與街道門牌"],
  "email": "電子郵件地址"
}

注意事項：
1. 若名片中沒有某個資訊，請填寫空字串 "" 或空陣列 []，千萬不要自行瞎猜捏造。
2. 只要輸出標準 JSON，不要加入額外的 markdown 註解。`;

    const payload = {
      contents: [
        {
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
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    };

    // 優先使用 Google 最新、最穩定且支援視覺的正式模型
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-1.5-flash'
    ];

    let lastError = null;

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
          let text = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          // 去除可能的 markdown 標記
          text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(text);
          return res.status(200).json(parsed);
        } else {
          const errText = await response.text();
          console.error(`Google API [${model}] 錯誤代碼 ${response.status}:`, errText);
          lastError = `HTTP ${response.status}: ${errText}`;
        }
      } catch (e) {
        lastError = `[${model}] ${e.message}`;
      }
    }

    return res.status(502).json({
      error: 'Google 辨識被拒絕',
      details: lastError
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || '後端發生例外錯誤' });
  }
}
