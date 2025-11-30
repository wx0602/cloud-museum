<template>
  <!-- 整体 -->
  <div class="quiz">
    <div class="banner">
      <img :src="bannerQuiz" alt="Quiz Banner" class="banner-image" />
    </div>
    <div class="actions">
      <button class="action study" @click="goMode('study')">学习模式</button>
      <button class="action challenge" @click="goMode('challenge')">闯关模式</button>
    </div>
    
    <!-- 控制栏：生成/切换题目（仅在非学习模式下显示） -->
    <div class="controls" v-if="hasMode && getMode() !== 'study'">
      <button class="generate" :disabled="loading" @click="generateQuestions()">
        {{ loading ? '准备中…' : (questions.length ? '换一批' : '开始答题') }}
      </button>
    </div>

    <!-- 错误提示（全局显示） -->
    <div v-if="error" class="error-msg">{{ error }} <button @click="generateQuestions()">重试</button></div>

    <!-- 加载状态遮罩 -->
    <div v-if="loading" class="loading-mask">
      <div class="spinner"></div>
      <p>正在为您挖掘文物知识...</p>
    </div>

    <!-- 学习模式：分类选择与答题 -->
    <div v-if="hasMode && getMode() === 'study'" class="study-mode">
      
      <!-- 步骤1：分类选择 -->
      <transition name="fade-up" mode="out-in">
        <div v-if="!selectedCategory" class="category-selection" key="selection">
          <h3>请选择感兴趣的文物领域</h3>
          <div class="category-grid">
            <button 
              v-for="(cat, index) in CATEGORIES" 
              :key="cat.id" 
              class="category-btn"
              :style="{ '--delay': index * 0.05 + 's' }"
              @click="selectCategory(cat.name)"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- 步骤2：答题界面 -->
        <div v-else key="quiz">
          <div class="study-header">
            <button class="back-btn" @click="clearCategory">← 返回分类</button>
            <span class="current-category">当前领域：{{ selectedCategory }}</span>
          </div>

          <!-- 进度条 -->
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>

          <transition name="slide-fade" mode="out-in">
            <div v-if="currentQuestion" :key="currentQuestion.id" class="question-card">
              <div class="stem">
                {{ currentQuestion.stem }}
              </div>
              
              <ul class="options-list">
                <li 
                  v-for="opt in currentQuestion.options" 
                  :key="opt.id"
                  class="option-item"
                  :class="{
                    'selected': userAnswers[currentQuestion.id] === opt.id,
                    'correct': userAnswers[currentQuestion.id] && opt.id === currentQuestion.answerId,
                    'wrong': userAnswers[currentQuestion.id] === opt.id && opt.id !== currentQuestion.answerId,
                    'disabled': !!userAnswers[currentQuestion.id]
                  }"
                  @click="selectOption(currentQuestion.id, opt.id)"
                >
                  <div class="option-content">
                    <span class="opt-id">{{ opt.id }}.</span> {{ opt.text }}
                  </div>
                  
                  <!-- 选项反馈图标 -->
                  <span v-if="userAnswers[currentQuestion.id] === opt.id" class="status-icon">
                    {{ opt.id === currentQuestion.answerId ? '✅' : '❌' }}
                  </span>
                </li>
              </ul>

              <!-- 学习模式反馈区：选完即显示 -->
              <transition name="expand">
                <div v-if="userAnswers[currentQuestion.id]" class="feedback">
                  <div class="result" :class="isCorrect(currentQuestion) ? 'success' : 'fail'">
                    {{ isCorrect(currentQuestion) ? '回答正确！' : '回答错误' }}
                  </div>
                  <div class="explanation">
                    <strong>解析：</strong>
                    {{ currentQuestion.explanation || '暂无详细解析' }}
                  </div>
                  <div class="tags" v-if="currentQuestion.tags">
                    <span v-for="tag in currentQuestion.tags" :key="tag" class="tag">#{{ tag }}</span>
                  </div>
                  
                  <!-- 下一题/下一组按钮 -->
                  <button 
                    class="next-btn" 
                    @click="nextQuestion"
                  >
                    {{ currentIdx < questions.length - 1 ? '下一题' : '下一组' }}
                  </button>
                </div>
              </transition>
            </div>
          </transition>
        </div>
      </transition>
    </div>

      <!-- 闯关模式：列表显示 -->
      <div v-else-if="hasMode" class="challenge-mode">
        <div v-for="(q, index) in questions" :key="q.id" class="question-card">
          <div class="stem">
            <span class="index">{{ index + 1 }}.</span> {{ q.stem }}
          </div>
          
          <ul class="options-list">
            <li 
              v-for="opt in q.options" 
              :key="opt.id"
              class="option-item"
              :class="{
                'selected': userAnswers[q.id] === opt.id,
                'correct': isSubmitted && opt.id === q.answerId,
                'wrong': isSubmitted && userAnswers[q.id] === opt.id && opt.id !== q.answerId
              }"
              @click="selectOption(q.id, opt.id)"
            >
              <span class="opt-id">{{ opt.id }}.</span> {{ opt.text }}
            </li>
          </ul>

          <!-- 闯关模式反馈区：提交后显示 -->
          <div v-if="isSubmitted" class="feedback">
            <div class="explanation">
              <strong>正确答案：{{ q.answerId }}</strong>
              <p>{{ q.explanation || '暂无详细解析' }}</p>
            </div>
            <div class="tags" v-if="q.tags">
              <span v-for="tag in q.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-area" v-if="!isSubmitted && questions.length > 0">
          <button class="submit-btn" @click="submitChallenge" :disabled="Object.keys(userAnswers).length < questions.length">
            提交答案 ({{ Object.keys(userAnswers).length }}/{{ questions.length }})
          </button>
        </div>
        <div v-else-if="questions.length > 0" class="score-area">
          <h3>本次得分：{{ calculateScore() }} / {{ questions.length * 20 }}</h3>
        </div>
      </div>

    </div>
