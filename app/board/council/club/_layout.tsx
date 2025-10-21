import React from "react";
import { Stack } from "expo-router";

import Subheader from "@/PTComponents/Subheader";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
        name="boardMembers"
        options={{
          title: "Board Members",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="Members"
        options={{
          title: "Club Members",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="editBoardMember"
        options={{
          title: "Assign Board Member",
          headerShown:true,
        }}
      />
    </Stack>
  );
}
