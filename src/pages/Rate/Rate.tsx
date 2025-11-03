import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ActivityIndicator, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../config.js/Api";
import { GET_RATE, UPDATE_RATE } from "../../config.js/routes";

const getRate = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.get(`${API_BASE_URL}${GET_RATE}`, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const updateRate = async (payload: { rate: number }, id: string) => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.put(`${API_BASE_URL}${UPDATE_RATE}/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const Rate = () => {
      const { data, isLoading, error, refetch } = useQuery({
            queryKey: ["rates"],
            queryFn: getRate,
      });

      const [rate, setRate] = useState<string>("");
      const [specialRate, setSpecialRate] = useState<string>("");

      // Set state once data arrives
      useEffect(() => {
            if (data) {
                  setRate(String(data.rate ?? ""));
                  setSpecialRate(String(data.specialRate ?? ""));
            }
      }, [data]);


      const mutation = useMutation({
            mutationFn: ({ payload, id }: { payload: { rate: number }; id: string }) =>
                  updateRate(payload, id),
            onSuccess: (data) => {
                  console.log("Rate updated successfully:", data);
                  refetch();
            },
            onError: (error) => {
                  console.error("Failed to update rate:", error);
            },
      });

      const handleSubmit = () => {
            const parsedRate = parseFloat(rate);
            if (isNaN(parsedRate)) return console.warn("Invalid rate");
            mutation.mutate({ payload: { rate: parsedRate }, id: data._id });
      };


      if (isLoading) {
            return (
                  <View style={styles.center}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text>Loading rates...</Text>
                  </View>
            );
      }

      if (error) {
            return (
                  <View style={styles.center}>
                        <Text style={styles.error}>Failed to fetch rates</Text>
                  </View>
            );
      }

      return (
            <View style={styles.container}>
                  <Text style={styles.title}>Rate Details</Text>

                  <View style={styles.formGroup}>
                        <Text style={styles.label}>Rate</Text>
                        <TextInput
                              style={styles.input}
                              value={rate}
                              keyboardType="decimal-pad"
                              onChangeText={setRate}
                        />
                  </View>

                  <View style={styles.formGroup}>
                        <Text style={styles.label}>Special Rate</Text>
                        <TextInput
                              style={styles.input}
                              value={specialRate}
                              keyboardType="decimal-pad"
                              onChangeText={setSpecialRate}
                        />
                  </View>

                  <Button title="Update Rate" onPress={handleSubmit} disabled={mutation.isPending} />
            </View>
      );
};

export default Rate;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: "#f8f8f8",
            padding: 20,
            justifyContent:"center",
      },
      center: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
      },
      title: {
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 20,
            textAlign: "center",
      },
      formGroup: {
            marginBottom: 15,
      },
      label: {
            fontSize: 16,
            color: "#555",
            marginBottom: 5,
      },
      input: {
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
            backgroundColor: "#fff",
            color: "#333",
      },
      error: {
            color: "red",
      },
});
