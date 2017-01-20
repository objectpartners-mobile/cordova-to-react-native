This is the React Native version of the SuperfitTracker app. To build and run the app, follow these instructions. This app was built with React Native v 0.31.0 with the iOS 9.2 SDK in XCode 7.2. If compiling in XCode 8, you may get errors from RCTWebSocket. You can work around these by removing the compiler warning flags for that target. See here: [https://github.com/facebook/react-native/issues/8584#issuecomment-236366222](https://github.com/facebook/react-native/issues/8584#issuecomment-236366222)

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

<br>
**Windows Version**

For running the Windows version of the app within a Windows VM, and still using your host machine for development and for running the react-native packager, map localhost in the VM to your host's ip address:

In VirtualBox for example, in your VM's hosts file:

```
C:\Windows\System32\drivers\etc\hosts
```

add

```
10.0.2.2	localhost
```

If that doesn't work, you may need to map it to another host name, like "reactnativehost", or whatever you prefer. In that case, you will need to directly modify the react-native-windows node module.

```
node_modules\react-native-windows\ReactWindows\ReactNative.Shared\DevSupport\DevServerHelper.cs
```

and change

```
private const string DeviceLocalhost = "localhost:8081";
```

to

```
private const string DeviceLocalhost = “reactnativehost:8081";
```
