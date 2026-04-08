import styles from '@/theme/screens/Landing/AboutSection.module.css'

const HOW_IT_WORKS = [
  {
    step: '01',
    color: 'orange',
    title: 'Выберите персонажа',
    desc: 'Просмотрите каталог ИИ-персонажей, прописанных нашей командой.',
  },
  {
    step: '02',
    color: 'purple',
    title: 'Настройте чат',
    desc: 'Выберите режим Песочницы или запустите структурированный Сценарий, если пока нет идей.',
  },
  {
    step: '03',
    color: 'fuchsia',
    title: 'Напишите свой первый пост!',
    desc: 'Сделайте первый шаг в вашу новую историю. ИИ подхватит ваш ритм, учитывая характер героя и контекст мира.',
  },
]

export default function AboutSection() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      {/* Divider */}
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerIcon}>◈</span>
        <span className={styles.dividerLine} />
      </div>

      {/* Top: What is SkaldEngine */}
      <div className={styles.intro}>
        <div className={styles.introText}>
          <span className={styles.eyebrow}>О системе</span>
          <h2 id="about-heading" className={styles.title}>
            Нейросеть, которая{' '}<br />
            <span className={styles.highlight}>думает как человек..</span>
          </h2>
          <p className={styles.body}>
            Мы научили систему по-настоящему осмысливать каждое слово. 
            Перед тем как написать ответ, ИИ «проживает» сцену: анализирует подтекст, вспоминает детали 
            из прошлого и планирует развитие сюжета. Практически как живой, правда?
          </p>
        </div>

        {/* Chat-style post preview */}
        <div className={styles.chatPreview} aria-hidden="true">
          <div className={styles.chatHistory}>
            {/* User Message */}
            <div className={styles.userMessage}>
              <div className={styles.avatarUser}>U</div>
              <div className={styles.userContent}>
                <span className={styles.authorNameUser}>Пользователь</span>
                <div className={styles.bubbleUser}>...</div>
              </div>
            </div>

            {/* AI Message */}
            <div className={styles.aiMessage}>
              <div className={styles.aiSide}>
                <div className={styles.avatar}>S</div>
              </div>
              <div className={styles.aiContent}>
                <span className={styles.authorName}>Skald</span>
                <div className={styles.bubbleAI}>
                  <div className={styles.thoughtTag} title="Заняться телепатией">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
                    </svg>
                    <span>Мысли Skald...</span>
                  </div>
                  <div>
                    Морозный ветер пробирает до костей, но ты не чувствуешь холода. 
                    В твоих глазах — лишь отражение пламени, что пожирает старую библиотеку. 
                    Каждое слово в этих книгах, каждый секрет, что мы берегли веками
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fake Input */}
          <div className={styles.chatInput}>
            <div className={styles.inputText}>
              <span className={styles.cursor} />
              <span className={styles.placeholder}>Напишите что-нибудь</span>
            </div>
            <div className={styles.sendBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className={styles.how}>
        <span className={styles.eyebrow} style={{ textAlign: 'center', display: 'block' }}>Как это работает</span>
        <div className={styles.steps}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className={`${styles.step} ${styles[`step-${item.color}`]}`} id={`step-${item.step}`}>
              <div className={`${styles.stepNum} ${styles[`num-${item.color}`]}`}>{item.step}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
              <div className={`${styles.stepLine} ${styles[`line-${item.color}`]}`} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
