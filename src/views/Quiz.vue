<template>
  <!-- 整体 -->
  <div class="quiz" :class="currentModeClass">
    <!-- 顶部横幅 -->
    <div class="banner-wrapper">
      <img class="banner" src="/00B.svg" alt="展览横幅" />
    </div>
    <div class="quiz-title-wrapper">
      <h2 class="section-title">文物问答</h2>
    </div>
    <!-- 全局错误提示 -->
    <div v-if="error" class="error-msg">
      {{ error }}
      <button @click="reloadCurrentMode">重试</button>
    </div>

    <!-- 加载状态遮罩 -->
    <div v-if="loading" class="loading-mask">
      <div class="spinner"></div>
      <p>正在为您挖掘文物知识...</p>
    </div>

    <!-- 模式选择-->
    <div v-if="!hasMode" class="mode-select">
      <!-- 学习模式卡片 -->
      <section class="mode-card mode-card--study">
        <div class="mode-card-header">
          <h2>学习模式</h2>
          <p>按领域系统掌握文物知识，做对一题，看一次解析。</p>
        </div>
        <ul class="mode-sublist">
          <li
            v-for="cat in CATEGORIES"
            :key="cat.id"
            class="mode-subitem"
            @click="enterStudyCategory(cat.id)"
          >
            <div class="subitem-main">
              <span class="subitem-title">{{ cat.name }}</span>
              <span class="subitem-desc">{{ cat.desc }}</span>
            </div>
            <span class="subitem-arrow">进入答题 ›</span>
          </li>
        </ul>
      </section>

      <!-- 闯关模式卡片 -->
      <section class="mode-card mode-card--challenge">
        <div class="mode-card-header">
          <h2>闯关模式</h2>
          <p>跟随历史主题一路过关，每关 5 题，通关解锁专属奖励卡片。</p>
        </div>
        <ul class="mode-sublist">
          <li
            v-for="(level, index) in LEVELS"
            :key="level.id"
            class="mode-subitem"
            :class="{ 'mode-subitem--locked': !isLevelUnlocked(index) }"
            @click="enterChallengeLevel(level, index)"
          >
            <div class="subitem-main">
              <span class="subitem-title">
                第 {{ index + 1 }} 关 · {{ level.name }}
              </span>
              <span class="subitem-desc">{{ level.desc }}</span>
            </div>
            <span class="subitem-status">
              <span v-if="!isLevelUnlocked(index)">未解锁</span>
              <span v-else-if="hasLevelPassed(level.id)">已通关</span>
              <span v-else>进入闯关 ›</span>
            </span>
          </li>
        </ul>
      </section>
    </div>

    <!--  学习模式 -->
    <div
      v-else-if="currentMode === 'study'"
      class="study-mode"
    >
      <div class="study-header">
        <button class="back-btn" @click="backToModeSelect">← 返回模式选择</button>
        <span class="current-category">
          当前领域：{{ selectedCategoryName || '综合' }}
        </span>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar-container" v-if="questions.length">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- 题目卡片 -->
      <transition name="slide-fade" mode="out-in">
        <div
          v-if="currentQuestion"
          :key="currentQuestion.id"
          class="question-card"
        >
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
                <span class="opt-id">{{ opt.id }}.</span>
                {{ opt.text }}
              </div>
              <span
                v-if="userAnswers[currentQuestion.id] === opt.id"
                class="status-icon"
              >
                {{ opt.id === currentQuestion.answerId ? '✅' : '❌' }}
              </span>
            </li>
          </ul>

          <!-- 答题反馈 -->
          <transition name="expand">
            <div
              v-if="userAnswers[currentQuestion.id]"
              class="feedback"
            >
              <div
                class="result"
                :class="isCorrect(currentQuestion) ? 'success' : 'fail'"
              >
                {{ isCorrect(currentQuestion) ? '回答正确！' : '回答错误' }}
              </div>
              <div class="explanation">
                <strong>解析：</strong>
                {{ currentQuestion.explanation || '暂无详细解析' }}
              </div>
              <div class="tags" v-if="currentQuestion.tags">
                <span
                  v-for="tag in currentQuestion.tags"
                  :key="tag"
                  class="tag"
                >
                  #{{ tag }}
                </span>
              </div>

              <button class="next-btn" @click="nextQuestion">
                {{ currentIdx < questions.length - 1 ? '下一题' : '下一组' }}
              </button>
            </div>
          </transition>
        </div>
      </transition>
    </div>

    <!--闯关模式-->
    <div
      v-else-if="currentMode === 'challenge'"
      class="challenge-mode"
    >
      <!-- 头部 -->
      <div class="study-header">
        <button class="back-btn" @click="backToModeSelect">← 返回模式选择</button>
        <span class="current-category">
          当前关卡：{{ currentLevelName || '未选择' }}
        </span>
      </div>

      <!-- 进度条 -->
      <div
        class="progress-bar-container"
        v-if="questions.length"
      >
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- 题目列表：5 题 -->
      <div
        v-for="(q, index) in questions"
        :key="q.id"
        class="question-card"
      >
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

        <!-- 解析：提交后显示 -->
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

      <!-- 提交按钮 / 得分 -->
      <div class="submit-area" v-if="!isSubmitted && questions.length > 0">
        <button
          class="submit-btn"
          @click="submitChallenge"
          :disabled="Object.keys(userAnswers).length < questions.length"
        >
          提交答案 ({{ Object.keys(userAnswers).length }}/{{ questions.length }})
        </button>
      </div>

      <div v-else-if="questions.length > 0" class="score-area">
        <h3>本次得分：{{ calculateScore() }} / {{ questions.length * 20 }}</h3>
        <p v-if="isPass">恭喜通关！</p>
        <p v-else>分数未达通关标准，可以重试本关。</p>
        <button class="next-btn" @click="afterChallenge">继续</button>
      </div>

      <!-- 通关奖励卡片 -->
      <div v-if="showReward" class="reward-mask">
        <div class="reward-card">
          <h3>通关奖励 · {{ rewardLevel?.name }}</h3>
          <p class="reward-tagline">{{ rewardLevel?.rewardTitle }}</p>
          <p class="reward-desc">{{ rewardLevel?.rewardDesc }}</p>

      <!-- 奖励图片 -->
          <div v-if="rewardImage" class="reward-image-wrapper">
            <img
              :src="rewardImage"
              alt="通关奖励卡片"
              class="reward-image"
              @click="openImagePreview"
            />
          <div class="reward-image-hint">点击图片查看大图</div>
        </div>

        <button class="next-btn" @click="closeReward">收下藏品</button>
      </div>
    </div>

