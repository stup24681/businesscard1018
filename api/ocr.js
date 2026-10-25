export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // 跨域 CORS 設定
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

  const { image, images } = req.body || {};
  const imageList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);

  if (imageList.length === 0) {
    return res.status(400).json({ error: '未接收到名片圖片資料' });
  }

  try {
    // 構建多圖或單圖的 parts 陣列
    const parts = [];

    imageList.forEach((imgBase64, idx) => {
      // 提取乾淨的 Base64 數據
      const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // 官方標準 REST API 駝峰命名格式：inlineData + mimeType
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
      parts.push({
        text: `[這是第 ${idx + 1} 張名片圖片]`
      });
    });

    const isBatch = imageList.length > 1;
    const promptInstruction = isBatch
      ? `請依序辨識上方這 ${imageList.length} 張名片圖片。每一張名片提取出四大核心資訊：
1. company: 公司全名
2. name: 聯絡人姓名
3. addresses: 公司地點或地址陣列（若有多個分公司或地點請全列出）
4. email: 電子信箱

注意：
- 請務必嚴格輸出一個包含 ${imageList.length} 個物件的 JSON 陣列，順序與圖片順序一致。
- 僅根據圖片中實際出現的字樣提取，絕對不可自行捏造。若無該資訊請留空字串 "" 或空陣列 []。`
      : `請分析上方這張名片圖片，精確提取四大核心資訊：
1. company: 公司全名
2. name: 聯絡人姓名
3. addresses: 公司地點或地址陣列
4. email: 電子信箱

注意：
- 請輸出包含 company, name, addresses, email 的 JSON 物件。
- 僅根據圖片中實際文字提取，不可自行捏造。無該資訊請留空字串或空陣列。`;

    parts.push({ text: promptInstruction });

    // 定義回應結構（單張為 OBJECT，多張為 ARRAY）
    const responseSchema = isBatch
      ? {
          type: "ARRAY",
          items: {
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
      : {
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
        };

    const payload = {
      contents: [
        {
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: isBatch ? 1500 : 500,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    // 依序嘗試 Google 官方目前要求與支援的模型
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-2.5-flash'
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
          const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            return res.status(200).json(parsed);
          }
        } else {
          const errText = await response.text();
          console.error(`Gemini API [${model}] 回傳錯誤 (${response.status}):`, errText);
          lastError = errText;
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    // 若所有模型皆失敗，回傳具體錯誤訊息
    return res.status(500).json({
      error: 'Google API 呼叫失敗',
      details: lastError
    });

  } catch (error) {
    console.error('後端 OCR 處理失敗:', error);
    return res.status(500).json({
      error: '伺服器辨識處理失敗',
      details: error.message
    });
  }
}
