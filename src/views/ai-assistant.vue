<template>
  <div class="museum-ai-container">
    <!-- 博物馆AI助手悬浮图标 -->
    <div class="museum-ai-float" id="museumAiFloat" @click="openDialog" title="点击咨询博物馆AI助手">
      <div class="ai-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 博物馆图标 -->
          <path d="M12 2L2 7V10H22V7L12 2Z" fill="currentColor" />
          <path d="M4 10V20H7V12H9V20H11V12H13V20H15V12H17V20H20V10H4Z" fill="currentColor" />
          <path d="M2 20H22V22H2V20Z" fill="currentColor" />
        </svg>
      </div>

      <!-- 悬停提示 -->
      <div class="ai-tooltip" id="aiTooltip">
        有什么想知道的博物馆的内容<br>可以点击我提问哦
      </div>
    </div>

    <!-- 弹出对话框 -->
    <div class="museum-ai-dialog" :class="{ active: isDialogOpen }" id="museumAiDialog">
      <div class="dialog-header">
        <div class="header-content">
          <div class="ai-avatar">
            <!-- 博物馆图标绘制 -->
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V10H22V7L12 2Z" fill="currentColor" />
              <path d="M4 10V20H7V12H9V20H11V12H13V20H15V12H17V20H20V10H4Z" fill="currentColor" />
              <path d="M2 20H22V22H2V20Z" fill="currentColor" />
            </svg>
          </div>
          <div class="header-info">
            <h3 class="ai-title">博物馆AI助手</h3>
            <p class="ai-subtitle">为您解答博物馆相关问题</p>
          </div>
        </div>
        <button class="close-btn" @click="closeDialog" title="关闭对话框">
          <!-- 关闭图标 -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="dialog-messages" ref="messagesContainer">
        <!-- 欢迎消息 -->
        <div class="message ai-message" v-if="messageHistory.length === 0">
          <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V10H22V7L12 2Z" fill="currentColor" />
              <path d="M4 10V20H7V12H9V20H11V12H13V20H15V12H17V20H20V10H4Z" fill="currentColor" />
              <path d="M2 20H22V22H2V20Z" fill="currentColor" />
            </svg>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>您好！我是博物馆AI助手，很高兴为您服务！</p>
              <p>我可以为您介绍：</p>
              <p>请问您想了解什么呢？</p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>

        <!-- 消息历史 -->
        <div v-for="(msg, index) in messageHistory" :key="index" :class="['message', msg.sender + '-message', { 'error-message': msg.isError }]">
          <div class="message-avatar">
            <template v-if="msg.sender === 'ai'">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V10H22V7L12 2Z" fill="currentColor" />
                <path d="M4 10V20H7V12H9V20H11V12H13V20H15V12H17V20H20V10H4Z" fill="currentColor" />
                <path d="M2 20H22V22H2V20Z" fill="currentColor" />
              </svg>
            </template>
            <template v-else>
              👤
            </template>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <div class="message-html" v-html="formatContent(msg.content)"></div>
            </div>
            <div class="message-time">{{ msg.timestamp }}</div>
          </div>
        </div>
      </div>

      <!-- 快捷问题按钮 -->
      <div class="quick-questions" v-if="!isStreaming">
        <button class="question-btn" @click="askQuestion('介绍一下这里的镇馆之宝')">🏆 镇馆之宝</button>
        <button class="question-btn" @click="askQuestion('最近有什么特别展览？')">📅 近期特展</button>
        <button class="question-btn" @click="askQuestion('博物馆的开放时间是？')">⏰ 开放时间</button>
        <button class="question-btn" @click="askQuestion('带孩子参观有什么建议？')">👶 亲子游览</button>
      </div>

      <div class="dialog-input">
        <div class="input-wrapper" :class="{ focused: isInputFocused }">
          <textarea 
            class="message-input" 
            v-model="inputMessage" 
            @keydown.enter.prevent="handleEnter"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            @input="adjustHeight"
            ref="textareaRef"
            placeholder="请输入您想了解的博物馆相关问题..." 
            rows="1"
          ></textarea>
          
          <button v-if="isStreaming" class="stop-btn" @click="stopResponse" title="停止回答">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
            </svg>
          </button>
          
          <button v-else class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="input-info">
          <span class="char-count" :style="{ color: inputMessage.length > 450 ? '#ff6b6b' : '#999' }">{{ inputMessage.length }}/500</span>
          <span class="input-hint">按 Enter 发送，Shift+Enter 换行</span>
        </div>
      </div>
      
      <!-- 加载动画 -->
      <div class="loading-indicator" v-if="isStreaming && !streamingRawText">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>AI正在思考中...</p>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div class="dialog-overlay" :class="{ active: isDialogOpen }" @click="closeDialog"></div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue';