<!-- 放大奖励图片的预览层 -->
    <div
      v-if="isImagePreviewOpen && rewardImage"
      class="image-preview-mask"
      @click="closeImagePreview"
    >
      <img
        :src="rewardImage"
        alt="通关奖励放大图"
        class="image-preview-img"
        @click.stop
      />
      <button
        class="image-preview-close"
        @click.stop="closeImagePreview"
      >
        ✕
      </button>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import initialQuestions from '@/assets/questions.json'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, computed, onMounted } from 'vue'
import k1 from '@/assets/Quiz/k1.jpg'
import k2 from '@/assets/Quiz/k2.jpg'
import k3 from '@/assets/Quiz/k3.jpg'
import k4 from '@/assets/Quiz/k4.jpg'
import k5 from '@/assets/Quiz/k5.jpg'
import k6 from '@/assets/Quiz/k6.jpg'
import k7 from '@/assets/Quiz/k7.jpg'

const router = useRouter()
const route = useRoute()

// 常量：分类 + 关卡
const CATEGORIES = [
  { id: 'all',        name: '综合',   desc: '多领域混合练习，全面巩固基础', keywords: [] },
  { id: 'ceramics',   name: '瓷器',   desc: '从青花到粉彩，感受瓷上江山', keywords: ['瓷', '陶', '青花', '窑', '釉'] },
  { id: 'painting',   name: '书画',   desc: '笔墨纸砚间，重温丹青世界',   keywords: ['书', '画', '图', '贴', '卷', '轴'] },
  { id: 'bronze',     name: '青铜器', desc: '商周金声鼎食，器以载礼',   keywords: ['青铜', '鼎', '尊', '爵', '卣', '盘'] },
  { id: 'jade',       name: '玉器',   desc: '温润如玉，佩在腰间的文明',   keywords: ['玉', '璧', '琮', '佩'] },
  { id: 'goldSilver', name: '金银器', desc: '金碧辉煌背后的工艺与信仰', keywords: ['金', '银'] },
  { id: 'misc',       name: '杂项',   desc: '服饰、印砚、币章等趣味器物', keywords: ['服饰', '织绣', '印', '砚', '笔', '墨', '币'] }
]

