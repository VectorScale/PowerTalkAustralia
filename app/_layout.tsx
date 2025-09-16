import React from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import * as useStatusBar from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

import PTHeader from "@/PTComponents/Header";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (Platform.OS == "android") {
    NavigationBar.setVisibilityAsync("hidden");
  }
  useStatusBar.setStatusBarHidden(false);
  useStatusBar.setStatusBarStyle("dark");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        header({options}) {
          return <PTHeader enabled={true}/>;
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown:false,
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="login"
        options={{
          header() {
            return <PTHeader enabled={false} />;
          },
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="register"
        options={{
          header() {
            return <PTHeader enabled={false} />;
          },
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="profile"
        options={{
          header() {
            return <PTHeader enabled={false} />;
          },
        }}
      ></Stack.Screen>
    </Stack>
  );
}
