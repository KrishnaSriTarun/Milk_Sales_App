import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, ListRenderItem, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config.js/Api';
import { GET_USER } from '../../config.js/routes';
import { useDispatch, useSelector } from 'react-redux';
import { setSellerData } from '../../redux/user';
import { RootState } from '../../store';

type UserDetails = {
      _id: string;
      sellerId: number;
      name: string;
      PhoneNumber: number;
      role: 'ROLE_ADMIN' | 'ROLE_SELLER';
}

interface UsersResponse {
      sellerData: UserDetails[];
      sellerIds: number[];
}

const getUsers = async (): Promise<UsersResponse> => {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.get(`${API_BASE_URL}${GET_USER}`, {
            headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
};

const Users = () => {
      const dispatch = useDispatch()

      const sellersData = useSelector((state: RootState) => state.sellers.sellerData)

      const { data, isLoading, error } = useQuery<UsersResponse>({
            queryKey: ['users'],
            queryFn: getUsers,
      });
      
      useEffect(() => {
            if (data) {
                  dispatch(setSellerData(data))
            }
      })

      if (isLoading) {
            return (
                  <View style={styles.center}>
                        <ActivityIndicator size="large" />
                        <Text>Loading users...</Text>
                  </View>
            );
      }

      if (error) {
            return (
                  <View style={styles.center}>
                        <Text style={styles.errorText}>Failed to load users</Text>
                  </View>
            );
      }

      const renderUser: ListRenderItem<UserDetails> = ({ item }) => (
            <View style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.text}>ID: {item.sellerId}</Text>
                  <Text onPress={() => Linking.openURL(`tel:${item.PhoneNumber}`)}>
                        Call: <Text style={[styles.text, { color: '#2563eb', textDecorationLine: 'none' }]}>{item.PhoneNumber}</Text>
                  </Text>

                  <Text style={[styles.role, item.role === 'ROLE_ADMIN' ? styles.admin : styles.seller]}>
                        {item.role.replace('ROLE_', '')}
                  </Text>
            </View>
      );

      return (
            <View style={styles.container}>
                  <Text style={styles.header}>User List</Text>
                  <FlatList
                        data={data?.sellerData ?? []}
                        keyExtractor={(item) => item._id}
                        renderItem={renderUser}
                        contentContainerStyle={styles.list}
                  />
            </View>
      );
};

export default Users;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#f9fafb',
            paddingTop: 20,
      },
      center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
      },
      list: {
            padding: 16,
      },
      header: {
            fontSize: 24,
            fontWeight: '600',
            textAlign: 'center',
            marginVertical: 12,
            color: '#222',
      },
      card: {
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
      },
      name: {
            fontSize: 18,
            fontWeight: '600',
            color: '#111',
            marginBottom: 4,
      },
      text: {
            fontSize: 14,
            color: '#555',
      },
      role: {
            marginTop: 8,
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'bold',
            textTransform: 'capitalize',
      },
      admin: {
            backgroundColor: '#ffe4e6',
            color: '#b91c1c',
      },
      seller: {
            backgroundColor: '#dcfce7',
            color: '#166534',
      },
      errorText: {
            color: 'red',
            fontSize: 16,
      },
});
