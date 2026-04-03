import React from 'react';
import { OpenMemoryView } from './OpenMemoryView';

export function OpenMemoryViewComponent() {
  // Create a mock context with the tools API
  const context = {
    tools: {
      execute: async (toolName: string, args: any) => {
        // Call the plugin tool via electron IPC
        return await (window as any).electron.executePluginTool('com.enclave.openmemory', toolName, args);
      }
    }
  };

  return <OpenMemoryView context={context} />;
}
