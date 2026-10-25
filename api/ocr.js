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
      error: '伺服器未讀取到 GEMINI_API_KEY，請確認 Vercel 環境變數已正確設定。'
    });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `請分析這張名片圖片，精確提取四大核心資訊並輸出為 JSON：
1. company: 公司或機構全稱
2. name: 聯絡人姓名
3. addresses: 公司地點或地址陣列（若有多筆請全部列出）
4. email: 電子信箱

注意：
- 僅根據圖片中實際出現的字樣提取，絕對不可自行捏造或猜測。
- 無該資訊請留空字串 "" 或空陣列 []。`;

    // 核心優化：thinkingBudget = 0 關閉思維鏈推導，單張極速在 1~2 秒內完成
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
        maxOutputTokens: 500,
        thinkingConfig: {
          thinkingBudget: 0
        },
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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 自動重試一次（專門防禦偶發性 429 / 503）
    let response;
    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        break;
      }

      if ((response.status === 429 || response.status === 503) && attempts < 2) {
        // 若遇頻率限制，在後端平靜等待 2.5 秒後重試一次
        await new Promise(r => setTimeout(r, 2500));
        continue;
      }
      break;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API 回傳錯誤 (${response.status}):`, errText);
      return res.status(response.status).json({
        error: `Google API 錯誤 (${response.status})`,
        details: errText
      });
    }

    const resData = await response.json();
    const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ error: '模型未回傳辨識內容' });
    }

    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('OCR 處理例外:', error);
    return res.status(500).json({
      error: '伺服器辨識異常',
      details: error.message
    });
  }
}
