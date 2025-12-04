<template>
  <div class="museum-ai-container">
    <!-- 博物馆AI助手悬浮图标 -->
    <div
      class="museum-ai-float"
      id="museumAiFloat"
      @click="openDialog"
      title="点击咨询博物馆AI助手"
    >
      <div class="ai-icon no-bg">
        <img src="/qwq.png" alt="博物馆AI助手" class="ai-icon-img" />
      </div>

      <!-- 悬停提示 -->
      <div class="ai-tooltip" id="aiTooltip">
        有什么想知道的博物馆的内容<br />可以点击我提问哦
      </div>
    </div>

    <!-- 弹出对话框 -->
    <div
      class="museum-ai-dialog"
      :class="{ active: isDialogOpen }"
      id="museumAiDialog"
    >
      <div class="dialog-header">
        <div class="header-content">
          <div class="ai-avatar">
            <img src="/qwq.png" alt="AI头像" class="ai-avatar-img" />
          </div>
          <div class="header-info">
            <h3 class="ai-title">博物馆AI助手</h3>
            <p class="ai-subtitle">为您解答博物馆相关问题</p>
          </div>
        </div>
        <button class="close-btn" @click="closeDialog" title="关闭对话框">
          <!-- 关闭图标 -->
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="dialog-messages" ref="messagesContainer">
        <!-- 欢迎消息 -->
        <div class="message ai-message" v-if="messageHistory.length === 0">
          <div class="message-avatar">
            <img src="/qwq.png" alt="AI" class="ai-message-avatar-img" />
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
        <div
          v-for="(msg, index) in messageHistory"
          :key="index"
          :class="[
            'message',
            msg.sender + '-message',
            { 'error-message': msg.isError }
          ]"
        >
          <div class="message-avatar">
            <template v-if="msg.sender === 'ai'">
              <img src="/qwq.png" alt="AI" class="ai-message-avatar-img" />
            </template>
            <template v-else>
              👤
            </template>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <div
                class="message-html"
                v-html="formatContent(msg.content)"
              ></div>
            </div>
            <div class="message-time">{{ msg.timestamp }}</div>
          </div>
        </div>
      </div>

      <!-- 快捷问题按钮 -->
      <div class="quick-questions" v-if="!isStreaming">
        <button
          class="question-btn"
          @click="askQuestion('介绍一下这里的镇馆之宝')"
        >
          🏆 镇馆之宝
        </button>
        <button
          class="question-btn"
          @click="askQuestion('最近有什么特别展览？')"
        >
          📅 近期特展
        </button>
        <button
          class="question-btn"
          @click="askQuestion('博物馆的开放时间是？')"
        >
          ⏰ 开放时间
        </button>
        <button
          class="question-btn"
          @click="askQuestion('带孩子参观有什么建议？')"
        >
          👶 亲子游览
        </button>
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

          <button
            v-if="isStreaming"
            class="stop-btn"
            @click="stopResponse"
            title="停止回答"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            v-else
            class="send-btn"
            @click="sendMessage"
            :disabled="!inputMessage.trim()"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="input-info">
          <span
            class="char-count"
            :style="{ color: inputMessage.length > 450 ? '#ff6b6b' : '#999' }"
            >{{ inputMessage.length }}/500</span
          >
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
    <div
      class="dialog-overlay"
      :class="{ active: isDialogOpen }"
      @click="closeDialog"
    ></div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  nextTick,
  onMounted,
  onUnmounted
} from 'vue'

// 状态管理
const isDialogOpen = ref(false)
const isInputFocused = ref(false)
const inputMessage = ref('')
const messageHistory = reactive([]) // { content, sender, timestamp, isError }
const isStreaming = ref(false)
const streamingRawText = ref('')
const messagesContainer = ref(null)
const textareaRef = ref(null)
let currentAbortController = null

// API 配置
const API_ENDPOINT = '/api/chat'

// 打开/关闭对话框
const openDialog = () => {
  isDialogOpen.value = true
  document.body.style.overflow = 'hidden'
  setTimeout(() => {
    if (textareaRef.value) textareaRef.value.focus()
    scrollToBottom()
  }, 300)
}

const closeDialog = () => {
  isDialogOpen.value = false
  document.body.style.overflow = ''
}

// 发送消息
const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || isStreaming.value) return

  // 添加用户消息
  addMessage(text, 'user')
  inputMessage.value = ''
  adjustHeight()

  // 准备AI回复
  isStreaming.value = true
  streamingRawText.value = ''

  // 添加一个空的AI消息用于流式更新
  const aiMessageIndex =
    messageHistory.push({
      content: '',
      sender: 'ai',
      timestamp: getCurrentTime(),
      isError: false
    }) - 1

  try {
    await streamResponse(text, chunk => {
      streamingRawText.value += chunk
      messageHistory[aiMessageIndex].content = streamingRawText.value
      scrollToBottom()
    })
  } catch (error) {
    if (error.name !== 'AbortError') {
      messageHistory[aiMessageIndex].content =
        streamingRawText.value || `请求失败：${error.message}`
      messageHistory[aiMessageIndex].isError = true
    }
  } finally {
    isStreaming.value = false
    currentAbortController = null
  }
}

