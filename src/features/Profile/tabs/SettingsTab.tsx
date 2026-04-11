import { useState } from 'react';
import styles from '../Profile.module.css';
import type { UserProfile } from '@/core/types/profile';
import { authApi } from '@/core/api/auth';
import { useNavigate } from 'react-router-dom';

interface SettingsTabProps {
  user: UserProfile;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: user.login || '',
    username: user.username || '',
    email: user.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [apiKey, setApiKey] = useState(localStorage.getItem('skald_apiKey') || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      await authApi.updateMe({
        login: formData.login,
        username: formData.username,
        email: formData.email,
      });
      alert('Профиль успешно обновлен!');
    } catch (err: any) {
      alert(`Ошибка при обновлении: ${err.message || 'Сбой'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      alert('Введите оба пароля');
      return;
    }
    try {
      setIsUpdating(true);
      await authApi.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({ oldPassword: '', newPassword: '' });
      alert('Пароль успешно изменен!');
    } catch (err: any) {
      alert(`Ошибка при смене пароля: ${err.message || 'Сбой'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteMe();
      localStorage.removeItem('token');
      localStorage.removeItem('user_role');
      navigate('/');
    } catch (err: any) {
      alert(`Ошибка при удалении: ${err.message || 'Сбой'}`);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className={styles.settingsTabWrapper}>
      <div className={styles.settingsForm}>
        <div className={`${styles.card} angular-card`} style={{ padding: '1.5rem 2rem' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>Основные настройки</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className={styles.inputGroup}>
              <label>Логин</label>
              <input type="text" className={styles.inputField} value={formData.login} onChange={e => setFormData(prev => ({ ...prev, login: e.target.value }))} />
            </div>

            <div className={styles.inputGroup}>
              <label>Юзернейм</label>
              <input type="text" className={styles.inputField} value={formData.username} onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))} />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" className={styles.inputField} value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem', color: 'var(--accent-purple)' }}>Настройки AI</h2>
            <div className={styles.inputGroup}>
              <label>API Ключ AI (Skald)</label>
              <input 
                type="password" 
                className={styles.inputField} 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder="sk-..." 
                style={{ padding: '10px 14px' }} 
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Ключ необходим для генерации сообщений в чате. Он сохраняется только локально в вашем браузере.
              </p>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: '2rem', width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem' }}
            onClick={() => {
              handleUpdateProfile();
              localStorage.setItem('skald_apiKey', apiKey);
            }}
            disabled={isUpdating}
          >
            {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className={`${styles.card} angular-card`} style={{ padding: '1.25rem 1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.25rem', color: 'var(--accent-purple)' }}>Безопасность</h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className={styles.inputGroup}>
                <label>Старый пароль</label>
                <input type="password" className={styles.inputField} value={passwordData.oldPassword} onChange={e => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))} placeholder="••••••••" style={{ padding: '10px 14px' }} />
              </div>
              <div className={styles.inputGroup}>
                <label>Новый пароль</label>
                <input type="password" className={styles.inputField} value={passwordData.newPassword} onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" style={{ padding: '10px 14px' }} />
              </div>
            </div>

            <button 
              className="btn-secondary" 
              style={{ marginTop: '1.5rem', width: '100%', borderColor: 'var(--accent-purple)', fontWeight: 700, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              onClick={handleChangePassword}
              disabled={isUpdating}
            >
              Обновить пароль
            </button>
          </div>

          <div className={`${styles.card} angular-card`} style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border-red)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '200px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 'auto', color: 'var(--accent-red)', alignSelf: 'stretch' }}>Удаление аккаунта</h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem', lineHeight: '1.5' }}>
                Это действие необратимо. Все аккаунты, персоны и чаты будут удалены навсегда.
              </p>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--accent-red)', borderColor: 'var(--accent-red)', fontWeight: 700, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setShowDeleteModal(true)}
              >
                Удалить аккаунт
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Удаление аккаунта</h3>
            <p className={styles.modalDescription}>
              Вы уверены? Это действие необратимо.
            </p>
            <div className={styles.modalActions}>
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Отмена</button>
              <button className="btn-primary" style={{ background: 'var(--accent-red)' }} onClick={handleDeleteAccount}>Навсегда удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
