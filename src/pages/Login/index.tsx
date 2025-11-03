import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../config.js/Api';
import { LOGIN } from '../../config.js/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const postLogin = async (payload: { PhoneNumber: number; password: string }) => {
      const res = await axios.post(`${API_BASE_URL}${LOGIN}`, payload);
      return res.data;
};

const Login = () => {
      const [phone, setPhone] = useState('');
      const [password, setPassword] = useState('');

      const mutation = useMutation({
            mutationFn: postLogin,
            onSuccess: async (data) => {
                  console.log('Login success:', data);
                  try {
                        await AsyncStorage.setItem('token', data.token);
                  } catch (e) {
                        console.error('Failed to save token:', e);
                  }
            },
            onError: err => console.error('Login failed:', err.message),
      });

      const handleLogin = () => {
            if (!phone || !password) {
                  console.warn('Both fields are required.');
                  return;
            }

            mutation.mutate({ PhoneNumber: Number(phone), password });
            setPassword("");
            setPhone("");
      };

      return (
            <View style={styles.container}>
                  <Text style={styles.heading}>Login</Text>

                  <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                  />

                  <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                  />

                  <Button title="Login" onPress={handleLogin} />

                  {mutation.isPending && <Text style={styles.status}>Logging in...</Text>}
                  {mutation.isError && (
                        <Text style={styles.error}>
                              {'Login failed'}
                        </Text>
                  )}
                  {mutation.isSuccess && <Text style={styles.success}>Login successful!</Text>}
            </View>
      );
};

export default Login;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            backgroundColor: '#fff',
      },
      heading: {
            fontSize: 24,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 20,
      },
      input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 16,
      },
      status: {
            marginTop: 10,
            textAlign: 'center',
      },
      error: {
            marginTop: 10,
            color: 'red',
            textAlign: 'center',
      },
      success: {
            marginTop: 10,
            color: 'green',
            textAlign: 'center',
      },
});


