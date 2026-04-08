import React from 'react'
import Navbar from '@/components/ui/Navbar'
import { useDashboard } from '@/core/hooks/useDashboard'

// Components
import { DashboardSidebar } from '@/components/Dashboard/DashboardSidebar'
import { DashboardContentHeader } from '@/components/Dashboard/DashboardContentHeader'
import { DashboardCharacterGrid } from '@/components/Dashboard/DashboardCharacterGrid'
import { DashboardBackground } from '@/components/Dashboard/DashboardBackground'

import styles from '@/theme/screens/Dashboard/DashboardScreen.module.css'

const DashboardScreen: React.FC = () => {
  const {
    isLoading,
    error,
    nsfwEnabled,
    setNsfwEnabled,
    selectedFandoms,
    setSelectedFandoms,
    gender,
    setGender,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    isSidebarOpen,
    setIsSidebarOpen,
    availableFandoms,
    filteredCharacters,
    hotIds,
    resultsLabel
  } = useDashboard()

  return (
    <div className={styles.dashboard}>
      <Navbar variant="dashboard" />

      <DashboardBackground />

      <div className={styles.mainLayout}>
        <DashboardSidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          availableFandoms={availableFandoms}
          selectedFandoms={selectedFandoms}
          setSelectedFandoms={setSelectedFandoms}
          gender={gender}
          setGender={setGender}
          nsfwEnabled={nsfwEnabled}
          setNsfwEnabled={setNsfwEnabled}
        />

        <main className={styles.contentArea}>
          <DashboardContentHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredCharacters.length}
            resultsLabel={resultsLabel}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          <DashboardCharacterGrid
            characters={filteredCharacters}
            isLoading={isLoading}
            error={error}
            viewMode={viewMode}
            hotIds={hotIds}
          />
        </main>
      </div>
    </div>
  )
}

export default DashboardScreen
