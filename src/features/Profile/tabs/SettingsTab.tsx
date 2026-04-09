import styles from '../Profile.module.css';

export default function SettingsTab() {
  return (
    <div className={styles.settingsTabWrapper}>
      <div className={styles.settingsForm}>
        <div className={`${styles.card} angular-card`} style={{ padding: '1.5rem 2rem' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>Основные настройки</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className={styles.inputGroup}>
              <label>Логин</label>
              <input type="text" className={styles.inputField} defaultValue="Skaldik_The_Great" />
            </div>

            <div className={styles.inputGroup}>
              <label>Юзернейм</label>
              <input type="text" className={styles.inputField} defaultValue="@Skaldik" />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" className={styles.inputField} defaultValue="skaldic@skald.io" />
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: '2rem', width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem' }}>
            Сохранить изменения
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className={`${styles.card} angular-card`} style={{ padding: '1.25rem 1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.25rem', color: 'var(--accent-purple)' }}>Безопасность</h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className={styles.inputGroup}>
                <label>Старый пароль</label>
                <input type="password" className={styles.inputField} placeholder="••••••••" style={{ padding: '10px 14px' }} />
              </div>
              <div className={styles.inputGroup}>
                <label>Новый пароль</label>
                <input type="password" className={styles.inputField} placeholder="••••••••" style={{ padding: '10px 14px' }} />
              </div>
            </div>

            <button className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', borderColor: 'var(--accent-purple)', fontWeight: 700, padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
              Обновить пароль
            </button>
          </div>

          <div className={`${styles.card} angular-card`} style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-red)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '200px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 'auto', color: 'var(--accent-red)', alignSelf: 'stretch' }}>Удаление аккаунта</h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem', lineHeight: '1.5' }}>
                Это действие необратимо. Все аккаунты, персоны и чаты будут удалены навсегда.
              </p>
              <button className="btn-secondary" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--accent-red)', borderColor: 'var(--accent-red)', fontWeight: 700, padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                Удалить аккаунт
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
