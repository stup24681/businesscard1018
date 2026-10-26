export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS 跨域設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', hasApiKey: !!apiKey });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支援 POST 請求' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: '伺服器未設定 GEMINI_API_KEY，請至 Vercel 後台 Environment Variables 設定' });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料 (image 為空)' });
  }

  try {
    let mimeType = 'image/jpeg';
    const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    const base64Data = image.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').trim();

    const promptText = `請以專業 OCR 繁體中文名片辨識角度，精確擷取圖片中名片的以下 4 項核心資訊，並嚴格以 JSON 格式回傳：
{
  "company": "公司完整全名（繁體中文優先，包含科技/股份有限公司等）",
  "name": "聯絡人中文姓名（不包含職稱與稱謂）",
  "addresses": ["公司地址或分公司據點清單，若有多個請全數列入陣列，若無則為空陣列 []"],
  "email": "電子信箱（合法 Email 格式，若無則為空字串 \\"\\"）"
}
注意：只回傳純 JSON，不要附加任何解釋性開頭或結尾文字。嚴格根據名片字樣辨識，絕不自行捏造。`;

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
        maxOutputTokens: 800,
        responseMimeType: "application/json"
      }
    };

    // Google 官方在線活躍模型（首選 3.8-flash，備選 3.5-flash）
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash'
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

        const resText = await response.text();

        if (response.ok) {
          let resData;
          try {
            resData = JSON.parse(resText);
          } catch (e) {
            continue;
          }

          const rawContent = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawContent) {
            lastError = `Google API 回傳無文字內容: ${resText}`;
            continue;
          }

          let resultObj = null;
          try {
            const cleanJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
            resultObj = JSON.parse(cleanJson);
          } catch (pErr) {
            const match = rawContent.match(/\{[\s\S]*\}/);
            if (match) {
              resultObj = JSON.parse(match[0]);
            }
          }

          if (resultObj) {
            return res.status(200).json(resultObj);
          } else {
            lastError = `無法解析 JSON 格式: ${rawContent}`;
          }
        } else {
          lastError = `Google API [${model}] 錯誤 (${response.status}): ${resText}`;
          console.warn(lastError);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    return res.status(500).json({
      error: '名片辨識處理失敗',
      details: lastError
    });

  } catch (error) {
    console.error('OCR 處理異常:', error);
    return res.status(500).json({
      error: '伺服器端辨識處理失敗',
      details: error.message || String(error)
    });
  }
}
