import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import Billing from "../Billing/Billing";
import Dashboard from "../Dashboard/Dashboard";
import Sale from "../Sale/Sale";
import Rate from "../Rate/Rate";
import RegisterForm from "../RegisterForm";
import Forms from "../Forms/Forms";
import Users from "../Users/Users";
const Tab = createBottomTabNavigator();

const Footer = () => {
      return (
            <Tab.Navigator
                  screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarShowLabel: false,
                        tabBarIcon: ({ color, size }) => {
                              let iconName = "";
                              switch (route.name) {
                                    case "Billing":
                                          iconName = "receipt-long";
                                          break;
                                    case "Dashboard":
                                          iconName = "dashboard";
                                          break;
                                    case "Sale":
                                          iconName = "shopping-cart";
                                          break;
                                    case "Forms":
                                          iconName = "star-rate";
                                          break;
                                    case "UsersList":
                                          iconName = "people";
                                          break;
                              }
                              return <Icon name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: "#007AFF",
                        tabBarInactiveTintColor: "#999",
                  })}
            >
                  <Tab.Screen name="Dashboard" component={Dashboard} />
                  <Tab.Screen name="Billing" component={Billing} />
                  <Tab.Screen name="Sale" component={Sale} />
                  <Tab.Screen name="Forms" component={Forms} />
                  <Tab.Screen name="UsersList" component={Users} />
            </Tab.Navigator>
      );
};

export default Footer;
