/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AssistantProvider, useAssistant } from './context/AssistantContext';
import { AndroidFrame } from './components/AndroidFrame';
import { MemoryVaultModal } from './components/MemoryVaultModal';
import { CameraVisionModal } from './components/CameraVisionModal';
import { VideoStudioModal } from './components/VideoStudioModal';
import { YouTubeModal } from './components/YouTubeModal';
import { QuickSettingsDrawer } from './components/QuickSettingsDrawer';
import { AppDrawerModal } from './components/AppDrawerModal';
import { SettingsModal } from './components/SettingsModal';
import { ActiveCallOverlay } from './components/ActiveCallOverlay';

const AssistantAppContent: React.FC = () => {
  const { activeModal } = useAssistant();

  return (
    <>
      <AndroidFrame />

      {/* Modals and Drawers */}
      {activeModal === 'memory' && <MemoryVaultModal />}
      {activeModal === 'camera' && <CameraVisionModal />}
      {activeModal === 'video_studio' && <VideoStudioModal />}
      {activeModal === 'youtube' && <YouTubeModal />}
      {activeModal === 'quick_settings' && <QuickSettingsDrawer />}
      {activeModal === 'apps' && <AppDrawerModal />}
      {activeModal === 'settings' && <SettingsModal />}

      {/* Call Overlay */}
      <ActiveCallOverlay />
    </>
  );
};

export default function App() {
  return (
    <AssistantProvider>
      <AssistantAppContent />
    </AssistantProvider>
  );
}