// 七个闯关主题
const LEVELS = [
  {
    id: 'tang',
    name: '大唐风华',
    desc: '从三彩骏马到仕女俑，再现盛世长安气象。',
    keywords: ['唐', '皇', '骏马', '仕女'],
    rewardTitle: '长安一梦 · 盛世之光',
    rewardDesc: '你解锁了一张来自盛唐的“风华藏片”，仿佛踏入灯火万家的长安城。',
    cardImage: k1
  },
  {
    id: 'song',
    name: '宋韵清赏',
    desc: '细看汝窑官瓷与文人画，体味“清淡中见极华”。',
    keywords: ['宋', '瓷', '窑', '画','书'],
    rewardTitle: '风雅颂 · 一瓷一世界',
    rewardDesc: '你获得一枚“宋韵藏片”，杯盏之间，是千年前的风雅时光。',
    cardImage: k2
  },
  {
    id: 'bronzeRites',
    name: '金声玉振',
    desc: '追随青铜礼器脚步，读懂“以器明礼”的古老秩序。',
    keywords: ['青铜', '鼎', '钟', '玉'],
    rewardTitle: '钟鼎铭心 · 金声不绝',
    rewardDesc: '你获得“金声藏片”，钟鼎之声，回荡在历史长河。',
    cardImage: k3
  },
  {
    id: 'mingStyle',
    name: '大明风华',
    desc: '从斗彩瓷到凤冠霞帔，走进绚烂而秩序井然的大明盛景。',
    keywords: ['明', '彩', '金', '景德镇'],
    rewardTitle: '云鬓华服 · 锦绣大明',
    rewardDesc: '你获得“大明藏片”，一盏一冠之间，是朱明王朝的万种风华。',
    cardImage: k4
  },
  {
    id: 'courtLife',
    name: '宫廷日常',
    desc: '从御用瓷到陈设摆件，窥见深宫里的岁时与烟火。',
    keywords: ['瓷', '御制', '宫', '官'],
    rewardTitle: '一室宫灯 · 深宫烟火',
    rewardDesc: '你获得“宫廷藏片”，灯影摇曳里，是帝王家的寻常日子。',
    cardImage: k5
  },
  {
  id: 'craft', 
  name: '石器时代',
  desc: '从打制到磨制石器，追溯人类文明最初的火光与足迹。',
  keywords: ['石器', '磨制', '石斧', '石锛'],
  rewardTitle: '拓荒之刃 · 初火之光',
  rewardDesc: '你获得“石器时代藏片”，每一道石痕都记录着人类起源的脚步。',
  cardImage: k6
},
{
  id: 'maritime', 
  name: '汉风盛世',
  desc: '从瓦当画像到青铜器物，一窥汉朝“富庶天下”的雄浑气象。',
  keywords: ['汉', '西汉', '东汉','画像石', '铜'],
  rewardTitle: '大汉中兴 · 气象万千',
  rewardDesc: '你获得“汉代藏片”，山河广袤与车书同文尽收一片方寸之间。',
  cardImage: k7
}
]

