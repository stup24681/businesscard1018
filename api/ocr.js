export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // 跨域 CORS 設定
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
    return res.status(500).json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數，請在 Vercel Settings -> Environment Variables 設定' });
  }

  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: '未接收到名片圖片資料 (image 欄位為空)' });
  }

  try {
    // 1. 拆解 base64 與 mimeType
    let mimeType = 'image/jpeg';
    const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    const base64Data = image.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').trim();

    // 2. 嚴格提取四大核心資訊的 Prompt
    const promptText = `你是一個專業的名片 OCR 分析專家。請仔細審視這張名片圖片，精確辨識並提取以下四大核心資訊：
1. company: 公司完整全名（繁體中文優先，若有英中文並列請優先取中文公司名）
2. name: 聯絡人完整姓名（若有職稱請將職稱去掉，純粹保留姓名）
3. addresses: 公司地址陣列（若有多個營業所或地址，請全部列入陣列中；若無請回傳空陣列 []）
4. email: 電子信箱（需為完整合法格式，例如 name@company.com；若無請回傳空字串 ""）

請特別注意：嚴禁虛構或捏造任何不存在的資訊。若名片中未提及請留空字串 "" 或空陣列 []。`;

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

    // 3. 官方指名最新模型端點
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resText = await response.text();

    if (!response.ok) {
      console.error(`Google API 呼叫失敗 [${response.status}]:`, resText);
      return res.status(response.status).json({
        error: `Google API 錯誤 (${response.status})`,
        details: resText
      });
    }

    let resData;
    try {
      resData = JSON.parse(resText);
    } catch (e) {
      return res.status(500).json({ error: 'Google API 回傳非合法 JSON', details: resText });
    }

    // 安全讀取 candidates
    const rawContent = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return res.status(500).json({
        error: '未能從辨識結果中取得內容',
        details: JSON.stringify(resData)
      });
    }

    // 解析模型回傳的 JSON
    let resultObj;
    try {
      const cleanJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      resultObj = JSON.parse(cleanJson);
    } catch (parseErr) {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultObj = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`無法將模型內容解析為物件: ${rawContent}`);
      }
    }

    return res.status(200).json(resultObj);

  } catch (error) {
    console.error('後端 OCR 處理失敗:', error);
    return res.status(500).json({
      error: '伺服器端辨識處理失敗',
      details: error.message || String(error)
    });
  }
}
