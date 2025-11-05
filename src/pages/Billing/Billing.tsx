import React, { useState } from 'react';
import {
      StyleSheet,
      Text,
      View,
      TextInput,
      Button,
      ScrollView,
      ActivityIndicator,
      TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config.js/Api';
import { DELETE_SUPPLY, GET_SUPPLY_BY_RANGE, UPDATE_SUPPLY_STATUS } from '../../config.js/routes';
import DateTimePicker from "@react-native-community/datetimepicker";


type Supply = {
      sellerId: string;
      from: string;
      to: string;
};

type SupplyItem = {
      _id: string;
      name?: string;
      quantity?: number;
      price?: number;
      status?: string;
      [key: string]: any;
};

// --- API CALLS ---
const getSupplyByRange = async ({ sellerId, from, to }: Supply) => {
      console.log(sellerId, from, to);

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.get(`${API_BASE_URL}${GET_SUPPLY_BY_RANGE}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { sellerId, from, to },
      });
      console.log("res", res);

      return res.data;
};

const updateSupply = async (payload: Supply) => {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.put(`${API_BASE_URL}${UPDATE_SUPPLY_STATUS}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const deleteSupply = async (id: string) => {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.delete(`${API_BASE_URL}${DELETE_SUPPLY}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

// --- COMPONENT ---
const Billing= () => {
      const [form, setForm] = useState<Supply>({
            sellerId: '',
            from: '',
            to: '',
      });

      const [showFromPicker, setShowFromPicker] = useState(false);
      const [showToPicker, setShowToPicker] = useState(false);

      const { data, isLoading, isError, error, refetch } = useQuery({
            queryKey: ['userSupply', form],
            queryFn: () => getSupplyByRange(form),
            enabled: false,
      });
      console.log("data", data);


      const updateMutant = useMutation({
            mutationFn: updateSupply,
            onSuccess: (data) => {
                  console.log('Updated:', data),
                  refetch();
            },
            onError: (err) => console.log('Error:', err),
      });

      const deleteMutant = useMutation({
            mutationFn: deleteSupply,
            onSuccess: (data) => {
                  console.log('Deleted:', data);
                  refetch();
            },
            onError: (err) => console.log('Error:', err),
      });

      const handleChange = (key: keyof Supply, value: string) => {
            setForm((prev) => ({ ...prev, [key]: value }));
      };

      return (
            <ScrollView contentContainerStyle={styles.container}>
                  <Text style={styles.title}>Billing Dashboard</Text>

                  {/* --- FORM SECTION --- */}
                  <View style={styles.form}>
                        <TextInput
                              style={styles.input}
                              placeholder="Seller ID"
                              value={form.sellerId}
                              onChangeText={(text) => handleChange('sellerId', text)}
                        />

                        <TouchableOpacity
                              style={styles.input}
                              onPress={() => setShowFromPicker(true)}
                        >
                              <Text>
                                    {form.from ? form.from : "Select From Date"}
                              </Text>
                        </TouchableOpacity>
                        {showFromPicker && (
                              <DateTimePicker
                                    value={form.from ? new Date(form.from) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                          setShowFromPicker(false);
                                          if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split("T")[0];
                                                handleChange("from", formatted);
                                          }
                                    }}
                              />
                        )}

                        <TouchableOpacity
                              style={styles.input}
                              onPress={() => setShowToPicker(true)}
                        >
                              <Text>
                                    {form.to ? form.to : "Select To Date"}
                              </Text>
                        </TouchableOpacity>
                        {showToPicker && (
                              <DateTimePicker
                                    value={form.to ? new Date(form.to) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                          setShowToPicker(false);
                                          if (selectedDate) {
                                                const formatted = selectedDate.toISOString().split("T")[0];
                                                handleChange("to", formatted);
                                          }
                                    }}
                              />
                        )}
                  </View>

                  <Button title="Fetch Supply" onPress={() => refetch()} />

                  {/* --- LOADING / ERROR STATES --- */}
                  {isLoading && (
                        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
                  )}

                  {isError && (
                        <Text style={styles.errorText}>Error: {(error as Error).message}</Text>
                  )}

                  {/* --- DATA SECTION --- */}
                  {data && Array.isArray(data.supplies) && data.supplies.length > 0 && (
                        <View style={styles.results}>
                              {/* Update all supplies */}
                              <Button
                                    title="Update All Supplies"
                                    color="#007bff"
                                    onPress={() => updateMutant.mutate(form)}
                              />

                              <Text
                                    style={{
                                          fontWeight: 'bold',
                                          fontSize: 16,
                                          marginVertical: 10,
                                          textAlign: 'center',
                                    }}
                              >
                                    Total Amount: ₹{data.totalAmount}
                              </Text>

                              {data.supplies.map((item: any) => (
                                    <View key={item._id} style={styles.card}>
                                          <View style={{ flex: 1 }}>
                                                <Text style={styles.itemTitle}>Seller ID: {item.sellerId}</Text>
                                                <Text style={styles.itemText}>Qty: {item.quantity}</Text>
                                                <Text style={styles.itemText}>Fat: {item.fat}</Text>
                                                <Text style={styles.itemText}>Rate: {item.rate}</Text>
                                                <Text style={styles.itemText}>Amount: {item.amount}</Text>
                                                <Text style={styles.itemText}>Status: {item.status}</Text>
                                                <Text style={styles.itemText}>
                                                      Created: {new Date(item.createAt).toLocaleString()}
                                                </Text>
                                          </View>

                                          <TouchableOpacity
                                                onPress={() => deleteMutant.mutate(item._id)}
                                                style={styles.deleteButton}
                                          >
                                                <Text style={styles.deleteButtonText}>Delete</Text>
                                          </TouchableOpacity>
                                    </View>
                              ))}
                        </View>
                  )}



                  {data && Array.isArray(data.supplies) && data.supplies.length === 0 && (
                        <Text style={styles.noData}>No supply records found</Text>
                  )}

            </ScrollView>
      );
};

export default Billing;

// --- STYLES ---
const styles = StyleSheet.create({
      container: {
            flexGrow: 1,
            padding: 20,
            backgroundColor: '#f8f9fa',
            marginTop:20
      },
      title: {
            fontSize: 22,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 20,
            color: '#333',
      },
      form: {
            marginBottom: 15,
      },
      input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            marginVertical: 8,
            backgroundColor: '#fff',
      },
      results: {
            marginTop: 25,
      },
      card: {
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 12,
            marginVertical: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
            elevation: 2,
      },
      itemTitle: {
            fontWeight: '600',
            fontSize: 16,
            color: '#333',
      },
      itemText: {
            color: '#555',
            fontSize: 13,
      },
      deleteButton: {
            backgroundColor: '#dc3545',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
      },
      deleteButtonText: {
            color: '#fff',
            fontWeight: '600',
      },
      noData: {
            textAlign: 'center',
            marginTop: 20,
            color: '#888',
      },
      errorText: {
            color: '#dc3545',
            textAlign: 'center',
            marginTop: 10,
      },
});
