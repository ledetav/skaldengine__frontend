import { useState } from 'react';
import type { UserProfile, ProfilePersona, ProfileLorebook } from '@/core/types/profile';
import type { Chat } from '@/core/types/chat';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import type { ProfileTabType } from './ProfileTabs';
import MainTab from './tabs/MainTab';
import PersonasTab from './tabs/PersonasTab';
import LorebooksTab from './tabs/LorebooksTab';
import SettingsTab from './tabs/SettingsTab';
import Navbar from '@/components/ui/Navbar';
import styles from './Profile.module.css';

// --- Mock Data ---
const MOCK_USER: UserProfile = {
  id: 'u1',
  email: 'skaldic@skald.io',
  login: 'Skaldik_The_Great',
  username: '@Skaldik',
  full_name: 'Эйвор Воитель',
  avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
  cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
  role: 'user',
  created_at: '2025-10-12T14:30:00Z',
  statistics: {
    total_chats: 42,
    total_personas: 4,
    total_lorebooks: 7,
    total_messages: 1337
  }
};

const MOCK_PERSONAS: ProfilePersona[] = [
  {
    id: 'p1',
    name: 'Арагорн',
    description: 'Следопыт с Севера, истинный король Гондора. Мудрый, сильный и преданный.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    age: 87,
    gender: 'Мужской',
    lorebook_count: 3,
    chat_count: 12
  },
  {
    id: 'p2',
    name: 'Галадриэль',
    description: 'Владычица Лориэна, одна из самых могущественных эльфиек Средиземья.',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    age: 7000,
    gender: 'Женский',
    lorebook_count: 2,
    chat_count: 8
  },
  {
    id: 'p3',
    name: 'Гимли',
    description: 'Сын Глоина, бесстрашный гном-воин и верный друг Леголаса.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    age: 139,
    gender: 'Мужской',
    lorebook_count: 1,
    chat_count: 15
  }
];

const MOCK_LOREBOOKS: ProfileLorebook[] = [
  {
    id: 'lb1',
    name: 'Хроники Арды',
    description: 'Собрание знаний о создании мира, валар и первых эпохах.',
    character_name: 'Общий',
    entries_count: 124
  },
  {
    id: 'lb2',
    name: 'Травник Следопыта',
    description: 'Описание лечебных и ядовитых растений Диких Земель.',
    character_name: 'Арагорн',
    entries_count: 15
  },
  {
    id: 'lb3',
    name: 'Песни Лориэна',
    description: 'Древние эльфийские напевы и предания о свете Звезд.',
    character_name: 'Галадриэль',
    entries_count: 32
  }
];

const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    user_id: 'u1',
    character_id: 'char1',
    user_persona_id: 'p1',
    title: 'Совет у Элронда',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2025-12-02T15:30:00Z',
    is_acquainted: true,
    language: 'ru',
    narrative_voice: 'third',
    checkpoints_count: 5,
    mode: 'scenario'
  },
  {
    id: 'c2',
    user_id: 'u1',
    character_id: 'char2',
    user_persona_id: 'p1',
    title: 'Переправа через Андуин',
    created_at: '2025-11-25T14:20:00Z',
    updated_at: '2025-11-26T09:10:00Z',
    is_acquainted: false,
    language: 'ru',
    narrative_voice: 'first',
    checkpoints_count: 12,
    mode: 'sandbox'
  },
  {
    id: 'c3',
    user_id: 'u1',
    character_id: 'char3',
    user_persona_id: 'p2',
    title: 'Тени Лихолесья',
    created_at: '2025-11-20T18:45:00Z',
    updated_at: '2025-11-21T21:00:00Z',
    is_acquainted: true,
    language: 'ru',
    narrative_voice: 'third',
    checkpoints_count: 8,
    mode: 'scenario'
  }
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('main');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'main': return <MainTab user={MOCK_USER} lastChats={MOCK_CHATS} />;
      case 'personas': return <PersonasTab personas={MOCK_PERSONAS} />;
      case 'lorebooks': return <LorebooksTab lorebooks={MOCK_LOREBOOKS} />;
      case 'settings': return <SettingsTab />;
      default: return <MainTab user={MOCK_USER} lastChats={MOCK_CHATS} />;
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
            <ProfileHeader user={MOCK_USER} />
          </aside>

          <div className={styles.mainContent}>
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className={styles.contentArea}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
