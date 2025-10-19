import { init } from 'vwo-fme-node-sdk';

class VWOService {
  constructor() {
    this.vwoClient = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize VWO SDK with settings refresh
      this.vwoClient = await init({
        sdkKey: process.env.VWO_SDK_KEY,
        accountId: process.env.VWO_ACCOUNT_ID,
        isDevelopmentMode: process.env.NODE_ENV === 'development',
        // Force refresh settings from VWO servers
        settingsFile: null, // Don't use cached settings
        pollingInterval: 1000 // Poll for updates every 1 second in development
      });

      this.isInitialized = true;
      console.log('✅ VWO SDK initialized successfully');
      console.log('🔄 VWO SDK will fetch latest settings from eeee dashboard');
    } catch (error) {
      console.error('❌ Failed to initialize VWO SDK:', error);
      this.isInitialized = false;
    }
  }

  // Get feature flag with variables (following VWO documentation)
  async getFeatureFlag(flagKey, userContext) {
    if (!this.isInitialized) {
      console.warn('VWO SDK not initialized, returning default values');
      return {
        isEnabled: false,
        variables: {},
        buttonText: 'Report an issue'
      };
    }

    try {
      console.log('🔍 VWO: Getting flag for key:', flagKey, 'user:', userContext.id);
      
      try {
        const allFlags = await this.vwoClient.getAllFlags(userContext);
        console.log('🔍 VWO: All available flags:', Object.keys(allFlags || {}));
      } catch (e) {
        console.log('🔍 VWO: Could not get all flags:', e.message);
      }
      
      // Get the flag object as per VWO documentation
      const flag = await this.vwoClient.getFlag(flagKey, userContext);
      
      if (!flag) {
        console.log('❌ VWO: No flag found, returning default');
        return {
          isEnabled: false,
          variables: {},
          buttonText: 'Report an issue'
        };
      }

      // Check if flag is enabled
      const isEnabled = flag.isEnabled();
      console.log('🔍 VWO: Flag enabled?', isEnabled);
      
      // Get variables if flag is enabled
      let variables = {};
      let buttonText = 'Report an issue';
      
      if (isEnabled) {
        variables = flag.getVariables();
        console.log('🔍 VWO: All variables:', variables);
        
        // Get the NavbarConvert variable value
        buttonText = flag.getVariable('NavbarConvert', 'Report an issue');
        console.log('🔍 VWO: NavbarConvert value:', buttonText);
      } else {
        console.log('🔍 VWO: Flag not enabled, using default text');
      }

      console.log('🎯 VWO: Final button text:', buttonText);

      return {
        isEnabled,
        variables,
        buttonText
      };
    } catch (error) {
      console.error(`Error getting feature flag ${flagKey}:`, error);
      return {
        isEnabled: false,
        variables: {},
        buttonText: 'Report an issue'
      };
    }
  }

  // Track conversion event
  trackConversion(flagKey, userContext, revenue = null) {
    if (!this.isInitialized) {
      console.warn('VWO SDK not initialized, skipping conversion tracking');
      return;
    }

    try {
      console.log('🎯 Attempting to track event e1 for user:', userContext.id);
      
      // Track the specific event - try both event names
      // According to VWO docs: vwoClient.trackEvent('event-name', userContext)
      let result;
      try {
        result = this.vwoClient.trackEvent('e1', userContext);
      } catch (e1Error) {
        console.log('🔄 Event e1 failed, trying jansetu-navbar-buttonClick...');
        result = this.vwoClient.trackEvent('jansetu-navbar-buttonClick', userContext);
      }
      
      console.log('✅ VWO Event e1 tracked successfully for user:', userContext.id);
      console.log('📊 Tracking result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error tracking conversion for', flagKey, ':', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ User context:', userContext);
      
      // Try alternative event names that might be configured
      console.log('🔄 Trying alternative event names...');
      try {
        const altResult = this.vwoClient.trackEvent('jansetu-navbar-buttonClick', userContext);
        console.log('✅ Alternative event tracked:', altResult);
        return altResult;
      } catch (altError) {
        console.error('❌ Alternative event also failed:', altError.message);
      }
    }
  }
}

export default new VWOService();