</template>

<script setup lang="ts">
import bannerQuiz from '@/assets/banner_quiz.png'
import initialQuestions from '@/assets/questions.json'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, computed, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

// ----------------------------------------------------------------
// 常量定义
// ----------------------------------------------------------------
const CATEGORIES = [
  { id: 'all', name: '综合', keywords: [] },
  { id: 'ceramics', name: '瓷器', keywords: ['瓷', '陶', '青花', '窑', '釉'] },
  { id: 'painting', name: '书画', keywords: ['书', '画', '图', '贴', '卷', '轴'] },
  { id: 'bronze', name: '青铜器', keywords: ['青铜', '鼎', '尊', '爵', '卣', '盘'] },
  { id: 'jade', name: '玉器', keywords: ['玉', '璧', '琮', '佩'] },
  { id: 'gold_silver', name: '金银器', keywords: ['金', '银'] },
  { id: 'misc', name: '杂项', keywords: ['服饰', '织绣', '印', '砚', '笔', '墨', '币'] }
]

// ----------------------------------------------------------------
// 数据模型与状态
// ----------------------------------------------------------------
const LOCAL_STORAGE_KEY = 'museum_quiz_bank'
const SEEN_STORAGE_KEY = 'museum_quiz_seen'

type Option = { id: string; text: string }
type Question = { 
  id: string; 
  stem: string; 
  options: Option[]; 
  answerId?: string; 
  tags?: string[];
  explanation?: string; // 新增解析字段
}

const questions = ref<Question[]>([])
const loading = ref(false)
const error = ref('')

// 用户交互状态
const userAnswers = ref<Record<string, string>>({}) // 题目ID -> 选项ID
const currentIdx = ref(0) // 学习模式当前索引
const isSubmitted = ref(false) // 闯关模式是否已提交
const selectedCategory = ref<string>('') // 学习模式：当前选中的分类名称

// ----------------------------------------------------------------
// 本地题库逻辑
// ----------------------------------------------------------------
const loadLocalBank = (): Question[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

const saveToLocalBank = (newQuestions: Question[]) => {
  const current = loadLocalBank()
  const unique = [...current]
  newQuestions.forEach(q => {
    if (!unique.some(exist => exist.stem === q.stem)) unique.push(q)
  })
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unique))
}

const loadSeenStems = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch (e) {
    return new Set()
  }
}

const markAsSeen = (newQuestions: Question[]) => {
  const seen = loadSeenStems()
  newQuestions.forEach(q => seen.add(q.stem))
  localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen]))
}

const initBank = () => {
  // 总是尝试合并初始题库（saveToLocalBank 会自动去重）
  saveToLocalBank(initialQuestions as unknown as Question[])
}

