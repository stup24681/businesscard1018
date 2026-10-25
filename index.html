export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // 跨域 CORS 設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
    const isBatch = imageList.length > 1;

    // 依官方規範建構 parts
    const parts = [];

    // 1. 放入圖片資料
    imageList.forEach((imgBase64, idx) => {
      let mimeType = 'image/jpeg';
      const mimeMatch = imgBase64.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });

      if (isBatch) {
        parts.push({ text: `這是第 ${idx + 1} 張名片圖片。` });
      }
    });

    // 2. 指令提示詞
    const promptText = isBatch
      ? `請依序辨識上方這 ${imageList.length} 張名片圖片。每一張名片提取四大核心資訊：
1. company: 公司全名
2. name: 聯絡人姓名
3. addresses: 公司地點或地址陣列（若有多個地點請全列出）
4. email: 電子信箱

注意：
- 務必嚴格輸出包含 ${imageList.length} 個物件的 JSON 陣列，順序與圖片順序一致。
- 僅根據圖片文字提取，不可自行捏造。若無該資訊請留空字串 "" 或空陣列 []。`
      : `請分析上方名片圖片，精確提取四大核心資訊：
1. company: 公司全名
2. name: 聯絡人姓名
3. addresses: 公司地點或地址陣列
4. email: 電子信箱

注意：
- 輸出包含 company, name, addresses, email 的 JSON 物件。
- 僅根據圖片文字提取，不可自行捏造。若無該資訊請留空字串 "" 或空陣列 []。`;

    parts.push({ text: promptText });

    // 3. 回傳 Schema 定義
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
        maxOutputTokens: isBatch ? 2000 : 800,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    // 階梯式高可用模型矩陣：以零塞車、低延遲的 flash-latest 與 flash-lite 優先避開 503
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
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
          console.warn(`Gemini API [${model}] 回應非 200 (${response.status})，嘗試備援通道:`, errText);
          lastError = errText;
          // 若遇 503 (high demand) 或 429，立即繼續 for 迴圈嘗試下一個模型
        }
      } catch (e) {
        lastError = e.message;
      }
    }

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
