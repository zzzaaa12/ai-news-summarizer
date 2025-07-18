// 彈出視窗腳本
document.addEventListener('DOMContentLoaded', function() {
  const aiServiceSelect = document.getElementById('aiService');
  const openaiKeyInput = document.getElementById('openaiKey');
  const geminiKeyInput = document.getElementById('geminiKey');
  const xaiKeyInput = document.getElementById('xaiKey');
  const openaiModelInput = document.getElementById('openaiModel');
  const geminiModelInput = document.getElementById('geminiModel');
  const xaiModelInput = document.getElementById('xaiModel');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  const openaiGroup = document.getElementById('openaiGroup');
  const geminiGroup = document.getElementById('geminiGroup');
  const xaiGroup = document.getElementById('xaiGroup');
  const openaiModelGroup = document.getElementById('openaiModelGroup');
  const geminiModelGroup = document.getElementById('geminiModelGroup');
  const xaiModelGroup = document.getElementById('xaiModelGroup');

  // 載入已保存的設定
  chrome.storage.sync.get([
    'aiService', 
    'openaiApiKey', 
    'geminiApiKey', 
    'xaiApiKey',
    'openaiModel', 
    'geminiModel',
    'xaiModel'
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
    if (result.xaiApiKey) {
      xaiKeyInput.value = result.xaiApiKey;
    }
    
    // 設定模型選擇
    openaiModelInput.value = result.openaiModel || 'gpt-4o-mini';
    geminiModelInput.value = result.geminiModel || 'gemini-2.5-flash-lite-preview-06-17';
    xaiModelInput.value = result.xaiModel || 'grok-4-0709';
    
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
      xaiGroup.style.display = 'none';
      openaiModelGroup.style.display = 'block';
      geminiModelGroup.style.display = 'none';
      xaiModelGroup.style.display = 'none';
    } else if (selectedService === 'xai') {
      openaiGroup.style.display = 'none';
      geminiGroup.style.display = 'none';
      xaiGroup.style.display = 'block';
      openaiModelGroup.style.display = 'none';
      geminiModelGroup.style.display = 'none';
      xaiModelGroup.style.display = 'block';
    } else {
      openaiGroup.style.display = 'none';
      geminiGroup.style.display = 'block';
      xaiGroup.style.display = 'none';
      openaiModelGroup.style.display = 'none';
      geminiModelGroup.style.display = 'block';
      xaiModelGroup.style.display = 'none';
    }
  }

  // 保存設定
  saveBtn.addEventListener('click', function() {
    const selectedService = aiServiceSelect.value;
    const openaiKey = openaiKeyInput.value.trim();
    const geminiKey = geminiKeyInput.value.trim();
    const xaiKey = xaiKeyInput.value.trim();
    const openaiModel = openaiModelInput.value.trim();
    const geminiModel = geminiModelInput.value.trim();
    const xaiModel = xaiModelInput.value.trim();
    
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
    } else if (selectedService === 'xai') {
      if (!xaiKey) {
        showStatus('請輸入 xAI API 密鑰', 'error');
        return;
      }
      if (!xaiKey.startsWith('xai-')) {
        showStatus('xAI API 密鑰格式不正確', 'error');
        return;
      }
    }

    // 保存到Chrome存儲
    chrome.storage.sync.set({
      aiService: selectedService,
      openaiApiKey: openaiKey,
      geminiApiKey: geminiKey,
      xaiApiKey: xaiKey,
      openaiModel: openaiModel,
      geminiModel: geminiModel,
      xaiModel: xaiModel
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
  [openaiKeyInput, geminiKeyInput, xaiKeyInput, openaiModelInput, geminiModelInput, xaiModelInput].forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    });
  });

  // 初始化UI
  updateUIVisibility();
});