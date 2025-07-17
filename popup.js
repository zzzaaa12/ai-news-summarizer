// 彈出視窗腳本
document.addEventListener('DOMContentLoaded', function() {
  const aiServiceSelect = document.getElementById('aiService');
  const openaiKeyInput = document.getElementById('openaiKey');
  const geminiKeyInput = document.getElementById('geminiKey');
  const openaiModelSelect = document.getElementById('openaiModel');
  const geminiModelSelect = document.getElementById('geminiModel');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  const openaiGroup = document.getElementById('openaiGroup');
  const geminiGroup = document.getElementById('geminiGroup');
  const openaiModelGroup = document.getElementById('openaiModelGroup');
  const geminiModelGroup = document.getElementById('geminiModelGroup');

  // 載入已保存的設定
  chrome.storage.sync.get([
    'aiService', 
    'openaiApiKey', 
    'geminiApiKey', 
    'openaiModel', 
    'geminiModel'
  ], function(result) {
    // 設定AI服務選擇
    aiServiceSelect.value = result.aiService || 'gemini';
    
    // 設定API密鑰
    if (result.openaiApiKey) {
      openaiKeyInput.value = result.openaiApiKey;
    }
    if (result.geminiApiKey) {
      geminiKeyInput.value = result.geminiApiKey;
    }
    
    // 設定模型選擇
    openaiModelSelect.value = result.openaiModel || 'gpt-4o-mini';
    geminiModelSelect.value = result.geminiModel || 'gemini-2.5-flash-lite-preview-06-17';
    
    // 更新UI顯示
    updateUIVisibility();
  });

  // AI服務選擇變更時更新UI
  aiServiceSelect.addEventListener('change', updateUIVisibility);

  function updateUIVisibility() {
    const selectedService = aiServiceSelect.value;
    
    if (selectedService === 'openai') {
      openaiGroup.style.display = 'block';
      geminiGroup.style.display = 'none';
      openaiModelGroup.style.display = 'block';
      geminiModelGroup.style.display = 'none';
    } else {
      openaiGroup.style.display = 'none';
      geminiGroup.style.display = 'block';
      openaiModelGroup.style.display = 'none';
      geminiModelGroup.style.display = 'block';
    }
  }

  // 保存設定
  saveBtn.addEventListener('click', function() {
    const selectedService = aiServiceSelect.value;
    const openaiKey = openaiKeyInput.value.trim();
    const geminiKey = geminiKeyInput.value.trim();
    const openaiModel = openaiModelSelect.value;
    const geminiModel = geminiModelSelect.value;
    
    // 驗證API密鑰
    if (selectedService === 'openai') {
      if (!openaiKey) {
        showStatus('請輸入 OpenAI API 密鑰', 'error');
        return;
      }
      if (!openaiKey.startsWith('sk-')) {
        showStatus('OpenAI API 密鑰格式不正確', 'error');
        return;
      }
    } else if (selectedService === 'gemini') {
      if (!geminiKey) {
        showStatus('請輸入 Gemini API 密鑰', 'error');
        return;
      }
      if (!geminiKey.startsWith('AI')) {
        showStatus('Gemini API 密鑰格式不正確', 'error');
        return;
      }
    }

    // 保存到Chrome存儲
    chrome.storage.sync.set({
      aiService: selectedService,
      openaiApiKey: openaiKey,
      geminiApiKey: geminiKey,
      openaiModel: openaiModel,
      geminiModel: geminiModel
    }, function() {
      if (chrome.runtime.lastError) {
        showStatus('保存失敗: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showStatus('設定已保存！', 'success');
        
        // 1.5秒後關閉彈出視窗
        setTimeout(() => {
          window.close();
        }, 1500);
      }
    });
  });

  // 顯示狀態消息
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // 5秒後隱藏狀態消息
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }

  // Enter鍵保存
  [openaiKeyInput, geminiKeyInput].forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    });
  });

  // 初始化UI
  updateUIVisibility();
});