import React from 'react';
import {
      View,
      StyleSheet,
      ScrollView,
      KeyboardAvoidingView,
      Platform,
} from 'react-native';
import Rate from '../Rate/Rate';
import RegisterForm from '../RegisterForm';

const Forms = () => {
      return (
            <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                  <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                  >
                        <View style={styles.rateSection}>
                              <Rate />
                        </View>
                        <View style={styles.formSection}>
                              <RegisterForm />
                        </View>
                  </ScrollView>
            </KeyboardAvoidingView>
      );
};

const styles = StyleSheet.create({
      scrollContainer: {
            flexGrow: 1,
      },
      rateSection: {
            flex: 1,
      },
      formSection: {
            flex: 1,
      },
});

export default Forms;
