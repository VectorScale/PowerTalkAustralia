import React from "react";
import { Stack } from "expo-router";

import Subheader from "@/PTComponents/Subheader";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#065395",
        },
        headerTintColor: "#F1F6F5",
        headerTitleStyle: {
          fontWeight: "bold",
        },
          header({options}) {
            return <Subheader {...options} />;
          },
        
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Meetings",
        }}
      />
    </Stack>
  );
}
