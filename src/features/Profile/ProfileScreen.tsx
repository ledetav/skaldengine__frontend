import { useState } from 'react';
import type { ProfileTabType } from './ProfileTabs';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import MainTab from './tabs/MainTab';
import PersonasTab from './tabs/PersonasTab';
import LorebooksTab from './tabs/LorebooksTab';
import SettingsTab from './tabs/SettingsTab';
import Navbar from '@/components/ui/Navbar';
import { useProfile } from '@/core/hooks/useProfile';
import styles from './Profile.module.css';

// --- Chats from useProfile ---

import { useParams } from 'react-router-dom';

export default function ProfileScreen() {
  const { username } = useParams<{ username?: string }>();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('main');
  const { user, personas, lorebooks, lastChats, isLoading, error } = useProfile(username);

  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <Navbar variant="dashboard" />
        <div className={styles.loadingContainer}>
          <div className={styles.loader} />
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.profilePage}>
        <Navbar variant="dashboard" />
        <div className={styles.errorContainer}>
          <p>{error || 'Пользователь не найден'}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'main': return <MainTab user={user} lastChats={lastChats} />;
      case 'personas': return <PersonasTab personas={personas} />;
      case 'lorebooks': return <LorebooksTab lorebooks={lorebooks} />;
      case 'settings': return <SettingsTab user={user} />;
      default: return <MainTab user={user} lastChats={lastChats} />;
    }
  };

  return (
    <div className={styles.profilePage}>
      <Navbar variant="dashboard" />
      
      {/* Premium Background Elements */}
      <div className={styles.bgContainer}>
        <div className={styles.bgGrid} />
        <div className={styles.bgOverlay} />
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
      </div>

      <main className={styles.profileContainer}>
        <div className={styles.layoutWrapper}>
          <aside className={styles.sidebar}>
            <ProfileHeader user={user} isPublic={!!username} />
          </aside>

          <div className={styles.mainContent}>
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isPublic={!!username} />
            
            <div className={styles.contentArea}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
