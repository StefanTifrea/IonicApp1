import { useEffect } from 'react';
import { Plugins } from '@capacitor/core';
import { SongProps } from './SongProps';
import { OperationProps } from './OperationProps';

const { BackgroundTask } = Plugins;

export const useBackgroundTask = (asyncTask: () => Promise<void>) => {
  useEffect(() => {
    let taskId = BackgroundTask.beforeExit(async () => {
      console.log('useBackgroundTask - executeTask started');
      await asyncTask();
      console.log('useBackgroundTask - executeTask finished');
      BackgroundTask.finish({ taskId });
    });
  }, [])
  return {};
};