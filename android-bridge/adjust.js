var Adjust = {
    onCreate: function (adjustConfig) {
        if (adjustConfig && !adjustConfig.getSdkPrefix()) {
            adjustConfig.setSdkPrefix(this.getSdkPrefix());
        }
        this.adjustConfig = adjustConfig;
        if (AdjustBridge) {
            console.log('AdjustBridge.onCreate called')
            AdjustBridge.onCreate(JSON.stringify(adjustConfig));
        }
    },

    getConfig: function () {
        return this.adjustConfig;
    },

    trackEvent: function (adjustEvent) {
        if (AdjustBridge) {
            console.log('AdjustBridge.trackEvent called')
            AdjustBridge.trackEvent(JSON.stringify(adjustEvent));
        }
    },

    trackAdRevenue: function (source, payload) {
        if (AdjustBridge) {
            console.log('AdjustBridge.trackAdRevenue called')
            AdjustBridge.trackAdRevenue(source, payload);
        }
    },

    onResume: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.onResume called')
            AdjustBridge.onResume();
        }
    },

    onPause: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.onPause called')
            AdjustBridge.onPause();
        }
    },

    setEnabled: function (enabled) {
        if (AdjustBridge) {
            console.log('AdjustBridge.setEnabled called')
            AdjustBridge.setEnabled(enabled);
        }
    },

    isEnabled: function (callback) {
        if (!AdjustBridge) {
            return undefined;
        }
        // supports legacy return with callback
        if (arguments.length === 1) {
            // with manual string call
            if (typeof callback === 'string' || callback instanceof String) {
                this.isEnabledCallbackName = callback;
            } else {
                // or save callback and call later
                this.isEnabledCallbackName = 'Adjust.adjust_isEnabledCallback';
                this.isEnabledCallbackFunction = callback;
            }
            AdjustBridge.isEnabled(this.isEnabledCallbackName);
        } else {
            return AdjustBridge.isEnabled();
        }
    },

    adjust_isEnabledCallback: function (isEnabled) {
        if (AdjustBridge && this.isEnabledCallbackFunction) {
            this.isEnabledCallbackFunction(isEnabled);
        }
    },

    appWillOpenUrl: function (url) {
        if (AdjustBridge) {
            console.log('AdjustBridge.appWillOpenUrl called')
            AdjustBridge.appWillOpenUrl(url);
        }
    },

    setReferrer: function (referrer) {
        if (AdjustBridge) {
            console.log('AdjustBridge.setReferrer called')
            AdjustBridge.setReferrer(referrer);
        }
    },

    setOfflineMode: function (isOffline) {
        if (AdjustBridge) {
            console.log('AdjustBridge.setOfflineMode called')
            AdjustBridge.setOfflineMode(isOffline);
        }
    },

    sendFirstPackages: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.sendFirstPackages called')
            AdjustBridge.sendFirstPackages();
        }
    },

    addSessionCallbackParameter: function (key, value) {
        if (AdjustBridge) {
            console.log('AdjustBridge.addSessionCallbackParameter called')
            AdjustBridge.addSessionCallbackParameter(key, value);
        }
    },

    addSessionPartnerParameter: function (key, value) {
        if (AdjustBridge) {
            console.log('AdjustBridge.addSessionPartnerParameter called')
            AdjustBridge.addSessionPartnerParameter(key, value);
        }
    },

    removeSessionCallbackParameter: function (key) {
        if (AdjustBridge) {
            console.log('AdjustBridge.removeSessionCallbackParameter called')
            AdjustBridge.removeSessionCallbackParameter(key);
        }
    },

    removeSessionPartnerParameter: function (key) {
        if (AdjustBridge) {
            console.log('AdjustBridge.removeSessionPartnerParameter called')
            AdjustBridge.removeSessionPartnerParameter(key);
        }
    },

    resetSessionCallbackParameters: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.resetSessionCallbackParameters called')
            AdjustBridge.resetSessionCallbackParameters();
        }
    },

    resetSessionPartnerParameters: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.resetSessionPartnerParameters called')
            AdjustBridge.resetSessionPartnerParameters();
        }
    },

    setPushToken: function (token) {
        if (AdjustBridge) {
            console.log('AdjustBridge.setPushToken called')
            AdjustBridge.setPushToken(token);
        }
    },

    gdprForgetMe: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.gdprForgetMe called')
            AdjustBridge.gdprForgetMe();
        }
    },

    disableThirdPartySharing: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.disableThirdPartySharing called')
            AdjustBridge.disableThirdPartySharing();
        }
    },

    trackThirdPartySharing: function (adjustThirdPartySharing) {
        if (AdjustBridge) {
            console.log('AdjustBridge.trackThirdPartySharing called')
            AdjustBridge.trackThirdPartySharing(JSON.stringify(adjustThirdPartySharing));
        }
    },

    trackMeasurementConsent: function (consentMeasurement) {
        if (AdjustBridge) {
            console.log('AdjustBridge.trackMeasurementConsent called')
            AdjustBridge.trackMeasurementConsent(consentMeasurement);
        }
    },

    getGoogleAdId: function (callback) {
        if (AdjustBridge) {
            if (typeof callback === 'string' || callback instanceof String) {
                this.getGoogleAdIdCallbackName = callback;
            } else {
                this.getGoogleAdIdCallbackName = 'Adjust.adjust_getGoogleAdIdCallback';
                this.getGoogleAdIdCallbackFunction = callback;
            }
            console.log('AdjustBridge.getGoogleAdId called')
            AdjustBridge.getGoogleAdId(this.getGoogleAdIdCallbackName);
        }
    },

    adjust_getGoogleAdIdCallback: function (googleAdId) {
        if (AdjustBridge && this.getGoogleAdIdCallbackFunction) {
            this.getGoogleAdIdCallbackFunction(googleAdId);
        }
    },

    getAmazonAdId: function (callback) {
        if (AdjustBridge) {
            return AdjustBridge.getAmazonAdId();
        } else {
            return undefined;
        }
    },

    getAdid: function () {
        if (AdjustBridge) {
            return AdjustBridge.getAdid();
        } else {
            return undefined;
        }
    },

    getAttribution: function (callback) {
        if (AdjustBridge) {
            console.log('AdjustBridge.getAttribution called')
            AdjustBridge.getAttribution(callback);
        }
    },

    getSdkVersion: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.getSdkVersion called')
            return this.getSdkPrefix() + '@' + AdjustBridge.getSdkVersion();
        } else {
            return undefined;
        }
    },

    getSdkPrefix: function () {
        if (this.adjustConfig) {
            console.log('AdjustBridge.getSdkPrefix called')
            return this.adjustConfig.getSdkPrefix();
        } else {
            return 'web-bridge4.29.1';
        }
    },

    teardown: function () {
        if (AdjustBridge) {
            console.log('AdjustBridge.teardown called')
            AdjustBridge.teardown();
        }
        this.adjustConfig = undefined;
        this.isEnabledCallbackName = undefined;
        this.isEnabledCallbackFunction = undefined;
        this.getGoogleAdIdCallbackName = undefined;
        this.getGoogleAdIdCallbackFunction = undefined;
    },
};

//window.Adjust = Adjust;