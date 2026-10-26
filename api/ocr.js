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

    const promptText = `你是一個極度精準的繁體中文商業名片 OCR 專家。請仔細分析這張名片圖片，精確擷取以下 4 個核心欄位，並嚴格只回傳 JSON 格式：
{
  "company": "公司完整官方全名（包含股份有限公司、科技有限公司、企業社等，繁體中文優先）",
  "name": "聯絡人中文姓名（不要包含經理、處長、業務等職稱或稱謂）",
  "addresses": ["公司地址或分公司/據點清單，包含縣市區路門牌樓層。若有多個據點請列入陣列，若無則為空陣列 []"],
  "email": "正確的電子信箱（包含 @ 與 domain，若無則為空字串 \"\"）"
}
注意：只輸出合法的純 JSON，絕不包含多餘的對話或說明文字。若名片上未出現該資訊請留空，絕不自行捏造。`;

    // 依據 Google 官方最新規範：移除已廢棄的 temperature 參數，保留純淨的 application/json 回傳
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
        responseMimeType: "application/json"
      }
    };

    // 官方活躍端點隊列：首選結構化數據提取與低延遲的 3.5-flash-lite，備選 3.8-flash
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
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
            lastError = `API 未回傳有效文字: ${resText}`;
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
            lastError = `無法解析 JSON 內容: ${rawContent}`;
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