// 数据模型与状态
const LOCAL_STORAGE_KEY = 'museum_quiz_bank'
const SEEN_STORAGE_KEY   = 'museum_quiz_seen'
const LEVEL_STATE_KEY    = 'museum_quiz_levels' 

type Option = { id: string; text: string }
type Question = {
  id: string;
  stem: string;
  options: Option[];
  answerId?: string;
  tags?: string[];
  explanation?: string;
}

const questions      = ref<Question[]>([])
const loading        = ref(false)
const error          = ref('')

const userAnswers    = ref<Record<string, string>>({})
const currentIdx     = ref(0)         
const isSubmitted    = ref(false)     

// 奖励+关卡状态
const showReward     = ref(false)
const rewardLevel    = ref<(typeof LEVELS)[number] | null>(null)
const rewardImage = computed(() => rewardLevel.value?.cardImage || '')
const levelState = ref<{ unlocked: string[]; passed: string[] }>({
  unlocked: ['tang'], // 默认解锁第一关
  passed: []
})

const isImagePreviewOpen = ref(false)

const openImagePreview = () => {
  if (rewardImage.value) {
    isImagePreviewOpen.value = true
  }
}

const closeImagePreview = () => {
  isImagePreviewOpen.value = false
}

// 路由相关 
const currentMode = computed(() => (route.query.mode as string) || '')
const hasMode     = computed(() => !!currentMode.value)

const currentModeClass = computed(() => {
  if (currentMode.value === 'study') return 'quiz--study'
  if (currentMode.value === 'challenge') return 'quiz--challenge'
  return 'quiz--home'   
})

const selectedCategoryId = computed(() => route.query.category as string | undefined)
const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value || selectedCategoryId.value === 'all') return '综合'
  const c = CATEGORIES.find(c => c.id === selectedCategoryId.value)
  return c?.name ?? '综合'
})

const currentLevelId = computed(() => route.query.level as string | undefined)
const currentLevel = computed(() => LEVELS.find(l => l.id === currentLevelId.value))
const currentLevelName = computed(() => currentLevel.value?.name ?? '')

// 当前题目
const currentQuestion = computed(() =>
  questions.value.length ? questions.value[currentIdx.value] : null
)

// 进度条
const progress = computed(() => {
  if (!questions.value.length) return 0
  if (currentMode.value === 'challenge') {
    return (Object.keys(userAnswers.value).length / questions.value.length) * 100
  }
  return ((currentIdx.value + 1) / questions.value.length) * 100
})

// 是否通关
const isPass = computed(() => {
  if (!questions.value.length || !isSubmitted.value) return false
  const score = calculateScore()
  return score >= questions.value.length * 12 // 60%
})

// 本地题库：和你原来的逻辑基本相同
const loadLocalBank = (): Question[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToLocalBank = (newQs: Question[]) => {
  const current = loadLocalBank()
  const unique = [...current]
  newQs.forEach(q => {
    if (!unique.some(e => e.stem === q.stem)) unique.push(q)
  })
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unique))
}

const loadSeenStems = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const markAsSeen = (qs: Question[]) => {
  const seen = loadSeenStems()
  qs.forEach(q => seen.add(q.stem))
  localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen]))
}

// 初始化题库
const initBank = () => {
  saveToLocalBank(initialQuestions as unknown as Question[])
}

