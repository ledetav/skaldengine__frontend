import styles from './Profile.module.css';

export type ProfileTabType = 'main' | 'personas' | 'lorebooks' | 'settings';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  setActiveTab: (tab: ProfileTabType) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  const tabs: { id: ProfileTabType; label: string }[] = [
    { id: 'main', label: 'Основная информация' },
    { id: 'personas', label: 'Ваши персоны' },
    { id: 'lorebooks', label: 'Ваши лорбуки' },
    { id: 'settings', label: 'Настройки' },
  ];

  return (
    <nav className={styles.tabsNav}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
