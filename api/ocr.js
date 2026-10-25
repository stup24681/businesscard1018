export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // 診斷端點：瀏覽器直接開啟可檢查狀態
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!apiKey,
      prefix: apiKey ? apiKey.substring(0, 8) + '...' : '未設定'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: '伺服器未讀取到 GEMINI_API_KEY 環境變數' });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片' });
  }

  try {
    // 提取圖片的 mimeType 與純 base64 資料
    let mimeType = 'image/jpeg';
    let base64Data = image;

    const mimeMatch = image.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
      base64Data = image.replace(/^data:[^;]+;base64,/, '');
    }

    const promptText = `你是一個專業的名片 OCR 擷取專家。請分析這張名片圖片，精確擷取下列 4 項繁體中文或英文資訊，並嚴格只回傳 JSON 格式（不要包含任何 markdown 或解說）：
{
  "company": "公司名稱（若無則為空字串）",
  "name": "聯絡人姓名（不含職稱，若無則為空字串）",
  "addresses": ["公司地址或地點（若有多個請全部列入陣列，若無則為空陣列）"],
  "email": "電子郵件（若無則為空字串）"
}`;

    // 符合 Google 官方 REST API 的標準 Payload (同時支援 inline_data 與 inlineData)
    const payload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
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
        responseMimeType: "application/json"
      }
    };

    // 優先使用您帳號已經通過驗證的官方模型
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
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
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          // 清理可能的 markdown 標籤
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawText);
          return res.status(200).json(parsed);
        } else {
          const errText = await response.text();
          console.error(`模型 [${model}] 回傳錯誤:`, response.status, errText);
          lastError = `[${model}] (${response.status}) ${errText}`;
        }
      } catch (e) {
        lastError = `[${model}] 例外: ${e.message}`;
      }
    }

    return res.status(502).json({
      error: 'Google API 辨識失敗',
      details: lastError
    });
  } catch (err) {
    console.error('後端異常:', err);
    return res.status(500).json({ error: err.message || '後端伺服器內部錯誤' });
  }
}