// 洗牌
const shuffle = (arr: Question[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 按分类/关卡取题
const getRandomFromBank = (
  count = 5,
  categoryId?: string,
  level?: (typeof LEVELS)[number]
): Question[] => {
  const bank = loadLocalBank()
  if (!bank.length) return []

  const seen = loadSeenStems()

  let candidates = bank

  // 按学习分类过滤
  if (categoryId && categoryId !== 'all') {
    const cat = CATEGORIES.find(c => c.id === categoryId)
    if (cat && cat.keywords.length) {
      candidates = candidates.filter(q => {
        const tagMatch = q.tags?.some(t => cat.keywords.some(k => t.includes(k)))
        const stemMatch = cat.keywords.some(k => q.stem.includes(k))
        return tagMatch || stemMatch
      })
    }
  }

  // 按关卡主题过滤
  if (level && level.keywords.length) {
    candidates = candidates.filter(q => {
      const tagMatch = q.tags?.some(t => level.keywords.some(k => t.includes(k)))
      const stemMatch = level.keywords.some(k => q.stem.includes(k))
      return tagMatch || stemMatch
    })
  }

  const unused = candidates.filter(q => !seen.has(q.stem))
  const used   = candidates.filter(q => seen.has(q.stem))

  const unusedShuffled = shuffle([...unused])
  const usedShuffled   = shuffle([...used])

  if (unusedShuffled.length >= count) {
    return unusedShuffled.slice(0, count)
  }
  return [...unusedShuffled, ...usedShuffled.slice(0, count - unusedShuffled.length)]
}

// 关卡状态持久化
const loadLevelState = () => {
  try {
    const raw = localStorage.getItem(LEVEL_STATE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed.unlocked && parsed.passed) levelState.value = parsed
  } catch {}
}

const saveLevelState = () => {
  localStorage.setItem(LEVEL_STATE_KEY, JSON.stringify(levelState.value))
}

const isLevelUnlocked = (index: number) => {
  const level = LEVELS[index]
  return levelState.value.unlocked.includes(level.id)
}

const hasLevelPassed = (id: string) => levelState.value.passed.includes(id)


// 进入模式 / 分类 / 关卡
const backToModeSelect = () => {
  router.push({ name: 'Quiz', query: {} })
}

const enterStudyCategory = (catId: string) => {
  router.push({ name: 'Quiz', query: { mode: 'study', category: catId } })
}

const enterChallengeLevel = (level: (typeof LEVELS)[number], index: number) => {
  if (!isLevelUnlocked(index)) return
  router.push({ name: 'Quiz', query: { mode: 'challenge', level: level.id } })
}

// 答题逻辑
const selectOption = (qId: string, optId: string) => {
  if (currentMode.value === 'study') {
    if (userAnswers.value[qId]) return
    userAnswers.value[qId] = optId
  } else if (currentMode.value === 'challenge') {
    if (isSubmitted.value) return
    userAnswers.value[qId] = optId
  }
}

const isCorrect = (q: Question) => userAnswers.value[q.id] === q.answerId

const nextQuestion = async () => {
  if (currentIdx.value < questions.value.length - 1) 
  {
    currentIdx.value++
  } else 
  {
    await generateQuestions()
  }
}

const submitChallenge = () => {
  isSubmitted.value = true
}

const calculateScore = () => {
  let score = 0
  questions.value.forEach(q => {
    if (userAnswers.value[q.id] === q.answerId) score += 20
  })
  return score
}

// 闯关结束后的逻辑
const afterChallenge = () => {
  if (isPass.value && currentLevel.value) {
    // 标记通过 
    if (!levelState.value.passed.includes(currentLevel.value.id)) {
      levelState.value.passed.push(currentLevel.value.id)
    }
    const idx = LEVELS.findIndex(l => l.id === currentLevel.value!.id)
    const next = LEVELS[idx + 1]
    if (next && !levelState.value.unlocked.includes(next.id)) {
      levelState.value.unlocked.push(next.id)
    }
    saveLevelState()
    // 弹出奖励卡片
    rewardLevel.value = currentLevel.value
    showReward.value = true
  } else {
    reloadCurrentMode()
  }
}

// 奖励卡片关闭
const closeReward = () => {
  showReward.value = false
  // 通关后回到模式选择
  backToModeSelect()
}

// 生成题目 / 重新加载
const generateQuestions = async () => {
  error.value = ''
  loading.value = true
  userAnswers.value = {}
  isSubmitted.value = false
  currentIdx.value = 0
  showReward.value = false

  try {
    const mode = currentMode.value
    let qs: Question[] = []

    if (mode === 'study') {
      const catId = selectedCategoryId.value || 'all'
      qs = getRandomFromBank(5, catId)

      if (!qs.length) throw new Error('本地题库暂无该分类题目')
      questions.value = qs
      markAsSeen(qs)
    } else if (mode === 'challenge') {
      const level = currentLevel.value
      if (!level) throw new Error('未选择关卡')
      qs = getRandomFromBank(5, undefined, level)
      if (!qs.length) throw new Error('本地题库暂无该关卡题目')
      questions.value = qs
      markAsSeen(qs)
    }
  } catch (e: any) {
    error.value = e?.message || '生成题目失败'
  } finally {
    loading.value = false
  }
}

// 当前模式重载
const reloadCurrentMode = () => {
  if (!currentMode.value) return
  generateQuestions()
}

// 生命周期 
onMounted(() => {
  initBank()
  loadLevelState()

  if (currentMode.value) {
    generateQuestions()
  }
})
watch(
  () => route.query,
  () => {
    questions.value = []
    userAnswers.value = {}
    isSubmitted.value = false
    currentIdx.value = 0
    showReward.value = false
    error.value = ''

    if (currentMode.value) {
      generateQuestions()
    }
  }
)
</script>

<style scoped>
:root {
  --bg-paper: #F6F1E7;       
  --bg-panel: #fdfaf4;
  --ink-dark: #3f3325;     
  --ink-muted: #7a6a55;
  --accent-main: #b8773a;     
  --accent-main-deep: #9a5f26;
  --accent-secondary: #4f6f52;
  --accent-danger: #b6453c;   
  --border-soft: #e0d2bd;
}

/* 整体容器 */
.quiz {
  /*background-color: #F6F1E7; */  
  min-height: 100vh;
  width: 100%;
  padding-bottom: 3rem;
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--ink-dark);

  /* 背景通用设置 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 主页背景 */
.quiz--home {
  background-image: none;
}

/* 学习模式背景图 */
.quiz--study {
  background-image: url('/fang3.jpg');     
}

/* 闯关模式背景图 */
.quiz--challenge {
  background-image: url('/fang4.jpg');  
}
/* 顶部标题区域*/
.quiz-title-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 16px 0;   
  box-sizing: border-box;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #5b3a1a;
  margin: 0 0 24px;
  position: relative;
  font-family: "Noto Serif SC", "Source Han Serif", serif;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #c79c5b, #e0d4c0);
  margin: 12px auto 0;
  border-radius: 2px;
}

/* 小屏适配 */
@media (max-width: 768px) {
  .section-title {
    font-size: 26px;
    margin-bottom: 20px;
  }
}


/* 顶部横幅：像一幅挂轴 */
.banner-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 16px auto 32px;
  padding: 0 8px;
  box-sizing: border-box;
}

