// 彈出視窗腳本
document.addEventListener('DOMContentLoaded', function() {
  const aiServiceSelect = document.getElementById('aiService');
  const openaiKeyInput = document.getElementById('openaiKey');
  const geminiKeyInput = document.getElementById('geminiKey');
  const xaiKeyInput = document.getElementById('xaiKey');
  const cloudflareKeyInput = document.getElementById('cloudflareKey');
  const cloudflareAccountInput = document.getElementById('cloudflareAccount');
  const openaiModelInput = document.getElementById('openaiModel');
  const geminiModelInput = document.getElementById('geminiModel');
  const xaiModelInput = document.getElementById('xaiModel');
  const cloudflareModelInput = document.getElementById('cloudflareModel');
  const iconOnlyModeCheckbox = document.getElementById('iconOnlyMode');
  const iconPositionSelect = document.getElementById('iconPosition');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  const iconPositionGroup = document.getElementById('iconPositionGroup');

  const openaiGroup = document.getElementById('openaiGroup');
  const geminiGroup = document.getElementById('geminiGroup');
  const xaiGroup = document.getElementById('xaiGroup');
  const cloudflareGroup = document.getElementById('cloudflareGroup');
  const cloudflareAccountGroup = document.getElementById('cloudflareAccountGroup');
  const openaiModelGroup = document.getElementById('openaiModelGroup');
  const geminiModelGroup = document.getElementById('geminiModelGroup');
  const xaiModelGroup = document.getElementById('xaiModelGroup');
  const cloudflareModelGroup = document.getElementById('cloudflareModelGroup');

  // 載入已保存的設定
  chrome.storage.sync.get([
    'aiService',
    'openaiApiKey',
    'geminiApiKey',
    'xaiApiKey',
    'cloudflareApiKey',
    'cloudflareAccountId',
    'openaiModel',
    'geminiModel',
    'xaiModel',
    'cloudflareModel',
    'iconOnlyMode',
    'iconPosition'
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
    if (result.cloudflareApiKey) {
      cloudflareKeyInput.value = result.cloudflareApiKey;
    }
    if (result.cloudflareAccountId) {
      cloudflareAccountInput.value = result.cloudflareAccountId;
    }

    // 設定模型選擇
    openaiModelInput.value = result.openaiModel || 'gpt-4o-mini';
    geminiModelInput.value = result.geminiModel || 'gemini-2.5-flash-lite-preview-06-17';
    xaiModelInput.value = result.xaiModel || 'grok-4-0709';
    cloudflareModelInput.value = result.cloudflareModel || '@cf/meta/llama-3.1-8b-instruct';

    // 設定圖示模式
    iconOnlyModeCheckbox.checked = result.iconOnlyMode || false;
    iconPositionSelect.value = result.iconPosition || 'bottom-right';

    // 更新UI顯示
    updateUIVisibility();
  });

  // AI服務選擇變更時更新UI
  aiServiceSelect.addEventListener('change', updateUIVisibility);

  // 圖示模式變更時更新UI
  iconOnlyModeCheckbox.addEventListener('change', updateUIVisibility);

  function updateUIVisibility() {
    const selectedService = aiServiceSelect.value;

    // 隱藏所有組
    [openaiGroup, geminiGroup, xaiGroup, cloudflareGroup, cloudflareAccountGroup].forEach(group => {
      group.style.display = 'none';
    });
    [openaiModelGroup, geminiModelGroup, xaiModelGroup, cloudflareModelGroup].forEach(group => {
      group.style.display = 'none';
    });

    // 顯示對應的組
    if (selectedService === 'openai') {
      openaiGroup.style.display = 'block';
      openaiModelGroup.style.display = 'block';
    } else if (selectedService === 'xai') {
      xaiGroup.style.display = 'block';
      xaiModelGroup.style.display = 'block';
    } else if (selectedService === 'cloudflare') {
      cloudflareGroup.style.display = 'block';
      cloudflareAccountGroup.style.display = 'block';
      cloudflareModelGroup.style.display = 'block';
    } else {
      geminiGroup.style.display = 'block';
      geminiModelGroup.style.display = 'block';
    }

    // 顯示或隱藏圖示位置選項
    if (iconOnlyModeCheckbox.checked) {
      iconPositionGroup.style.display = 'block';
    } else {
      iconPositionGroup.style.display = 'none';
    }
  }

  // 保存設定
  saveBtn.addEventListener('click', function() {
    const selectedService = aiServiceSelect.value;
    const openaiKey = openaiKeyInput.value.trim();
    const geminiKey = geminiKeyInput.value.trim();
    const xaiKey = xaiKeyInput.value.trim();
    const cloudflareKey = cloudflareKeyInput.value.trim();
    const cloudflareAccount = cloudflareAccountInput.value.trim();
    const openaiModel = openaiModelInput.value.trim();
    const geminiModel = geminiModelInput.value.trim();
    const xaiModel = xaiModelInput.value.trim();
    const cloudflareModel = cloudflareModelInput.value.trim();

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
    } else if (selectedService === 'cloudflare') {
      if (!cloudflareKey) {
        showStatus('請輸入 Cloudflare API Token', 'error');
        return;
      }
      if (!cloudflareAccount) {
        showStatus('請輸入 Cloudflare Account ID', 'error');
        return;
      }
      if (!cloudflareModel) {
        showStatus('請輸入 Cloudflare 模型名稱', 'error');
        return;
      }
    }

    // 保存到Chrome存儲
    chrome.storage.sync.set({
      aiService: selectedService,
      openaiApiKey: openaiKey,
      geminiApiKey: geminiKey,
      xaiApiKey: xaiKey,
      cloudflareApiKey: cloudflareKey,
      cloudflareAccountId: cloudflareAccount,
      openaiModel: openaiModel,
      geminiModel: geminiModel,
      xaiModel: xaiModel,
      cloudflareModel: cloudflareModel,
      iconOnlyMode: iconOnlyModeCheckbox.checked,
      iconPosition: iconPositionSelect.value
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
  [openaiKeyInput, geminiKeyInput, xaiKeyInput, cloudflareKeyInput, cloudflareAccountInput, openaiModelInput, geminiModelInput, xaiModelInput, cloudflareModelInput].forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    });
  });

  // 初始化UI
  updateUIVisibility();
});