const handleEnter = e => {
  if (e.shiftKey) return
  sendMessage()
}

const askQuestion = text => {
  inputMessage.value = text
  sendMessage()
}

const stopResponse = () => {
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
  isStreaming.value = false
}

// 辅助函数
const addMessage = (content, sender, isError = false) => {
  messageHistory.push({
    content,
    sender,
    timestamp: getCurrentTime(),
    isError
  })
  scrollToBottom()
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop =
        messagesContainer.value.scrollHeight
    }
  })
}

const adjustHeight = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height =
    Math.min(textareaRef.value.scrollHeight, 120) + 'px'
}

// 流式请求逻辑
const streamResponse = async (userMessage, onChunk) => {
  currentAbortController = new AbortController()

  // 构建历史消息上下文
  const historyContext = messageHistory
    .filter(m => !m.isError && m.content) // 过滤掉错误和空消息
    .slice(0, -1) // 排除掉刚刚添加的空AI消息
    .map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content
    }))

  const payload = {
    messages: [
      ...historyContext,
      { role: 'user', content: userMessage }
    ],
    stream: true
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: currentAbortController.signal
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    // 处理SSE格式或直接文本
    const lines = chunk.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed === 'data: [DONE]') continue
      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6))
          const content = json.choices?.[0]?.delta?.content || ''
          if (content) onChunk(content)
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// Markdown 格式化
const formatContent = text => {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 代码块
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre><code>$1</code></pre>'
  )

  // 行内代码
  html = html.replace(
    /`([^`]+)`/g,
    '<code>$1</code>'
  )

  // 加粗
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong>$1</strong>'
  )

  // 标题
  html = html.replace(
    /^### (.*$)/gm,
    '<h3>$1</h3>'
  )
  html = html.replace(
    /^## (.*$)/gm,
    '<h2>$1</h2>'
  )
  html = html.replace(
    /^# (.*$)/gm,
    '<h1>$1</h1>'
  )

  // 列表
  html = html.replace(
    /^\s*[-*] (.*$)/gm,
    '<li>$1</li>'
  )
  html = html.replace(
    /(<li>.*<\/li>)/s,
    '<ul>$1</ul>'
  )

  // 换行转<br>
  html = html.replace(/\n/g, '<br>')

  // 修复列表被br破坏的问题
  html = html.replace(/<\/li><br>/g, '</li>')
  html = html.replace(/<\/ul><br>/g, '</ul>')
  html = html.replace(/<\/h\d><br>/g, match =>
    match.replace('<br>', '')
  )

  return html
}

// ESC 关闭
const handleEsc = e => {
  if (e.key === 'Escape' && isDialogOpen.value) {
    closeDialog()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})
</script>

<style scoped>
/*颜色调整*/
:root {
  --ai-gold-light: #f5e6c8;
  --ai-gold: #c79c5b;
  --ai-gold-deep: #9a5f26;
  --ai-ink-dark: #3f3325;
  --ai-ink-muted: #7a6a55;
  --ai-paper: #f6f1e7;
}

/*悬浮AI助手图标*/
.museum-ai-float {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 2000;
  cursor: pointer;
  animation: floatIdle 6s ease-in-out infinite;
}

/*浮动图标容器*/
.ai-icon {
  width: 80px;     
  height: 80px;
  border-radius: 50%;  
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: 0.3s;
}

/*移除背景*/
.ai-icon.no-bg {
  background: none !important;
  box-shadow: none !important;
  border-radius: 0 !important; 
  overflow: visible;
}

/*图标图片*/
.ai-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0; 
}

/*外圈淡金色光晕*/
.ai-icon.no-bg::before {
  content: "";
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(
    rgba(255, 236, 180, 0.9),
    rgba(255, 236, 180, 0)
  );
  opacity: 0.8;
  filter: blur(10px);
  z-index: -1;
  animation: glowPulse 2.4s infinite ease-in-out;
}

@keyframes glowPulse {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

/* 悬停放大 */
.museum-ai-float:hover .ai-icon-img {
  transform: scale(1.08);
}

/*淡金色脉冲光晕*/
.ai-icon::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  background: radial-gradient(
    circle,
    rgba(255, 238, 190, 0.8),
    rgba(199, 156, 91, 0)
  );
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2.2s infinite;
}

/* 闲置时的浮动动画 */
@keyframes floatIdle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.museum-ai-float:hover {
  animation-play-state: paused;
}

@keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

/*悬停提示框*/
.ai-tooltip {
  position: absolute;
  right: 70px;
  bottom: 50%;
  transform: translateY(50%);
  background: rgba(63, 51, 37, 0.92);
  color: #fef7e9;
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
  border: 1px solid rgba(199, 156, 91, 0.7);
}

.ai-tooltip::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(63, 51, 37, 0.92);
}

.museum-ai-float:hover .ai-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(50%) translateX(-10px);
}

/*弹出对话框*/
.museum-ai-dialog {
  position: fixed;
  right: -450px;
  top: 0;
  width: 420px;
  height: 100vh;
  background: url('/ai-back.jpg') center / cover no-repeat;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}


.museum-ai-dialog.active {
  right: 0;
}

.dialog-header {
  background-image: url('/ai-header.jpg'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  color: #3e2c16;            
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(140, 90, 30, 0.25);
}

.header-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.ai-avatar {
  width: 45px;
  height: 45px;
  background: rgba(255, 248, 230, 0.85);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
  box-shadow:
    0 0 8px rgba(199, 156, 91, 0.8),
    0 4px 12px rgba(140, 90, 30, 0.35);
}

.ai-avatar-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
  border-radius: 50%;
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

/* 关闭按钮 */
.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 248, 230, 0.6);
  border: none;
  border-radius: 50%;
  color: #5c4120;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 248, 230, 0.9);
  transform: scale(1.08);
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
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dialog-messages::-webkit-scrollbar {
  width: 6px;
}

.dialog-messages::-webkit-scrollbar-track {
  background: #efe3d0;
  border-radius: 3px;
}

.dialog-messages::-webkit-scrollbar-thumb {
  background: #c8b191;
  border-radius: 3px;
}

.dialog-messages::-webkit-scrollbar-thumb:hover {
  background: #b39772;
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
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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

.ai-message-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: contain;
  background: #fffdf6;  
  box-shadow:
    0 0 3px rgba(199, 156, 91, 0.35),
    0 2px 4px rgba(120, 80, 30, 0.18); 
}


.user-message .message-avatar {
  background: linear-gradient(135deg, #e0c8a0, #c19b6b);
  color: white;
  font-size: 16px;
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
  background: linear-gradient(135deg, #e2cba7, #c19b6b);
  color: #3f2c18;
  border-bottom-right-radius: 6px;
}

.ai-message .message-bubble {
  background: rgba(255, 251, 244, 0.94);   
  color: #4a3b2a;                          
  border: 1px solid #efe2c9;               
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 5px rgba(80, 60, 30, 0.05); 
}


.message-bubble p {
  margin: 0 0 8px 0;
}
.message-bubble p:last-child {
  margin-bottom: 0;
}
.message-bubble ul {
  margin: 8px 0;
  padding-left: 20px;
}
.message-bubble li {
  margin-bottom: 4px;
}

.message-time {
  margin-top: 5px;
  font-size: 11px;
  color: #9a8a73;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

.error-message .message-bubble {
  background: #ffe8e4;
  border-color: #f4b3a3;
  color: #b04330;
}

/* 快捷问题按钮 */
.quick-questions {
  padding: 15px 20px 10px;
  border-top: 1px solid #e3d3b8;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-btn {
  background: #f8efe0;
  border: 1px solid #e3d3b8;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  color: #6f5a3c;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  animation: popIn 0.4s backwards;
}

.question-btn:nth-child(1) {
  animation-delay: 0.1s;
}
.question-btn:nth-child(2) {
  animation-delay: 0.2s;
}
.question-btn:nth-child(3) {
  animation-delay: 0.3s;
}
.question-btn:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.question-btn:hover {
  background: var(--ai-gold);
  color: #fffaf0;
  border-color: var(--ai-gold-deep);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(140, 90, 30, 0.35);
}

/* 输入区域 */
.dialog-input {
  padding: 15px 20px;
  border-top: 1px solid #e3d3b8;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: #f8f1e4;
  border: 2px solid #e3d3b8;
  border-radius: 20px;
  padding: 8px 15px;
  transition: all 0.3s ease;
}

.input-wrapper.focused {
  border-color: var(--ai-gold);
  background: #fffaf5;
  box-shadow: 0 0 0 4px rgba(199, 156, 91, 0.2);
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
  color: #3f3325;
}

.message-input::placeholder {
  color: #aa9a85;
}

/*发送按钮*/
.send-btn {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--ai-gold), var(--ai-gold-deep));
  border: none;
  border-radius: 50%;
  color: #fffaf0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(140, 90, 30, 0.35);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

/* 停止按钮保持红色提示 */
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
  color: #9a8a73;
}

.char-count {
  font-weight: 500;
}
.input-hint {
  font-style: italic;
}

/* Markdown 样式增强 */
:deep(.message-html h1),
:deep(.message-html h2),
:deep(.message-html h3) {
  margin: 6px 0 4px;
  font-weight: 600;
}
:deep(.message-html h1) {
  font-size: 1.2rem;
}
:deep(.message-html h2) {
  font-size: 1.15rem;
}
:deep(.message-html h3) {
  font-size: 1.1rem;
}

:deep(.message-html code) {
  background: #f1e5cf;
  padding: 2px 6px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.92em;
}

:deep(.message-html pre) {
  background: #2b2520;
  color: #fbead4;
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
  background: rgba(40, 30, 20, 0.35);
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
  background: #fffaf0;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(80, 60, 30, 0.25);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2002;
  animation: slideInUp 0.3s ease;
  border: 1px solid #e3d3b8;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--ai-gold);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.loading-indicator p {
  margin: 0;
  color: #6f5a3c;
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