.banner {
  width: 100%;
  height: auto;
  display: block;
  border: none;
  border-radius: 0;
}

/*模式选择两大卡片*/
.mode-select {
  width: 78%;
  margin: 0 auto 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  background: var(--bg-panel);
  border-radius: 18px;
  padding: 1.4rem 1.6rem 1.2rem;
  border: 1px solid var(--border-soft);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
}

.mode-card-header h2 {
  font-size: 1.4rem;
  margin: 0 0 0.4rem;
  color: var(--ink-dark);
}

.mode-card-header p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ink-muted);
}

.mode-card--study {
  position: relative;
  overflow: hidden;

  /* 用和学习模式一样的背景图 */
  background-image: url('/fang3.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 卡片加遮罩，让文字更清晰 */
.mode-card--study::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    rgba(253, 247, 237, 0.55),
    rgba(243, 230, 212, 0.35)
  );
  pointer-events: none;
}

/* 让卡片里的内容盖在遮罩上面 */
.mode-card--study > * {
  position: relative;
  z-index: 1;
}

.mode-card--challenge {
  position: relative;
  overflow: hidden;

  /* 用和闯关模式一样的背景图 */
  background-image: url('/fang4.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.mode-card--challenge::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    rgba(254, 246, 242, 0.55),
    rgba(241, 224, 215, 0.35)
  );
  pointer-events: none;
}