// 状态管理
const isDialogOpen = ref(false);
const isInputFocused = ref(false);
const inputMessage = ref('');
const messageHistory = reactive([]); // { content, sender, timestamp, isError }
const isStreaming = ref(false);
const streamingRawText = ref('');
const messagesContainer = ref(null);
const textareaRef = ref(null);
let currentAbortController = null;

// API 配置
const API_ENDPOINT = '/api/chat';

// 打开/关闭对话框
const openDialog = () => {
  isDialogOpen.value = true;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    if (textareaRef.value) textareaRef.value.focus();
    scrollToBottom();
  }, 300);
};

const closeDialog = () => {
  isDialogOpen.value = false;
  document.body.style.overflow = '';
};

// 发送消息
const sendMessage = async () => {
  const text = inputMessage.value.trim();
  if (!text || isStreaming.value) return;

  // 添加用户消息
  addMessage(text, 'user');
  inputMessage.value = '';
  adjustHeight();

  // 准备AI回复
  isStreaming.value = true;
  streamingRawText.value = '';
  
  // 添加一个空的AI消息用于流式更新
  const aiMessageIndex = messageHistory.push({
    content: '',
    sender: 'ai',
    timestamp: getCurrentTime(),
    isError: false
  }) - 1;

  try {
    await streamResponse(text, (chunk) => {
      streamingRawText.value += chunk;
      messageHistory[aiMessageIndex].content = streamingRawText.value;
      scrollToBottom();
    });
  } catch (error) {
    if (error.name !== 'AbortError') {
      messageHistory[aiMessageIndex].content = streamingRawText.value || `请求失败：${error.message}`;
      messageHistory[aiMessageIndex].isError = true;
    }
  } finally {
    isStreaming.value = false;
    currentAbortController = null;
  }
};

const handleEnter = (e) => {
  if (e.shiftKey) return;
  sendMessage();
};

const askQuestion = (text) => {
  inputMessage.value = text;
  sendMessage();
};

const stopResponse = () => {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  isStreaming.value = false;
};

// 辅助函数
const addMessage = (content, sender, isError = false) => {
  messageHistory.push({
    content,
    sender,
    timestamp: getCurrentTime(),
    isError
  });
  scrollToBottom();
};

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const adjustHeight = () => {
  if (!textareaRef.value) return;
  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px';
};

// 流式请求逻辑
const streamResponse = async (userMessage, onChunk) => {
  currentAbortController = new AbortController();
  
  // 构建历史消息上下文
  const historyContext = messageHistory
    .filter(m => !m.isError && m.content) // 过滤掉错误和空消息
    .slice(0, -1) // 排除掉刚刚添加的空AI消息
    .map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

  const payload = {
    messages: [
      ...historyContext,
      { role: 'user', content: userMessage }
    ],
    stream: true
  };

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: currentAbortController.signal
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    // 处理SSE格式或直接文本
    // 假设后端直接透传DeepSeek的SSE流
    const lines = chunk.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) onChunk(content);
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
};

// Markdown 格式化
const formatContent = (text) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 代码块
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 加粗
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 标题 (简单处理)
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // 列表
  html = html.replace(/^\s*[-*] (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>'); // 简单包裹，可能不完美但够用
  
  // 换行转<br> (排除标签内的换行)
  html = html.replace(/\n/g, '<br>');
  
  // 修复列表被br破坏的问题 (简单修复)
  html = html.replace(/<\/li><br>/g, '</li>');
  html = html.replace(/<\/ul><br>/g, '</ul>');
  html = html.replace(/<\/h\d><br>/g, (match) => match.replace('<br>', ''));

  return html;
};

// ESC 关闭
const handleEsc = (e) => {
  if (e.key === 'Escape' && isDialogOpen.value) {
    closeDialog();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc);
});
</script>

<style scoped>
/* ==================== 悬浮AI助手图标 ==================== */
.museum-ai-float {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 2000;
  cursor: pointer;
}

.ai-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.ai-icon svg {
  width: 28px;
  height: 28px;
  transition: transform 0.3s ease;
}

/* 悬停效果 */
.museum-ai-float:hover .ai-icon {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(79, 172, 254, 0.4);
}

.museum-ai-float:hover .ai-icon svg {
  transform: scale(1.1);
}

.museum-ai-float:active .ai-icon {
  transform: scale(1.05);
}

