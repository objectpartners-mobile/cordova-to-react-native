This is the React Native version of the SuperfitTracker app. To build and run the app, follow these instructions.

**Install node modules**

```
npm install
```

<br>
**Additional setup for iOS**

open node_modules/react-native-maps/ios/AirMaps/AIRMap.h

Delete the line

```
#import <React/RCTComponent.h>
```

open node_modules/react-native-maps/ios/AirMaps/AIRMapCallout.h

Change the line

```
#import "React/RCTView.h"
```

to

```
#import "RCTView.h"
```

<br>
**Additional setup for Android**

You need to have Build Tools 23.0.1 and Google Play Services installed

You will need to enter your API key for Google Maps into the
meta tag with the name "com.google.android.maps.v2.API_KEY" in  android/app/src/main/AndroidManifest.xml

See https://developers.google.com/maps/documentation/android-api/signup for details on obtaining an API key

<br>
**Run the app**

```
react-native run-ios
```

To run on Android, make sure an emulator is up and running first

```
react-native run-android
```

<br>
**Simulate GPS data**

iOS: in the simulator Click Debug -> Location and select something sensible, like "City Bicycle Ride" or "City Run"

Android: open a terminal window and type the following:

```telnet localhost 5554```

Then use the geo fix command to send coordinates to the device

```
geo fix -99.0123 44.1234
geo fix -99.1234 44.0432
...
```
