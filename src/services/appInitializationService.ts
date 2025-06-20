
import { realtimeJobRecommendationService } from './realtimeJobRecommendationService';

export class AppInitializationService {
  private static initialized = false;

  static async initialize() {
    if (AppInitializationService.initialized) {
      return;
    }

    try {
      console.log('🚀 Initializing JobMatchAI application...');

      // Start realtime job processing service
      await realtimeJobRecommendationService.startRealtimeJobProcessing();
      
      console.log('✅ JobMatchAI initialization complete');
      AppInitializationService.initialized = true;

    } catch (error) {
      console.error('❌ Error initializing JobMatchAI:', error);
    }
  }

  static isInitialized(): boolean {
    return AppInitializationService.initialized;
  }
}

export const appInitializationService = AppInitializationService;
