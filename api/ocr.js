export const config = {
  maxDuration: 30, // 嘗試將 Vercel Function 上限拉至 30 秒
};

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

  // GET 快速檢測
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
    // 取得乾淨的 base64 與正確的 mimeType
    let mimeType = 'image/jpeg';
    const match = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    if (match && match[1]) {
      mimeType = match[1];
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `你是一位專業名片辨識專家。請從名片圖片中精準提取下列資訊並只輸出 JSON：
{
  "company": "公司或機構名稱",
  "name": "聯絡人姓名 (不含總經理、業務等頭銜)",
  "addresses": ["公司地址或地點，可多個"],
  "email": "電子信箱"
}
注意事項：
- 找不到的欄位請填空字串 "" 或空陣列 []。
- 只輸出合法 JSON 物件，嚴禁加入 markdown 語法。`;

    // 依 Google Vision 規範：圖片放前，指令放後
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

    // 直接使用您帳號已經驗證支援的 gemini-2.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(text);
      return res.status(200).json(parsed);
    } else {
      const errText = await response.text();
      console.error('Google API 報錯:', response.status, errText);
      return res.status(502).json({
        error: `Google API 錯誤 (HTTP ${response.status})`,
        details: errText
      });
    }
  } catch (err) {
    console.error('後端異常:', err);
    return res.status(500).json({ error: err.message || '後端伺服器內部錯誤' });
  }
}
