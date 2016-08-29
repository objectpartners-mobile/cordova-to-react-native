This is the Cordova version of the SuperfitTracker app. Follow these instructions to build and run the app.

**Add the platforms**

```
cordova platform add ios
cordova platform add android
```

<br>
**Install the additional plugins**

```
cordova plugin add https://github.com/phonegap-googlemaps-plugin/cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="ANDROID_API_KEY" --variable API_KEY_FOR_IOS="IOS_API_KEY"
```

To get API keys for Google Maps, go to https://developers.google.com/maps/

```
cordova plugin add cordova-plugin-geolocation
```

**Build and run**

```
cordova build ios
cordova build android

cordova run ios
cordova run android
```
