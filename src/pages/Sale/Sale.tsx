import React, { useEffect, useState } from "react";
import {
      View,
      Text,
      TextInput,
      TouchableOpacity,
      StyleSheet,
      Alert,
      ActivityIndicator,
      KeyboardAvoidingView,
      Platform,
      ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import axios from "axios";
import { API_BASE_URL } from "../../config.js/Api";
import {
      GET_RATE,
      GET_USER,
      POST_SUPPLY_DATA,
      POST_SUPPLY_SPECIAL_DATA,
} from "../../config.js/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Picker } from "@react-native-picker/picker";
import { setSellerData } from "../../redux/user";

type DataDetails = {
      sellerId: number;
      quantity: number;
      fat: number;
      status: string;
};

type UserDetails = {
      _id: string;
      sellerId: number;
      name: string;
      PhoneNumber: number;
      role: "ROLE_ADMIN" | "ROLE_SELLER";
};

interface UsersResponse {
      sellerData: UserDetails[];
      sellerIds: number[];
}

const getUsers = async (): Promise<UsersResponse> => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.get(`${API_BASE_URL}${GET_USER}`, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const getRate = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.get(`${API_BASE_URL}${GET_RATE}`, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const postSupply = async (payload: DataDetails) => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.post(`${API_BASE_URL}${POST_SUPPLY_DATA}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const postSpecialSupply = async (payload: DataDetails) => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.post(
            `${API_BASE_URL}${POST_SUPPLY_SPECIAL_DATA}`,
            payload,
            {
                  headers: { Authorization: `Bearer ${token}` },
            }
      );
      return res.data;
};

const Sale = () => {
      const dispatch = useDispatch();
      const sellerIds = useSelector((state: RootState) => state.sellers.sellerIds);

      const [form, setForm] = useState({
            sellerId: "",
            quantity: "",
            fat: "",
      });

      const [supplyType, setSupplyType] = useState<"normal" | "special">("normal");
      const [recentSupply, setRecentSupply] = useState<DataDetails | null>(null);
      const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);

      const { data, isLoading } = useQuery<UsersResponse>({
            queryKey: ["users"],
            queryFn: getUsers,
      });

      const { data: rateData } = useQuery({
            queryKey: ["rates"],
            queryFn: getRate,
      });

      useEffect(() => {
            if (data) {
                  dispatch(setSellerData(data));
            }
      }, [data]);

      const mutationNormal = useMutation({
            mutationFn: postSupply,
            onSuccess: (_, variables) => {
                  handleCalculation(variables);
                  setRecentSupply(variables);
                  Alert.alert("Success", "Normal supply submitted successfully!");
                  resetForm();
            },
            onError: (err: any) => {
                  Alert.alert("Error", err.message || "Something went wrong");
            },
      });

      const mutationSpecial = useMutation({
            mutationFn: postSpecialSupply,
            onSuccess: (_, variables) => {
                  handleCalculation(variables);
                  setRecentSupply(variables);
                  Alert.alert("Success", "Special supply submitted successfully!");
                  resetForm();
            },
            onError: (err: any) => {
                  Alert.alert("Error", err.message || "Something went wrong");
            },
      });

      const resetForm = () => {
            setForm({ sellerId: "", quantity: "", fat: "" });
      };

      const handleCalculation = (payload: DataDetails) => {
            if (!rateData) return;
            const rate =
                  supplyType === "special" ? rateData.specialRate : rateData.rate;
            const total = payload.fat * rate * payload.quantity;
            setCalculatedAmount(total);
      };

      const handleSubmit = () => {
            if (!form.sellerId || !form.quantity || !form.fat) {
                  Alert.alert("Error", "All fields are required");
                  return;
            }

            const payload: DataDetails = {
                  sellerId: Number(form.sellerId),
                  quantity: Number(form.quantity),
                  fat: Number(form.fat),
                  status: "Pending",
            };

            if (supplyType === "special") {
                  mutationSpecial.mutate(payload);
            } else {
                  mutationNormal.mutate(payload);
            }
      };

      if (isLoading) {
            return (
                  <View style={styles.center}>
                        <ActivityIndicator size="large" />
                        <Text>Loading users...</Text>
                  </View>
            );
      }

      const isPending = mutationNormal.isPending || mutationSpecial.isPending;

      return (
            <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                  <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                  >
                        <View style={styles.container}>
                              <Text style={styles.header}>New Supply Entry</Text>

                              <View style={styles.card}>
                                    <Text style={styles.label}>Seller</Text>
                                    <View style={styles.pickerWrapper}>
                                          <Picker
                                                selectedValue={form.sellerId}
                                                onValueChange={(value) => setForm({ ...form, sellerId: value })}
                                          >
                                                <Picker.Item label="Select Seller" value="" />
                                                {sellerIds?.map((seller: any) => (
                                                      <Picker.Item
                                                            key={seller}
                                                            label={seller.toString()}
                                                            value={seller.toString()}
                                                      />
                                                ))}
                                          </Picker>
                                    </View>

                                    <Text style={styles.label}>Quantity (litres)</Text>
                                    <TextInput
                                          style={styles.input}
                                          keyboardType="numeric"
                                          value={form.quantity}
                                          onChangeText={(text) => setForm({ ...form, quantity: text })}
                                          placeholder="Enter quantity"
                                          placeholderTextColor="#999"
                                    />

                                    <Text style={styles.label}>Fat (%)</Text>
                                    <TextInput
                                          style={styles.input}
                                          keyboardType="numeric"
                                          value={form.fat}
                                          onChangeText={(text) => setForm({ ...form, fat: text })}
                                          placeholder="Enter fat percentage"
                                          placeholderTextColor="#999"
                                    />

                                    <Text style={styles.label}>Supply Type</Text>
                                    <View style={styles.toggleContainer}>
                                          <TouchableOpacity
                                                style={[
                                                      styles.toggleButton,
                                                      supplyType === "normal" && styles.toggleActive,
                                                ]}
                                                onPress={() => setSupplyType("normal")}
                                          >
                                                <Text
                                                      style={[
                                                            styles.toggleText,
                                                            supplyType === "normal" && styles.toggleTextActive,
                                                      ]}
                                                >
                                                      Normal
                                                </Text>
                                          </TouchableOpacity>

                                          <TouchableOpacity
                                                style={[
                                                      styles.toggleButton,
                                                      supplyType === "special" && styles.toggleActive,
                                                ]}
                                                onPress={() => setSupplyType("special")}
                                          >
                                                <Text
                                                      style={[
                                                            styles.toggleText,
                                                            supplyType === "special" && styles.toggleTextActive,
                                                      ]}
                                                >
                                                      Special
                                                </Text>
                                          </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                          style={[styles.button, isPending && styles.buttonDisabled]}
                                          onPress={handleSubmit}
                                          disabled={isPending}
                                    >
                                          {isPending ? (
                                                <ActivityIndicator color="#fff" />
                                          ) : (
                                                <Text style={styles.buttonText}>Submit</Text>
                                          )}
                                    </TouchableOpacity>

                                    {/* Recently Submitted Card */}
                                    {recentSupply && (
                                          <View style={styles.recentCard}>
                                                <Text style={styles.recentTitle}>Recently Submitted</Text>
                                                <View style={styles.recentRow}>
                                                      <Text style={styles.recentLabel}>Seller ID:</Text>
                                                      <Text style={styles.recentValue}>
                                                            {recentSupply.sellerId}
                                                      </Text>
                                                </View>
                                                <View style={styles.recentRow}>
                                                      <Text style={styles.recentLabel}>Quantity:</Text>
                                                      <Text style={styles.recentValue}>
                                                            {recentSupply.quantity} L
                                                      </Text>
                                                </View>
                                                <View style={styles.recentRow}>
                                                      <Text style={styles.recentLabel}>Fat:</Text>
                                                      <Text style={styles.recentValue}>{recentSupply.fat}%</Text>
                                                </View>
                                                <View style={styles.recentRow}>
                                                      <Text style={styles.recentLabel}>Type:</Text>
                                                      <Text style={styles.recentValue}>
                                                            {supplyType === "special" ? "Special" : "Normal"}
                                                      </Text>
                                                </View>
                                                <View style={styles.recentRow}>
                                                      <Text style={styles.recentLabel}>Rate:</Text>
                                                      <Text style={styles.recentValue}>
                                                            {supplyType === "special"
                                                                  ? rateData?.specialRate
                                                                  : rateData?.rate}{" "}
                                                            ₹
                                                      </Text>
                                                </View>
                                                <View style={styles.recentRow}>
                                                      <Text style={styles.recentLabel}>Amount:</Text>
                                                      <Text style={styles.recentValue}>
                                                            {calculatedAmount ? calculatedAmount.toFixed(2) + " ₹" : "--"}
                                                      </Text>
                                                </View>
                                          </View>
                                    )}
                              </View>
                        </View>
                  </ScrollView>
            </KeyboardAvoidingView>
      );
};

export default Sale;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: "#f8f9fb",
            paddingHorizontal: 20,
            paddingTop: 60,
      },
      center: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
      },
      header: {
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 30,
            color: "#222",
      },
      card: {
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
      },
      label: {
            fontSize: 16,
            color: "#444",
            marginBottom: 8,
            marginTop: 16,
      },
      input: {
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
            color: "#000",
      },
      pickerWrapper: {
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            overflow: "hidden",
      },
      toggleContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
      },
      toggleButton: {
            flex: 1,
            borderWidth: 1,
            borderColor: "#007AFF",
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: "center",
            marginHorizontal: 4,
      },
      toggleActive: {
            backgroundColor: "#007AFF",
      },
      toggleText: {
            color: "#007AFF",
            fontSize: 15,
            fontWeight: "600",
      },
      toggleTextActive: {
            color: "#fff",
      },
      button: {
            backgroundColor: "#007AFF",
            paddingVertical: 14,
            borderRadius: 12,
            marginTop: 30,
            alignItems: "center",
      },
      buttonDisabled: {
            backgroundColor: "#7aa8f9",
      },
      buttonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
      },
      recentCard: {
            marginTop: 25,
            backgroundColor: "#e7f0ff",
            borderRadius: 12,
            padding: 15,
            borderWidth: 1,
            borderColor: "#cbd9ff",
      },
      recentTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: "#007AFF",
            marginBottom: 10,
      },
      recentRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
      },
      recentLabel: {
            color: "#333",
            fontWeight: "500",
      },
      recentValue: {
            color: "#000",
            fontWeight: "600",
      },
});