.mode-card--challenge > * {
  position: relative;
  z-index: 1;
}

/* 模式内的小项列表*/
.mode-sublist {
  list-style: none;
  padding: 0;
  margin: 1.1rem 0 0;
}

.mode-subitem {
  position: relative; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}

.mode-subitem + .mode-subitem {
  margin-top: 0.4rem; 
}

/* 金色分隔线 */
.mode-subitem + .mode-subitem::before {
  content: "";
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  top: -0.2rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(196, 161, 104, 0.15),
    rgba(196, 161, 104, 0.7),
    rgba(196, 161, 104, 0.15)
  );
  pointer-events: none; /* 不影响点击 */
}

.mode-subitem:hover {
  background: rgba(244, 228, 205, 0.50);  
  border-color: var(--accent-main-deep);
  transform: translateY(-1px);
}

.mode-subitem--locked {
  opacity: 0.55;
  cursor: default;
}

.mode-subitem--locked:hover {
  background: none;
  border-color: transparent;
  transform: none;
}

.subitem-main {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.subitem-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink-dark);
}

.subitem-desc {
  font-size: 0.85rem;
  color: var(--ink-muted);
}

.subitem-arrow,
.subitem-status {
  font-size: 0.85rem;
  color: var(--accent-main-deep);
  white-space: nowrap;
}

/* 错误提示 */
.error-msg {
  width: 78%;
  margin: 1rem auto;
  text-align: center;
  color: var(--accent-danger);
  background: rgba(246, 225, 220, 0.9);
  padding: 1rem 1.2rem;
  border-radius: 12px;
  border: 1px dashed rgba(182, 87, 71, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
}

.error-msg button {
  padding: 0.4rem 1rem;
  background: var(--accent-danger);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* 主体区域宽度 */
.study-mode,
.challenge-mode {
  width: 78%;
  margin: 2rem auto 0;
}

/* 学习模式头部/闯关头部 */
.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.4rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--ink-muted);
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.1rem 0;
}

.back-btn:hover {
  color: var(--accent-main);
  text-decoration: underline;
}

.current-category {
  font-weight: 600;
  color: var(--ink-dark);
  padding: 0.4rem 1.1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-soft);
}

/* 进度条*/
.progress-bar-container {
  width: 100%;
  height: 6px;
  background: #e4d8c6;
  border-radius: 999px;
  margin-bottom: 1.3rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-secondary), var(--accent-main));
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 题目卡片 */
.question-card {
  /* 题目部分：更饱和的米色背景 */
  background:rgba(234,228,209);
  border-radius: 18px;
  padding: 1.6rem 1.6rem 1.4rem;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.6rem;
  border: 1px solid rgba(206, 186, 150, 0.9);
  position: relative;
}

.stem {
  font-size: 1.16rem;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--ink-dark);
}

.index {
  color: var(--accent-main-deep);
  font-size: 0.98rem;
  margin-right: 0.35rem;
}

/* 选项列表 */
.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.option-item {
  padding: 0.95rem 1.1rem;
  margin-bottom: 0.8rem;
  border: 1px solid #e3d6c5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.94);
  
}

.option-item:not(.disabled):hover {
  background-color: #f8f3ea;
  border-color: var(--accent-main);
  transform: translateX(3px);
}

.option-item:active {
  transform: scale(0.99);
}

