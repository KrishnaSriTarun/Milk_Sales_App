import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config.js/Api';
import { REGISTER_USER } from '../../config.js/routes';
import { Picker } from '@react-native-picker/picker';

type RegisterPayload = {
      sellerId: string;
      name: string;
      phoneNumber: string;
      role: string;
      password: string;
};

const registerUser = async (payload: RegisterPayload) => {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const correctedPayload = {
            sellerId: payload.sellerId,
            name: payload.name,
            PhoneNumber: payload.phoneNumber,
            role: payload.role,
            password: payload.password,
      };

      const res = await axios.post(`${API_BASE_URL}${REGISTER_USER}`, correctedPayload, {
            headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
            },
      });

      return res.data;
};

const RegisterForm = () => {
      const [form, setForm] = useState<RegisterPayload>({
            sellerId: '',
            name: '',
            phoneNumber: '',
            role: '',
            password: '',
      });

      const mutation = useMutation({
            mutationFn: registerUser,
            onSuccess: () => Alert.alert('Success', 'Registered successfully!'),
            onError: (err: any) => {
                  console.log(err);
                  Alert.alert('Error', err.message || 'Failed to register');
            },
      });

      const handleChange = (key: keyof RegisterPayload, value: string) => {
            setForm(prev => ({ ...prev, [key]: value }));
      };

      const handleSubmit = () => {
            if (!form.name || !form.password) {
                  Alert.alert('Validation Error', 'Name and password are required.');
                  return;
            }
            mutation.mutate(form);
      };

      return (
            <View style={styles.container}>
                  <Text style={styles.title}>Register User</Text>

                  <TextInput
                        style={styles.input}
                        placeholder="Seller ID"
                        onChangeText={v => handleChange('sellerId', v)}
                        value={form.sellerId}
                  />
                  <TextInput
                        style={styles.input}
                        placeholder="Name"
                        onChangeText={v => handleChange('name', v)}
                        value={form.name}
                  />
                  <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={v => handleChange('phoneNumber', v.replace(/[^0-9]/g, '').slice(0, 10))}
                        value={form.phoneNumber}
                  />

                  <View style={styles.pickerContainer}>
                        <Picker
                              selectedValue={form.role}
                              onValueChange={(v: string) => handleChange('role', v)}
                        >
                              <Picker.Item label="Select Role" value="" />
                              <Picker.Item label="Admin" value="ROLE_ADMIN" />
                              <Picker.Item label="Seller" value="ROLE_SELLER" />
                        </Picker>
                  </View>

                  <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        onChangeText={v => handleChange('password', v)}
                        value={form.password}
                  />

                  <Button title="Register" onPress={handleSubmit} />
            </View>
      );
};

export default RegisterForm;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            padding: 20,
            justifyContent: 'center',
            backgroundColor: '#fff',
      },
      title: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
      },
      input: {
            borderWidth: 1,
            borderColor: '#aaa',
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
      },
      pickerContainer: {
            borderWidth: 1,
            borderColor: '#aaa',
            borderRadius: 8,
            marginBottom: 12,
      },
});
