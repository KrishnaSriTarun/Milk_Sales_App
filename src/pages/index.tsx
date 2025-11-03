import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./Login";
import Footer from "./Footer/Footer";
import { NavigationContainer } from "@react-navigation/native";


const Main = () => {
      const [loading, setLoading] = useState(true);
      const [hasToken, setHasToken] = useState(false);

      useEffect(() => {
            const checkToken = async () => {
                  try {
                        const token = await AsyncStorage.getItem("token");
                        setHasToken(!!token);
                  } catch (err) {
                        console.log("Error reading token:", err);
                  } finally {
                        setLoading(false);
                  }
            };
            checkToken();
      }, []);

      if (loading) {
            return (
                  <View style={styles.container}>
                        <ActivityIndicator size="large" />
                  </View>
            );
      }

      return (
            <View style={{ flexGrow: 1 }}>
                  {!hasToken ? (
                        <Login />
                  ) : (
                        <View style={{ flex: 1 }}>
                              <NavigationContainer>
                                    <Footer />
                              </NavigationContainer>
                        </View>
                  )}
            </View>
      );

};

export default Main;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            
            justifyContent:"center",
      },
});
