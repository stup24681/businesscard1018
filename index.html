<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>智慧虛擬名片夾 (CardVault Pro)</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- SheetJS for Excel Export -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

  <style>
    .card-hover {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-hover:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.12);
    }
    .custom-scroll::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 9999px;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased">

  <!-- 頂部導覽列 -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
          <i data-lucide="contact" class="w-6 h-6"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            智慧虛擬名片夾
          </h1>
          <p class="text-xs text-slate-400 font-medium">CardVault Pro 企業雲端版</p>
        </div>
      </div>

      <!-- 右側快捷操作 -->
      <div class="flex items-center space-x-2.5">
        <button id="batchAddBtn" class="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-semibold transition border border-indigo-200 shadow-sm">
          <i data-lucide="layers" class="w-4 h-4"></i>
          <span class="hidden sm:inline">批量新增 (上限10張)</span>
          <span class="sm:hidden">批量</span>
        </button>
        <button id="singleAddBtn" class="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>新增名片</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 主內容區塊 -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <!-- 篩選與工具列 -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 mb-6 space-y-4">
      <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <!-- 搜尋輸入框 -->
        <div class="relative flex-1">
          <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input type="text" id="searchInput" placeholder="搜尋姓名、公司、地址、Email、備註..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition">
        </div>

        <!-- 篩選下拉 -->
        <div class="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <select id="companyFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition max-w-[150px] truncate">
            <option value="">所有公司</option>
          </select>

          <select id="locationFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition max-w-[130px] truncate">
            <option value="">所有地點</option>
          </select>

          <!-- 匯出 Excel -->
          <button id="exportExcelBtn" class="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-semibold transition">
            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
            <span class="hidden sm:inline">匯出 Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 批次勾選浮動工具列 (有勾選名片時顯示) -->
    <div id="selectionBar" class="hidden bg-indigo-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between mb-6 transition-all animate-in fade-in slide-in-from-top-2">
      <div class="flex items-center space-x-3">
        <input type="checkbox" id="selectAllCheckbox" class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500">
        <span class="text-sm font-medium">已選取 <span id="selectedCount" class="font-bold text-amber-300">0</span> 張名片</span>
      </div>
      <div class="flex items-center space-x-2">
        <button id="batchBccBtn" class="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-xs font-semibold transition" title="一鍵將所有勾選聯絡人加入密件副本">
          <i data-lucide="mail" class="w-3.5 h-3.5"></i>
          <span>一鍵 BCC 密件群發</span>
        </button>
        <button id="batchCustomMailBtn" class="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold transition" title="依序開啟客製化姓名與公司信件">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          <span>個別客製發信</span>
        </button>
        <button id="batchDeleteBtn" class="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-semibold transition">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>批次刪除</span>
        </button>
      </div>
    </div>

    <!-- 名片清單 Grid -->
    <div id="cardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- 名片卡片將動態注入於此 -->
    </div>

    <!-- 空狀態 -->
    <div id="emptyState" class="hidden text-center py-20">
      <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="inbox" class="w-8 h-8"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-700 mb-1">目前尚無名片資料</h3>
      <p class="text-sm text-slate-400 mb-5">點擊右上角「新增名片」拍照或「批量新增」立即匯入名片！</p>
      <button onclick="document.getElementById('singleAddBtn').click()" class="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>立即新增第一張名片</span>
      </button>
    </div>

  </main>

  <!-- 單張新增 / 編輯名片 Modal -->
  <div id="cardModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transition-all">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 id="modalTitle" class="text-lg font-bold text-slate-800">新增名片</h3>
        <button id="closeModalBtn" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- 圖片上傳 / 預覽 / 辨識 -->
      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">名片照片</label>
          <div class="flex gap-2">
            <input type="file" id="cardImageInput" accept="image/*" class="hidden">
            <button type="button" onclick="document.getElementById('cardImageInput').click()" class="flex-1 py-2.5 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition flex items-center justify-center space-x-2">
              <i data-lucide="camera" class="w-4 h-4 text-slate-500"></i>
              <span id="uploadBtnText">拍照或選取照片</span>
            </button>
            <button type="button" id="aiOcrBtn" class="hidden px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition flex items-center space-x-1.5 shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>AI 辨識</span>
            </button>
          </div>
          <!-- 圖片預覽 -->
          <div id="imagePreviewContainer" class="hidden mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex items-center justify-center">
            <img id="imagePreview" src="" alt="名片預覽" class="w-full object-contain max-h-48">
          </div>
        </div>

        <!-- 欄位表單 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-xs font-bold text-slate-500 mb-1">姓名 <span class="text-rose-500">*</span></label>
            <input type="text" id="cardName" placeholder="聯絡人姓名" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-xs font-bold text-slate-500 mb-1">公司名稱</label>
            <input type="text" id="cardCompany" placeholder="公司全名" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">電子信箱</label>
          <input type="email" id="cardEmail" placeholder="example@company.com" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">公司地點 / 地址 (可多個，逗號分隔)</label>
          <input type="text" id="cardAddresses" placeholder="例如：新北市新莊區五工路... , 台中市西屯區..." class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">備註資訊</label>
          <textarea id="cardNotes" rows="2" placeholder="初次見面地點、職稱、對談要點..." class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"></textarea>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <button type="button" id="cancelModalBtn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">取消</button>
          <button type="button" id="saveCardBtn" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition">儲存名片</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 批量新增名片 Modal (上限 10 張) -->
  <div id="batchModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 transition-all max-h-[92vh] flex flex-col">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
        <div class="flex items-center space-x-2">
          <i data-lucide="layers" class="w-5 h-5 text-indigo-600"></i>
          <h3 class="text-lg font-bold text-slate-800">批量新增名片（上限 10 張）</h3>
        </div>
        <button id="closeBatchModalBtn" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- 拖曳或選取區塊 -->
      <div class="mt-4 flex-shrink-0">
        <input type="file" id="batchFileInput" accept="image/*" multiple class="hidden">
        <div onclick="document.getElementById('batchFileInput').click()" class="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-6 text-center cursor-pointer transition">
          <div class="w-12 h-12 bg-white text-indigo-600 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2">
            <i data-lucide="upload-cloud" class="w-6 h-6"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-700">點擊選取名片圖檔（可多選）</h4>
          <p class="text-xs text-slate-400 mt-1">選取後系統將自動開始辨識，原汁原味超快速度</p>
          <button type="button" class="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold pointer-events-none">
            選擇名片圖檔
          </button>
        </div>
      </div>

      <!-- 進度狀態條 -->
      <div id="batchProgressContainer" class="hidden mt-4 flex-shrink-0 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div class="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
          <span id="batchProgressText">準備中...</span>
          <span id="batchProgressCount">0 / 0</span>
        </div>
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div id="batchProgressBar" class="bg-indigo-600 h-full transition-all duration-300 w-0"></div>
        </div>
      </div>

      <!-- 辨識結果清單 -->
      <div id="batchResultsList" class="mt-4 flex-1 overflow-y-auto space-y-2.5 custom-scroll pr-1 min-h-[160px]">
        <!-- 批量項目動態插入 -->
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-slate-100 flex-shrink-0 mt-4">
        <button type="button" id="cancelBatchBtn" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">取消</button>
        <button type="button" id="saveAllBatchBtn" class="hidden px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition">一鍵全數存入卡夾</button>
      </div>
    </div>
  </div>

  <!-- 異常回報視窗 (取代 alert) -->
  <div id="errorModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2 text-rose-600">
          <i data-lucide="alert-triangle" class="w-5 h-5"></i>
          <h3 class="text-base font-bold">辨識異常回報</h3>
        </div>
        <button onclick="document.getElementById('errorModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div class="mt-4">
        <p class="text-xs text-slate-500 mb-2">伺服器回傳訊息：</p>
        <div id="errorModalContent" class="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3.5 rounded-xl font-mono break-all max-h-48 overflow-y-auto"></div>
      </div>
      <div class="mt-5 flex justify-end">
        <button onclick="document.getElementById('errorModal').classList.add('hidden')" class="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700">我知道了</button>
      </div>
    </div>
  </div>

  <!-- JavaScript 核心程式邏輯 -->
  <script>
    // 狀態管理
    let cards = [];
    let selectedIds = new Set();
    let currentEditId = null;
    let singleImageBase64 = null;
    let batchItems = [];

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      loadCards();
      bindEvents();
    });

    // 本地儲存載入
    function loadCards() {
      const saved = localStorage.getItem('cardvault_cards');
      if (saved) {
        try {
          cards = JSON.parse(saved);
        } catch (e) {
          cards = [];
        }
      }
      renderCards();
      updateCompanyAndLocationFilters();
    }

    // 儲存至本地
    function saveCards() {
      localStorage.setItem('cardvault_cards', JSON.stringify(cards));
      renderCards();
      updateCompanyAndLocationFilters();
    }

    // 綁定各類事件
    function bindEvents() {
      // 搜尋與篩選
      document.getElementById('searchInput').addEventListener('input', renderCards);
      document.getElementById('companyFilter').addEventListener('change', renderCards);
      document.getElementById('locationFilter').addEventListener('change', renderCards);

      // 新增與批量彈窗開啟
      document.getElementById('singleAddBtn').addEventListener('click', () => openCardModal());
      document.getElementById('closeModalBtn').addEventListener('click', closeCardModal);
      document.getElementById('cancelModalBtn').addEventListener('click', closeCardModal);

      document.getElementById('batchAddBtn').addEventListener('click', openBatchModal);
      document.getElementById('closeBatchModalBtn').addEventListener('click', closeBatchModal);
      document.getElementById('cancelBatchBtn').addEventListener('click', closeBatchModal);

      // 單張圖片選取
      document.getElementById('cardImageInput').addEventListener('change', handleSingleImageUpload);
      document.getElementById('aiOcrBtn').addEventListener('click', runSingleAiOcr);
      document.getElementById('saveCardBtn').addEventListener('click', saveSingleCard);

      // 批量圖片選取
      document.getElementById('batchFileInput').addEventListener('change', handleBatchFileUpload);
      document.getElementById('saveAllBatchBtn').addEventListener('click', saveAllBatchCards);

      // 批次功能列事件
      document.getElementById('selectAllCheckbox').addEventListener('change', handleSelectAll);
      document.getElementById('batchBccBtn').addEventListener('click', handleBatchBcc);
      document.getElementById('batchCustomMailBtn').addEventListener('click', handleBatchCustomMail);
      document.getElementById('batchDeleteBtn').addEventListener('click', handleBatchDelete);

      // 匯出 Excel
      document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    }

    // 圖片超高壓縮長邊 1000px，體積約 50KB~80KB，文字銳利且傳輸極速
    function compressImageFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1000;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.78);
            resolve(compressedBase64);
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // 單張圖片選取處理
    async function handleSingleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      try {
        singleImageBase64 = await compressImageFile(file);
        document.getElementById('imagePreview').src = singleImageBase64;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
        document.getElementById('aiOcrBtn').classList.remove('hidden');
        document.getElementById('uploadBtnText').textContent = '更換照片';
      } catch (err) {
        showError('圖片載入失敗', err.message);
      }
    }

    // 單張 AI 辨識執行
    async function runSingleAiOcr() {
      if (!singleImageBase64) return;
      const aiBtn = document.getElementById('aiOcrBtn');
      const originalText = aiBtn.innerHTML;
      aiBtn.disabled = true;
      aiBtn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>辨識中...</span>`;
      lucide.createIcons();

      try {
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: singleImageBase64 })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.details || errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.name) document.getElementById('cardName').value = data.name;
        if (data.company) document.getElementById('cardCompany').value = data.company;
        if (data.email) document.getElementById('cardEmail').value = data.email;
        if (data.addresses && Array.isArray(data.addresses)) {
          document.getElementById('cardAddresses').value = data.addresses.join(', ');
        }
      } catch (err) {
        showError('辨識失敗', err.message);
      } finally {
        aiBtn.disabled = false;
        aiBtn.innerHTML = originalText;
        lucide.createIcons();
      }
    }

    // 開啟單張 Modal
    function openCardModal(card = null) {
      currentEditId = card ? card.id : null;
      document.getElementById('modalTitle').textContent = card ? '編輯名片' : '新增名片';
      document.getElementById('cardName').value = card ? card.name : '';
      document.getElementById('cardCompany').value = card ? card.company : '';
      document.getElementById('cardEmail').value = card ? card.email : '';
      document.getElementById('cardAddresses').value = card ? (card.addresses || []).join(', ') : '';
      document.getElementById('cardNotes').value = card ? card.notes : '';

      singleImageBase64 = card ? card.image : null;
      if (singleImageBase64) {
        document.getElementById('imagePreview').src = singleImageBase64;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
        document.getElementById('aiOcrBtn').classList.remove('hidden');
        document.getElementById('uploadBtnText').textContent = '更換照片';
      } else {
        document.getElementById('imagePreviewContainer').classList.add('hidden');
        document.getElementById('aiOcrBtn').classList.add('hidden');
        document.getElementById('uploadBtnText').textContent = '拍照或選取照片';
      }

      document.getElementById('cardModal').classList.remove('hidden');
    }

    function closeCardModal() {
      document.getElementById('cardModal').classList.add('hidden');
      document.getElementById('cardImageInput').value = '';
      currentEditId = null;
      singleImageBase64 = null;
    }

    // 儲存單張名片
    function saveSingleCard() {
      const name = document.getElementById('cardName').value.trim();
      const company = document.getElementById('cardCompany').value.trim();
      const email = document.getElementById('cardEmail').value.trim();
      const addressesStr = document.getElementById('cardAddresses').value.trim();
      const notes = document.getElementById('cardNotes').value.trim();

      if (!name) {
        alert('請輸入姓名');
        return;
      }

      const addresses = addressesStr ? addressesStr.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [];

      if (currentEditId) {
        // 更新現有
        const idx = cards.findIndex(c => c.id === currentEditId);
        if (idx !== -1) {
          cards[idx] = {
            ...cards[idx],
            name,
            company,
            email,
            addresses,
            notes,
            image: singleImageBase64 || cards[idx].image,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        // 全新新增
        const newCard = {
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name,
          company,
          email,
          addresses,
          notes,
          image: singleImageBase64,
          isPinned: false,
          isFavorite: false,
          createdAt: new Date().toISOString()
        };
        cards.unshift(newCard);
      }

      saveCards();
      closeCardModal();
    }

    // 批量新增 Modal
    function openBatchModal() {
      batchItems = [];
      document.getElementById('batchFileInput').value = '';
      document.getElementById('batchResultsList').innerHTML = '';
      document.getElementById('batchProgressContainer').classList.add('hidden');
      document.getElementById('saveAllBatchBtn').classList.add('hidden');
      document.getElementById('batchModal').classList.remove('hidden');
    }

    function closeBatchModal() {
      document.getElementById('batchModal').classList.add('hidden');
      batchItems = [];
    }

    // 批量檔案選取與一次性打包辨識
    async function handleBatchFileUpload(e) {
      const files = Array.from(e.target.files).slice(0, 10);
      if (files.length === 0) return;

      const progressContainer = document.getElementById('batchProgressContainer');
      const progressBar = document.getElementById('batchProgressBar');
      const progressText = document.getElementById('batchProgressText');
      const progressCount = document.getElementById('batchProgressCount');
      const resultsList = document.getElementById('batchResultsList');

      progressContainer.classList.remove('hidden');
      resultsList.innerHTML = '';
      batchItems = [];

      progressText.textContent = '正在壓縮並載入圖片...';
      progressBar.style.width = '20%';
      progressCount.textContent = `0 / ${files.length}`;

      const images = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const base64 = await compressImageFile(files[i]);
          images.push(base64);
          batchItems.push({
            id: 'batch_' + i,
            image: base64,
            name: '',
            company: '',
            email: '',
            addresses: [],
            status: 'pending',
            errorMsg: ''
          });
        } catch (err) {
          console.error('壓縮圖片失敗:', err);
        }
      }

      renderBatchItems();

      progressText.textContent = 'AI 正在極速辨識中（一次打包，請稍候）...';
      progressBar.style.width = '60%';

      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: images })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.details || errData.error || `HTTP ${response.status}`);
        }

        const results = await response.json();
        const resultArray = Array.isArray(results) ? results : [results];

        resultArray.forEach((resItem, idx) => {
          if (batchItems[idx]) {
            batchItems[idx].company = resItem.company || '';
            batchItems[idx].name = resItem.name || '';
            batchItems[idx].email = resItem.email || '';
            batchItems[idx].addresses = Array.isArray(resItem.addresses) ? resItem.addresses : (resItem.addresses ? [resItem.addresses] : []);
            batchItems[idx].status = (batchItems[idx].name || batchItems[idx].company) ? 'done' : 'error';
          }
        });

        progressBar.style.width = '100%';
        progressText.textContent = '辨識完畢！';
        progressCount.textContent = `${batchItems.length} / ${batchItems.length}`;
        document.getElementById('saveAllBatchBtn').classList.remove('hidden');

      } catch (err) {
        console.error('批量辨識失敗:', err);
        progressText.textContent = '辨識發生錯誤';
        batchItems.forEach(item => {
          item.status = 'error';
          item.errorMsg = err.message;
        });
      }

      renderBatchItems();
    }

    // 繪製批量清單項目
    function renderBatchItems() {
      const resultsList = document.getElementById('batchResultsList');
      resultsList.innerHTML = '';

      batchItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80';
        
        const statusBadge = item.status === 'done' 
          ? `<span class="text-xs font-bold text-emerald-600 flex-shrink-0 flex items-center"><i data-lucide="check" class="w-3.5 h-3.5 mr-0.5"></i>完成</span>`
          : (item.status === 'error'
              ? `<button type="button" onclick="showError('辨識異常回報', '${encodeURIComponent(item.errorMsg || '辨識未能成功提取文字')}')" class="text-xs font-bold text-rose-500 hover:text-rose-700 flex-shrink-0 flex items-center underline">未辨出 <i data-lucide="info" class="w-3.5 h-3.5 ml-0.5"></i></button>`
              : `<span class="text-xs font-semibold text-indigo-600 flex-shrink-0 flex items-center"><i data-lucide="loader" class="w-3.5 h-3.5 animate-spin mr-1"></i>辨識中</span>`);

        row.innerHTML = `
          <img src="${item.image}" class="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0">
          <input type="text" placeholder="公司名稱" value="${item.company}" onchange="updateBatchField(${index}, 'company', this.value)" class="flex-1 min-w-[100px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
          <input type="text" placeholder="姓名" value="${item.name}" onchange="updateBatchField(${index}, 'name', this.value)" class="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
          <input type="text" placeholder="地址" value="${item.addresses.join(', ')}" onchange="updateBatchField(${index}, 'addresses', this.value)" class="flex-1 min-w-[120px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
          <input type="email" placeholder="Email" value="${item.email}" onchange="updateBatchField(${index}, 'email', this.value)" class="flex-1 min-w-[120px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
          ${statusBadge}
        `;
        resultsList.appendChild(row);
      });
      lucide.createIcons();
    }

    function updateBatchField(index, field, value) {
      if (!batchItems[index]) return;
      if (field === 'addresses') {
        batchItems[index].addresses = value ? value.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [];
      } else {
        batchItems[index][field] = value;
      }
    }

    // 一鍵全數存入卡夾
    function saveAllBatchCards() {
      let addedCount = 0;
      batchItems.forEach(item => {
        const name = item.name.trim() || '未知名稱';
        const newCard = {
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: name,
          company: item.company.trim(),
          email: item.email.trim(),
          addresses: item.addresses,
          notes: '',
          image: item.image,
          isPinned: false,
          isFavorite: false,
          createdAt: new Date().toISOString()
        };
        cards.unshift(newCard);
        addedCount++;
      });

      saveCards();
      closeBatchModal();
    }

    // 異常彈窗展示
    function showError(title, msg) {
      const decoded = decodeURIComponent(msg);
      document.getElementById('errorModalContent').textContent = decoded;
      document.getElementById('errorModal').classList.remove('hidden');
    }

    // 渲染名片清單
    function renderCards() {
      const grid = document.getElementById('cardsGrid');
      const empty = document.getElementById('emptyState');
      const search = document.getElementById('searchInput').value.trim().toLowerCase();
      const compFilter = document.getElementById('companyFilter').value;
      const locFilter = document.getElementById('locationFilter').value;

      let filtered = cards.filter(c => {
        const matchesSearch = !search || 
          c.name.toLowerCase().includes(search) || 
          (c.company && c.company.toLowerCase().includes(search)) ||
          (c.email && c.email.toLowerCase().includes(search)) ||
          (c.notes && c.notes.toLowerCase().includes(search)) ||
          ((c.addresses || []).some(a => a.toLowerCase().includes(search)));

        const matchesComp = !compFilter || c.company === compFilter;
        const matchesLoc = !locFilter || (c.addresses || []).some(a => a.includes(locFilter));

        return matchesSearch && matchesComp && matchesLoc;
      });

      // 排序：置頂優先，最新建立次之
      filtered.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        updateSelectionBar();
        return;
      }

      empty.classList.add('hidden');
      grid.innerHTML = filtered.map(c => {
        const isSelected = selectedIds.has(c.id);
        const addressesHtml = (c.addresses && c.addresses.length > 0)
          ? c.addresses.map(addr => `
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}" target="_blank" class="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 px-2 py-1 rounded-lg transition max-w-full truncate" title="點擊在 Google 地圖中開啟">
                <i data-lucide="map-pin" class="w-3 h-3 mr-1 flex-shrink-0 text-indigo-500"></i>
                <span class="truncate">${addr}</span>
              </a>
            `).join('')
          : '<span class="text-xs text-slate-300">尚未填寫地址</span>';

        return `
          <div class="card-hover bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center space-x-3">
                  <input type="checkbox" onchange="toggleSelectCard('${c.id}')" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                  <div>
                    <h3 class="text-base font-bold text-slate-800">${c.name}</h3>
                    <p class="text-xs text-slate-500 font-medium">${c.company || '個人 / 未填寫公司'}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <button onclick="togglePinCard('${c.id}')" class="p-1.5 rounded-lg hover:bg-slate-100 transition ${c.isPinned ? 'text-amber-500' : 'text-slate-300'}" title="置頂名片">
                    <i data-lucide="pin" class="w-4 h-4"></i>
                  </button>
                  <button onclick="openCardModal(cards.find(x => x.id === '${c.id}'))" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition" title="編輯">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                  </button>
                  <button onclick="deleteCard('${c.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition" title="刪除">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- 資訊列 -->
              <div class="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <!-- Email -->
                <div class="flex items-center text-slate-600 truncate">
                  <i data-lucide="mail" class="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0"></i>
                  ${c.email 
                    ? `<a href="mailto:${c.email}" class="hover:text-indigo-600 hover:underline truncate">${c.email}</a>`
                    : `<span class="text-slate-300">未提供 Email</span>`}
                </div>

                <!-- 地點 -->
                <div class="flex flex-col gap-1">
                  ${addressesHtml}
                </div>

                <!-- 備註 -->
                ${c.notes ? `
                  <div class="mt-2 text-slate-500 bg-slate-50 p-2 rounded-xl text-xs line-clamp-2">
                    ${c.notes}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- 照片小預覽 (若有) -->
            ${c.image ? `
              <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] text-slate-400">已存有名片照片</span>
                <button onclick="previewCardImage('${c.image}')" class="text-xs text-indigo-600 font-semibold hover:underline">查看名片圖</button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      lucide.createIcons();
      updateSelectionBar();
    }

    // 圖片預覽彈窗
    function previewCardImage(base64) {
      const win = window.open();
      win.document.write(`<img src="${base64}" style="max-width:100%; height:auto; margin:auto; display:block;">`);
    }

    // 置頂切換
    function togglePinCard(id) {
      const card = cards.find(c => c.id === id);
      if (card) {
        card.isPinned = !card.isPinned;
        saveCards();
      }
    }

    // 刪除單張名片
    function deleteCard(id) {
      if (confirm('確定要刪除這張名片嗎？')) {
        cards = cards.filter(c => c.id !== id);
        selectedIds.delete(id);
        saveCards();
      }
    }

    // 勾選管理
    function toggleSelectCard(id) {
      if (selectedIds.has(id)) {
        selectedIds.delete(id);
      } else {
        selectedIds.add(id);
      }
      updateSelectionBar();
    }

    function handleSelectAll(e) {
      if (e.target.checked) {
        cards.forEach(c => selectedIds.add(c.id));
      } else {
        selectedIds.clear();
      }
      renderCards();
    }

    function updateSelectionBar() {
      const bar = document.getElementById('selectionBar');
      const countSpan = document.getElementById('selectedCount');
      const selectAll = document.getElementById('selectAllCheckbox');

      if (selectedIds.size > 0) {
        bar.classList.remove('hidden');
        countSpan.textContent = selectedIds.size;
        selectAll.checked = selectedIds.size === cards.length && cards.length > 0;
      } else {
        bar.classList.add('hidden');
        selectAll.checked = false;
      }
    }

    // 批次刪除
    function handleBatchDelete() {
      if (confirm(`確定要刪除選取的 ${selectedIds.size} 張名片嗎？`)) {
        cards = cards.filter(c => !selectedIds.has(c.id));
        selectedIds.clear();
        saveCards();
      }
    }

    // 批次 BCC 密件群發 (一鍵群發)
    function handleBatchBcc() {
      const selectedCards = cards.filter(c => selectedIds.has(c.id) && c.email);
      if (selectedCards.length === 0) {
        alert('選取的名片中沒有任何有效的 Email！');
        return;
      }
      const bccEmails = selectedCards.map(c => c.email).join(',');
      const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccEmails)}&subject=${encodeURIComponent('很高興與您交流！')}`;
      window.location.href = mailtoUrl;
    }

    // 個別客製發信
    function handleBatchCustomMail() {
      const selectedCards = cards.filter(c => selectedIds.has(c.id) && c.email);
      if (selectedCards.length === 0) {
        alert('選取的名片中沒有任何有效的 Email！');
        return;
      }
      
      let index = 0;
      function openNext() {
        if (index >= selectedCards.length) return;
        const c = selectedCards[index];
        const subject = encodeURIComponent(`${c.company ? c.company + ' ' : ''}${c.name} 您好！很高興與您交流`);
        const body = encodeURIComponent(`${c.name} 您好：\n\n很高興在本次活動與您交流！\n期待未來有更多合作機會。\n\n祝 研安`);
        window.open(`mailto:${c.email}?subject=${subject}&body=${body}`, '_blank');
        index++;
        if (index < selectedCards.length) {
          setTimeout(openNext, 800);
        }
      }
      openNext();
    }

    // 更新篩選下拉
    function updateCompanyAndLocationFilters() {
      const compSelect = document.getElementById('companyFilter');
      const locSelect = document.getElementById('locationFilter');
      const currentComp = compSelect.value;
      const currentLoc = locSelect.value;

      const companies = new Set();
      const locations = new Set();

      cards.forEach(c => {
        if (c.company) companies.add(c.company);
        (c.addresses || []).forEach(a => {
          const match = a.match(/(.+?[縣市])/);
          if (match) locations.add(match[1]);
        });
      });

      compSelect.innerHTML = '<option value="">所有公司</option>' + 
        Array.from(companies).map(co => `<option value="${co}" ${co === currentComp ? 'selected' : ''}>${co}</option>`).join('');

      locSelect.innerHTML = '<option value="">所有地點</option>' + 
        Array.from(locations).map(lo => `<option value="${lo}" ${lo === currentLoc ? 'selected' : ''}>${lo}</option>`).join('');
    }

    // 匯出 Excel
    function exportToExcel() {
      if (cards.length === 0) {
        alert('目前名片夾中沒有任何資料可供匯出');
        return;
      }

      const rows = cards.map(c => ({
        '聯絡人姓名': c.name,
        '公司名稱': c.company || '',
        '電子信箱': c.email || '',
        '公司地址': (c.addresses || []).join('; '),
        '備註': c.notes || '',
        '建立時間': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '名片清單');
      XLSX.writeFile(workbook, `名片清單_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  </script>
</body>
</html>
