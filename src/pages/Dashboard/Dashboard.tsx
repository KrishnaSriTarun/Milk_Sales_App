import React from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions, Button } from "react-native";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { API_BASE_URL } from "../../config.js/Api";
import { GET_SUPPLY_DATA } from "../../config.js/routes";

// Define types for API response
interface Supply {
      _id: string;
      sellerId: number;
      quantity: number;
      fat: number;
      rate: number;
      amount: number;
      status: string;
      createAt: string;
      __v: number;
}

interface SupplyResponse {
      currentPage: number;
      totalPages: number;
      totalSupplies: number;
      supplies: Supply[];
      distinctUserIds: number[];
}

// Fetch supply data
const getSupplyData = async (): Promise<SupplyResponse> => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await axios.get<SupplyResponse>(
            `${API_BASE_URL}${GET_SUPPLY_DATA}`,
            {
                  headers: { Authorization: `Bearer ${token}` },
            }
      );
      return res.data;
};

// Component
const Dashboard: React.FC = () => {
      const { data, isLoading, error, refetch, isFetching } = useQuery<SupplyResponse>({
            queryKey: ["supply"],
            queryFn: getSupplyData,
      });

      if (isLoading) {
            return (
                  <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#2b8a3e" />
                        <Text>Loading dashboard...</Text>
                  </View>
            );
      }

      if (error || !data) {
            return (
                  <View style={styles.loading}>
                        <Text style={{ color: "red" }}>
                              Error: {(error as Error)?.message || "Unknown error"}
                        </Text>
                  </View>
            );
      }

      const supplies = data.supplies || [];
      const totalMilk = supplies.reduce((sum, s) => sum + s.quantity, 0);
      const totalAmount = supplies.reduce((sum, s) => sum + s.amount, 0);
      const avgFat = supplies.length
            ? (supplies.reduce((sum, s) => sum + s.fat, 0) / supplies.length).toFixed(1)
            : "0.0";

      const chartData = supplies.map((s) => s.quantity);

      return (
            <ScrollView contentContainerStyle={styles.scroll}>
                  <Text style={styles.heading}>Dashboard</Text>
                  <Button onPress={async () => { await refetch(); }} title={isFetching ? "Refreshing" : "Refresh"} />

                  <View style={styles.row}>
                        <StatCard title="Total Milk" value={`${totalMilk} L`} />
                        <StatCard title="Total Amount" value={`₹${totalAmount}`} />
                  </View>

                  <View style={styles.row}>
                        <StatCard title="Avg Fat" value={`${avgFat}%`} />
                        <StatCard title="Total Supplies" value={String(data.totalSupplies)} />
                  </View>

                  <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Milk Quantity Trend</Text>
                        <LineChart
                              data={{
                                    labels: supplies.map((_, i) => `#${i + 1}`),
                                    datasets: [{ data: chartData }],
                              }}
                              width={Dimensions.get("window").width - 30}
                              height={220}
                              chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    color: () => "#2b8a3e",
                                    labelColor: () => "#333",
                                    strokeWidth: 2,
                              }}
                              bezier
                              style={{ borderRadius: 12 }}
                        />
                  </View>

                  <View style={styles.listContainer}>
                        <Text style={styles.chartTitle}>Recent Supplies</Text>
                        {supplies.length === 0 ? (
                              <Text>No supplies found.</Text>
                        ) : (
                              supplies.map((item) => (
                                    <View key={item._id} style={styles.supplyRow}>
                                          <Text style={styles.supplyText}>Id: {item.sellerId}</Text>
                                          <Text style={styles.supplyText}>Qty: {item.quantity} L</Text>
                                          <Text style={styles.supplyText}>Fat: {item.fat}%</Text>
                                          <Text style={styles.supplyText}>₹{item.amount}</Text>
                                          <Text style={[styles.status,
                                          item.status === "Pending" && styles.pending,
                                          item.status === "Completed" && styles.completed,
                                          ]}>
                                                {item.status}
                                          </Text>
                                    </View>
                              ))
                        )}
                  </View>
            </ScrollView>
      );
};

// StatCard component with types
interface StatCardProps {
      title: string;
      value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
      <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
      </View>
);

export default Dashboard;

// Styles
const styles = StyleSheet.create({
      scroll: {
            padding: 16,
            justifyContent: "center",
            backgroundColor: "#f5f6fa",
      },
      heading: {
            fontSize: 24,
            fontWeight: "bold",
            color: "#2b8a3e",
            textAlign: "center",
            marginBottom: 20,
            paddingTop: 20,
      },
      row: {
            flexDirection: "row",
            justifyContent: "space-between",
      },
      card: {
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            margin: 6,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
      },
      cardTitle: {
            fontSize: 14,
            color: "#777",
            marginBottom: 4,
      },
      cardValue: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#2b8a3e",
      },
      chartContainer: {
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
            overflow: "hidden"
      },
      chartTitle: {
            fontWeight: "bold",
            marginBottom: 10,
            color: "#333",
            fontSize: 16,
      },
      listContainer: {
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
      },
      supplyRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 8,
            borderBottomWidth: 0.5,
            borderBottomColor: "#ddd",
      },
      supplyText: {
            color: "#333",
            fontSize: 14,
      },
      status: {
            fontWeight: "bold",
      },
      pending: {
            color: "#d17b00",
      },
      completed: {
            color: "#0bbe08ff",
      },
      loading: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
      },
});
