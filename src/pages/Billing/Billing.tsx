import { StyleSheet, Text, View } from "react-native";

const Billing = () => {

      return (
            <View style={styles.container}>
                  <Text>Billing</Text>
            </View>
      );
};

export default Billing;

const styles = StyleSheet.create({
      container: {
            flex: 1,
             justifyContent:'center',
            alignItems:"center"
      },
});
