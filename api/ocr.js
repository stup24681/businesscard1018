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

    const promptText = `請以專業 OCR 角度精確辨識此名片，提取以下四項資訊並以 JSON 回傳：
1. company: 公司全名（繁體中文優先）
2. name: 聯絡人姓名（不含職稱）
3. addresses: 公司地址陣列（包含分公司或營運據點，若無則為空陣列 []）
4. email: 電子信箱（需為合法 Email 格式，若無則為空字串 ""）

嚴禁虛構未出現的資訊。`;

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
        maxOutputTokens: 600,
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

    // 使用官方正式且反應最快的低延遲多模態端點 gemini-2.0-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resText = await response.text();

    if (!response.ok) {
      console.error(`Google API 錯誤 [${response.status}]:`, resText);
      return res.status(response.status).json({
        error: `Google API 回傳錯誤 (${response.status})`,
        details: resText
      });
    }

    let resData;
    try {
      resData = JSON.parse(resText);
    } catch (e) {
      return res.status(500).json({ error: 'Google API 回傳格式錯誤', details: resText });
    }

    const rawContent = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return res.status(500).json({
        error: '未能取得辨識內容',
        details: JSON.stringify(resData)
      });
    }

    let resultObj;
    try {
      const cleanJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      resultObj = JSON.parse(cleanJson);
    } catch (parseErr) {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        resultObj = JSON.parse(match[0]);
      } else {
        throw new Error(`無法解析回傳內容: ${rawContent}`);
      }
    }

    return res.status(200).json(resultObj);

  } catch (error) {
    console.error('OCR 處理異常:', error);
    return res.status(500).json({
      error: '伺服器端辨識處理失敗',
      details: error.message || String(error)
    });
  }
}
