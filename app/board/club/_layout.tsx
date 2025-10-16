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
        name="members"
        options={{
          title: "Club Members",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="guests"
        options={{
          title: "Guests",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="meetings"
        options={{
          title: "Upcoming Meetings",
        }}
      />
      <Stack.Screen
        name="addMember"
        options={{
          title: "Add New Member",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="addExisting"
        options={{
          title: "Add Existing Member",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="addGuest"
        options={{
          title: "Add Guest",
          headerShown:true,
        }}
      />
      <Stack.Screen
        name="addMeeting"
        options={{
          title: "Add Meeting",
          headerShown:true,
        }}
      />
    </Stack>
  );
}