/* 脉冲动画效果 */
.ai-icon::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s infinite;
}

/* 闲置时的浮动动画 */
.museum-ai-float {
  animation: floatIdle 6s ease-in-out infinite;
}

@keyframes floatIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 悬停时暂停闲置动画，使用原本的缩放 */
.museum-ai-float:hover {
  animation-play-state: paused;
}

@keyframes pulse {
  0% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.2); }
}

/* ==================== 悬停提示框 ==================== */
.ai-tooltip {
  position: absolute;
  right: 70px;
  bottom: 50%;
  transform: translateY(50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(10px);
  line-height: 1.4;
}

.ai-tooltip::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(0, 0, 0, 0.8);
}

.museum-ai-float:hover .ai-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(50%) translateX(-10px);
}

/* ==================== 弹出对话框 ==================== */
.museum-ai-dialog {
  position: fixed;
  right: -450px;
  top: 0;
  width: 420px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.museum-ai-dialog.active {
  right: 0;
}

/* 对话框头部 */
.dialog-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.ai-avatar {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.ai-avatar svg {
  width: 24px;
  height: 24px;
}

.header-info {
  flex: 1;
}

.ai-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
}

.ai-subtitle {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 400;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* 消息区域 */
.dialog-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dialog-messages::-webkit-scrollbar {
  width: 6px;
}

.dialog-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 消息样式 */
.message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: left bottom;
}

.user-message {
  transform-origin: right bottom;
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.ai-message .message-avatar svg {
  width: 16px;
  height: 16px;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 42px);
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  word-wrap: break-word;
  line-height: 1.5;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.ai-message .message-bubble {
  background: white;
  color: #333;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-bubble p { margin: 0 0 8px 0; }
.message-bubble p:last-child { margin-bottom: 0; }
.message-bubble ul { margin: 8px 0; padding-left: 20px; }
.message-bubble li { margin-bottom: 4px; }

.message-time {
  margin-top: 5px;
  font-size: 11px;
  color: #999;
  text-align: right;
}

.user-message .message-time { text-align: left; }

.error-message .message-bubble {
  background: #ffe6e6;
  border-color: #ffcccc;
  color: #d63031;
}

/* 快捷问题按钮 */
.quick-questions {
  padding: 15px 20px 10px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  animation: popIn 0.4s backwards;
}

/* 为每个按钮添加延迟，实现交错效果 */
.question-btn:nth-child(1) { animation-delay: 0.1s; }
.question-btn:nth-child(2) { animation-delay: 0.2s; }
.question-btn:nth-child(3) { animation-delay: 0.3s; }
.question-btn:nth-child(4) { animation-delay: 0.4s; }

@keyframes popIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.question-btn:hover {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3);
}

/* 输入区域 */
.dialog-input {
  background: white;
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  padding: 8px 15px;
  transition: all 0.3s ease;
}

.input-wrapper.focused {
  border-color: #4facfe;
  background: white;
  box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.15);
  transform: translateY(-1px);
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 20px;
  max-height: 100px;
  font-family: inherit;
  color: #333;
}

.message-input::placeholder { color: #999; }

.send-btn {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-btn svg { width: 16px; height: 16px; }

.stop-btn {
  width: 32px;
  height: 32px;
  background: #ff6b6b;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.stop-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.input-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 11px;
  color: #999;
}

.char-count { font-weight: 500; }
.input-hint { font-style: italic; }

/* Markdown 样式增强 */
:deep(.message-html h1),
:deep(.message-html h2),
:deep(.message-html h3) {
  margin: 6px 0 4px;
  font-weight: 600;
}
:deep(.message-html h1) { font-size: 1.2rem; }
:deep(.message-html h2) { font-size: 1.15rem; }
:deep(.message-html h3) { font-size: 1.1rem; }

:deep(.message-html code) {
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.92em;
}

:deep(.message-html pre) {
  background: #23252f;
  color: #e8eaf6;
  padding: 10px 12px;
  border-radius: 12px;
  overflow: auto;
  margin: 8px 0;
}

:deep(.message-html pre code) {
  background: transparent;
  padding: 0;
}

/* 遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

.dialog-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 加载动画 - 打字机效果 */
.loading-indicator {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2002;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #4facfe;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-indicator p {
  margin: 0;
  color: #666;
  font-size: 13px;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .museum-ai-dialog {
    width: 100%;
    right: -100%;
  }
  .museum-ai-dialog.active {
    right: 0;
  }
  .museum-ai-float {
    right: 20px;
    bottom: 20px;
  }
  .ai-tooltip {
    display: none;
  }
}
</style>
