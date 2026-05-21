import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={48} color="#dc2626" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            {this.state.error?.message || 'Unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', 
               alignItems:'center', padding:24, backgroundColor:'#fff' },
  title: { fontSize:20, fontWeight:'bold', 
           color:'#dc2626', marginBottom:8 },
  subtitle: { fontSize:14, color:'#6b7280', 
              textAlign:'center', marginBottom:24 },
  button: { backgroundColor:'#16a34a', 
            paddingHorizontal:32, paddingVertical:14, borderRadius:10 },
  buttonText: { color:'#fff', fontWeight:'bold', fontSize:16 },
});

export default ErrorBoundary;
