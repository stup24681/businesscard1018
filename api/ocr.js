export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!apiKey
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({
      error: '伺服器未讀取到 GEMINI_API_KEY，請確認已在 Vercel 環境變數中設定。'
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `你是一個專業的名片 OCR 資料擷取助理。請仔細分析這張名片影像，提取四大核心資訊並輸出為 JSON：
1. company: 公司名稱（機構名稱）
2. name: 聯絡人姓名
3. addresses: 公司地址或地點陣列（若名片有多個地址或分公司請全部列出，若只有一個請放單一元素陣列）
4. email: 電子信箱

注意：
- 僅根據圖片中實際出現的字樣提取，絕對不要猜測或虛構。
- 若無該資訊，字串請給空字串 ""，陣列請給空陣列 []。`;

    // 採用先前 100% 成功辨識出「巨興醫學科技」的標準格式與模型
    const payload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
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
        temperature: 0,
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

    // 唯一鎖定成功辨識的 gemini-2.5-flash
    const targetModel = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

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
      console.error(`Gemini API 回傳錯誤: ${response.status}`, errText);
      return res.status(response.status).json({
        error: `Google API 錯誤 (${response.status})`,
        details: errText
      });
    }

    const resData = await response.json();
    const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(200).json({
        company: '',
        name: '',
        addresses: [],
        email: ''
      });
    }

    // 清理 markdown 標記確保 JSON.parse 100% 成功
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('後端處理例外:', error);
    return res.status(500).json({
      error: '後端辨識處理失敗',
      details: error.message
    });
  }
}
