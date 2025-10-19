import vwoService from '../services/vwoService.js';

export const getButtonText = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(' VWO Experiment API called for user:', userId);
    
    const userContext = {
      id: userId || 'anonymous',
    };

    const flagData = await vwoService.getFeatureFlag('kaustubhJanSetu', userContext);
    console.log(' VWO Flag data:', flagData);
    
    const finalButtonText = 'Complaint kardo yaar';
    
    res.json({
      buttonText: finalButtonText,
      isEnabled: flagData.isEnabled,
      variables: flagData.variables,
      experimentKey: 'kaustubhJanSetu'
    });
  } catch (error) {
    console.error('Error getting button text:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      buttonText: 'Complaint kardo yaar' // Fallback
    });
  }
};

// Track button click conversion
export const trackButtonClick = async (req, res) => {
  try {
    const { userId } = req.params;
    const { buttonText } = req.body;
    
    console.log('🎯 Tracking button click for user:', userId, 'buttonText:', buttonText);
    
    const userContext = {
      id: userId || 'anonymous',
    };

    // Track the conversion event
    vwoService.trackConversion('kaustubhJanSetu', userContext);
    
    console.log('✅ Conversion tracked successfully for user:', userId);
    
    res.json({ 
      message: 'Button click tracked successfully',
      buttonText: buttonText || 'Report an issue',
      userId: userId,
      timestamp: new Date().toISOString(),
      experimentKey: 'kaustubhJanSetu'
    });
  } catch (error) {
    console.error('❌ Error tracking button click:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
