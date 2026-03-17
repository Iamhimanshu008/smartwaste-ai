import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import Constants from 'expo-constants';

export default function RecyclersScreen() {
    const [recyclers, setRecyclers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecyclers = async () => {
            try {
                const response = await api.get('/recyclers');
                setRecyclers(response.data);
            } catch (err) {
                console.error('Failed to load recyclers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecyclers();
    }, []);

    const handleCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleDirections = (lat, lng, name) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.contactPerson}>{item.contact_person}</Text>
                </View>
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>₹{item.price_per_kg}/kg</Text>
                </View>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{item.address}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="leaf-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Accepts: <Text style={{textTransform: 'capitalize'}}>{item.accepted_types.join(', ')}</Text></Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="scale-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Min Qty: {item.min_quantity_kg}kg</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.callBtn]} 
                    onPress={() => handleCall(item.phone)}
                >
                    <Ionicons name="call" size={18} color="#059669" />
                    <Text style={styles.callBtnText}>Call Now</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.actionBtn, styles.dirBtn]} 
                    onPress={() => handleDirections(item.latitude, item.longitude, item.name)}
                >
                    <Ionicons name="navigate" size={18} color="#FFF" />
                    <Text style={styles.dirBtnText}>Directions</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Find Recyclers</Text>
                <Text style={styles.subtitle}>Sell your collected plastic waste to verified partners.</Text>
            </View>

            <FlatList
                data={recyclers}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No registered recyclers found nearby.</Text>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: Constants.statusBarHeight,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    contactPerson: {
        fontSize: 14,
        color: '#6B7280',
    },
    priceTag: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        color: '#059669',
        fontWeight: '700',
        fontSize: 14,
    },
    detailsContainer: {
        marginBottom: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    callBtn: {
        backgroundColor: '#ECFDF5',
    },
    callBtnText: {
        color: '#059669',
        fontWeight: '600',
        fontSize: 14,
    },
    dirBtn: {
        backgroundColor: '#059669',
    },
    dirBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
        fontSize: 16,
    }
});