const getRandomFromBank = (count: number = 5, category: string = ''): Question[] => {
  const bank = loadLocalBank()
  if (bank.length === 0) return []

  const seen = loadSeenStems()
  
  // 1. 根据分类筛选候选题目
  let candidates = bank
  if (category && category !== '综合') {
    const catDef = CATEGORIES.find(c => c.name === category)
    if (catDef && catDef.keywords.length > 0) {
      candidates = bank.filter(q => {
        // 匹配 Tags 或 Stem 中包含关键字
        const tagMatch = q.tags?.some(tag => catDef.keywords.some(k => tag.includes(k)))
        const stemMatch = catDef.keywords.some(k => q.stem.includes(k))
        return tagMatch || stemMatch
      })
    }
  }

  const unused = candidates.filter(q => !seen.has(q.stem))
  const used = candidates.filter(q => seen.has(q.stem))

  // 洗牌算法
  const shuffle = (arr: Question[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const shuffledUnused = shuffle([...unused])
  const shuffledUsed = shuffle([...used])

  // 优先取未展示过的，不够再用已展示的补
  if (shuffledUnused.length >= count) {
    return shuffledUnused.slice(0, count)
  } else {
    return [...shuffledUnused, ...shuffledUsed.slice(0, count - shuffledUnused.length)]
  }
}

// ----------------------------------------------------------------
// 交互逻辑
// ----------------------------------------------------------------
const getMode = () => (route.query.mode as string) || 'study'
const hasMode = computed(() => !!route.query.mode)
const currentQuestion = computed(() => questions.value[currentIdx.value])

// 进度计算
const progress = computed(() => {
  if (!questions.value.length) return 0
  // 闯关模式：已回答数量 / 总数量
  if (getMode() === 'challenge') {
    return (Object.keys(userAnswers.value).length / questions.value.length) * 100
  }
  // 学习模式：当前题目索引 / 总数量 (或者当前+1)
  return ((currentIdx.value + 1) / questions.value.length) * 100
})

// 切换模式
const goMode = (mode: 'study' | 'challenge') => {
  router.push({ name: 'Quiz', query: { mode } })
}

// 选择分类（学习模式）
const selectCategory = (catName: string) => {
  selectedCategory.value = catName
  generateQuestions()
}

// 清除分类（返回选择页）
const clearCategory = () => {
  selectedCategory.value = ''
  questions.value = []
  currentIdx.value = 0
  userAnswers.value = {}
}

// 选择选项
const selectOption = (qId: string, optId: string) => {
  const mode = getMode()
  
  // 学习模式：如果已经选过（显示了答案），就不能再改了
  if (mode === 'study') {
    if (userAnswers.value[qId]) return 
    userAnswers.value[qId] = optId
  }
  
  // 闯关模式：提交前可以随意改，提交后不能改
  if (mode === 'challenge') {
    if (isSubmitted.value) return
    userAnswers.value[qId] = optId
  }
}

// 判断是否正确
const isCorrect = (q: Question) => userAnswers.value[q.id] === q.answerId

// 学习模式：下一题
const nextQuestion = async () => {
  if (currentIdx.value < questions.value.length - 1) {
    currentIdx.value++
  } else {
    // 最后一题点击下一组，自动加载新题目
    await generateQuestions()
  }
}

// 闯关模式：提交
const submitChallenge = () => {
  isSubmitted.value = true
}

// 计算得分
const calculateScore = () => {
  let score = 0
  questions.value.forEach(q => {
    if (userAnswers.value[q.id] === q.answerId) score += 20
  })
  return score
}

// 后台补充题库
const replenishBank = async () => {
  try {
    const mode = getMode()
    // 如果是学习模式且选了分类，根据分类补充
    const topic = (mode === 'study' && selectedCategory.value !== '综合') ? selectedCategory.value : ''
    
    // 如果本地已经有很多该分类的题目，可以不补充（简单判断总数，实际应判断该分类数量）
    if (loadLocalBank().length >= 100) return 

    const res = await fetch('http://localhost:3001/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, topic }),
    })
    if (res.ok) {
      const data = await res.json()
      const newQs = data?.questions || []
      if (newQs.length) saveToLocalBank(newQs)
    }
  } catch (e) { console.warn(e) }
}

// 生成题目
const generateQuestions = async () => {
  // 重置状态
  error.value = ''
  loading.value = true
  userAnswers.value = {}
  isSubmitted.value = false
  currentIdx.value = 0
  
  try {
    const mode = getMode()
    const topic = (mode === 'study' && selectedCategory.value && selectedCategory.value !== '综合') ? selectedCategory.value : ''
    
    // 尝试从本地获取符合分类的题目
    const randomQs = getRandomFromBank(5, topic)
    
    // 如果本地有足够题目（至少1个），先显示本地的，后台去补充
    if (randomQs.length > 0) {
      questions.value = randomQs
      markAsSeen(randomQs) // 标记为已展示
      replenishBank()
    } else {
      // 本地没有，强制调用API
      const res = await fetch('http://localhost:3001/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, topic }),
      })
      if (!res.ok) throw new Error(`接口错误 ${res.status}`)
      const data = await res.json()
      const parsed = data?.questions || []
      if (!parsed.length) throw new Error('未能生成题目')
      saveToLocalBank(parsed)
      questions.value = parsed
      markAsSeen(parsed) // 标记为已展示
    }
  } catch (e: any) {
    error.value = e?.message || '生成失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initBank()
  if (hasMode.value) {
    // 学习模式不自动开始，等待选择分类
    if (getMode() === 'study') {
      // do nothing, show category selection
    } else {
      replenishBank()
    }
  }
})

