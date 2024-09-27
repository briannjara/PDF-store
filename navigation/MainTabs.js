import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
// Import other screens as needed

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          // Add more conditions for other tabs

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6600',
        tabBarInactiveTintColor: '#808080',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabBarLabel, focused && styles.tabBarLabelFocused]}>Home</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabBarLabel, focused && styles.tabBarLabelFocused]}>Profile</Text>
          ),
        }}
      />
      {/* Add other tabs as needed */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    paddingBottom: 5,
  },
  tabBarItem: {
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#808080',
  },
  tabBarLabelFocused: {
    color: '#FF6600',
  },
});

export default MainTabs;