.option-item.selected {
  border-color: var(--accent-main);
  background-color: #f4e4cf;
  color: var(--accent-main-deep);
  font-weight: 600;
}

.option-item.correct {
  border-color: var(--accent-secondary);
  background-color: #e5f1e7;
  color: var(--accent-secondary);
}

.option-item.wrong {
  border-color: var(--accent-danger);
  background-color: #f9e1dd;
  color: var(--accent-danger);
}

.option-item.disabled {
  cursor: default;
  opacity: 0.92;
}

.opt-id {
  margin-right: 0.4rem;
  font-weight: 600;
  color: var(--ink-muted);
}

/* 反馈区  */
.feedback {
  margin-top: 1.4rem;
  padding-top: 1rem;
  border-top: 1px dashed #d3c1a4;
  animation: fadeIn 0.3s ease;
}

.result {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.result.success { color: var(--accent-secondary); }
.result.fail { color: var(--accent-danger); }

.explanation {
  background: #faf5ed;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  color: #6b5c48;
  line-height: 1.6;
  border: 1px solid #e0d2bd;
}

.tags {
  margin-top: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #eee2d0;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  color: #6b5c48;
}

/* 下一题 / 提交按钮  */
.next-btn,
.submit-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.6rem;
  background-color: var(--accent-main);
  background-color: rgba(184, 119, 58, 0.35);
  color: #4A3B2A;   
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.98rem;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 20px rgba(184, 119, 58, 0.35);
  transition: all 0.2s ease;
}


.next-btn:hover,
.submit-btn:hover {
  background-color: var(--accent-main-deep);
  box-shadow: 0 14px 26px rgba(184, 119, 58, 0.45);
}

.submit-btn:disabled {
  background-color: #c7b59a;
  box-shadow: none;
  cursor: not-allowed;
}

/* 闯关模式得分/提交区 */
.submit-area,
.score-area {
  text-align: center;
  margin-top: 2rem;
}

.score-area h3 {
  color: #c2783b;
}

/* 通关奖励弹窗  */
.reward-mask {
  position: fixed;
  inset: 0;
  background: rgba(20, 16, 10, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.reward-card {
  width: min(380px, 90vw);
  background: #fdf7ed;
  border-radius: 18px;
  padding: 1.6rem 1.4rem 1.3rem;
  border: 1px solid #e0d2bd;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.reward-card h3 {
  margin: 0 0 0.6rem;
  font-size: 1.3rem;
  color: var(--ink-dark);
}

.reward-tagline {
  margin: 0 0 0.4rem;
  font-weight: 600;
  color: var(--accent-main-deep);
}

.reward-desc {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: #6b5c48;
}

/* 奖励图片 */
.reward-image-wrapper {
  margin: 0.6rem auto 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.reward-image {
  max-width: 260px;    
  max-height: 160px;
  object-fit: contain;  
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  cursor: zoom-in;
  background: #f8f3ea;
}

.reward-image-hint {
  font-size: 0.78rem;
  color: #9a8a73;
}

/* 放大预览遮罩层 */
.image-preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;  
}

/* 放大后的大图 */
.image-preview-img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
  background: #fdf7ed;
}

/* 右上角关闭按钮 */
.image-preview-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(248, 241, 228, 0.95);
  color: #5a4731;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.image-preview-close:hover {
  background: #fffaf0;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 加载遮罩  */
.loading-mask {
  position: fixed;
  inset: 0;
  background: rgba(245, 239, 226, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--accent-main-deep);
  font-size: 1.1rem;
  font-weight: 600;
}

.spinner {
  width: 52px;
  height: 52px;
  border: 4px solid #e0d2bd;
  border-top: 4px solid var(--accent-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.3rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 960px) {
  .banner-wrapper,
  .mode-select,
  .study-mode,
  .challenge-mode,
  .error-msg {
    width: 92%;
  }
}

@media (max-width: 640px) {
  .mode-select {
    grid-template-columns: 1fr;
  }
}
</style>