watch(() => route.query.mode, (newMode) => {
  questions.value = []
  userAnswers.value = {}
  isSubmitted.value = false
  currentIdx.value = 0
  selectedCategory.value = '' // 切换模式时重置分类
  
  if (newMode === 'study') {
    // do nothing, show category selection
  } else {
    replenishBank()
  }
})
</script>

<style scoped>
.quiz {
  background-color: #F6F1E7;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 2rem;
}

.banner {
  width: 66.6667%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 33vh;
}

.banner-image {
  max-width: 100%;
  max-height: 50vh;
  height: auto;
  object-fit: contain;
  display: block;
}

.actions {
  width: 66.6667%;
  margin: 2rem auto 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action.study { background-color: #3a7afe; color: #fff; }
.action.challenge { background-color: #e06c75; color: #fff; }
.action:hover { filter: brightness(0.95); transform: translateY(-1px); }

.controls {
  width: 66.6667%;
  margin: 1.5rem auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.generate {
  padding: 0.8rem 2rem;
  border-radius: 8px;
  border: none;
  background: #333;
  color: #fff;
  cursor: pointer;
  font-size: 1.1rem;
}
.generate:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg {
  width: 66.6667%;
  margin: 1rem auto;
  text-align: center;
  color: #e74c3c;
  background: #fdedec;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.error-msg button {
  padding: 0.4rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.study-mode, .challenge-mode {
  width: 66.6667%;
  margin: 2rem auto;
}

.category-selection h3 {
  text-align: center;
  color: #5d4037;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.category-btn {
  padding: 1.5rem 1rem;
  background: #fff;
  border: 2px solid #e0d6c6;
  border-radius: 12px;
  font-size: 1.2rem;
  color: #5d4037;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.category-btn:hover {
  border-color: #3a7afe;
  color: #3a7afe;
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(58, 122, 254, 0.15);
}

.category-btn {
  animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: var(--delay);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}
.back-btn:hover { color: #3a7afe; text-decoration: underline; }

.current-category {
  font-weight: bold;
  color: #5d4037;
  padding: 0.4rem 1rem;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.question-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}

.stem {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.5;
  color: #2c3e50;
}
.index {
  color: #888;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 进度条 */
.progress-bar-container {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3a7afe, #00f2fe);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 题目卡片动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.expand-enter-active {
  transition: all 0.4s ease-out;
  max-height: 500px;
  opacity: 1;
}
.expand-enter-from {
  max-height: 0;
  opacity: 0;
}

/* 选项样式优化 */
.option-item {
  padding: 1rem 1.2rem;
  margin-bottom: 0.8rem;
  border: 2px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.option-item:not(.disabled):hover {
  background-color: #f8f9fa;
  border-color: #cbd5e1;
  transform: translateX(5px);
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  border-color: #3a7afe;
  background-color: #f0f7ff;
  color: #3a7afe;
  font-weight: 600;
}

.option-item.correct {
  border-color: #27ae60;
  background-color: #e8f8f5;
  color: #27ae60;
  animation: pulse 0.5s;
}

.option-item.wrong {
  border-color: #e74c3c;
  background-color: #fdedec;
  color: #e74c3c;
  animation: shake 0.5s;
}

.option-item.disabled {
  cursor: default;
  opacity: 0.8;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.feedback {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
  animation: fadeIn 0.3s ease;
}

.result { font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem; }
.result.success { color: #27ae60; }
.result.fail { color: #e74c3c; }

.explanation {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  color: #555;
  line-height: 1.6;
}

.tags { margin-top: 0.5rem; display: flex; gap: 0.5rem; }
.tag {
  background: #eee;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.next-btn, .submit-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #3a7afe;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.next-btn:hover, .submit-btn:hover { background-color: #2c6cdb; }
.submit-btn:disabled { background-color: #ccc; cursor: not-allowed; }

.submit-area { text-align: center; margin-top: 2rem; }
.score-area { text-align: center; margin-top: 2rem; color: #e67e22; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(246, 241, 231, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #3a7afe;
  font-size: 1.2rem;
  font-weight: bold;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ddd;
  border-top: 5px solid #3a7afe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
