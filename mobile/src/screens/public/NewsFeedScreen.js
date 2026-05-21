import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../config';
import { getNews } from '../../api/newsApi';

export default function NewsFeedScreen({ navigation }) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const staticFallback = [
      { id: 1, title: 'SmartWaste AI launch in Nava Raipur', 
        summary: 'SmartWaste AI has made waste collection 40% more efficient',
        icon: <MaterialCommunityIcons name="newspaper-variant-outline" size={40} color="#16a34a" />, tag: 'Success Story', 
        tag_color: '#16a34a', created_at: new Date().toISOString() },
    ];

    useEffect(() => {
      const fetchNews = async () => {
        try {
          const data = await getNews();
          setNews(data.length > 0 ? data : staticFallback);
        } catch (err) {
          setNews(staticFallback);
        } finally {
          setLoading(false);
        }
      };
      fetchNews();
    }, []);

    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    };

    if (loading) {
      return (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor: COLORS.bg }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.title}>Swachhta Samachar</Text>
            </View>

            <FlatList
                data={news}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.tagBadge, { backgroundColor: `${item.tag_color || '#16a34a'}20` }]}>
                                <Text style={[styles.tagText, { color: item.tag_color || '#16a34a' }]}>{item.tag}</Text>
                            </View>
                            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                        </View>
                        <View style={styles.cardBody}>
                            <View style={{ marginRight: 15, marginTop: 5 }}>
                                {item.icon || <MaterialCommunityIcons name="newspaper-variant-outline" size={40} color="#16a34a" />}
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.summary}>{item.summary}</Text>
                            </View>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { marginRight: 15, padding: 5 },
    backIcon: { fontSize: 24, color: COLORS.dark },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.dark },
    listContainer: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    tagBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    tagText: { color: '#0369a1', fontSize: 12, fontWeight: '700' },
    date: { color: '#888', fontSize: 12, fontWeight: '500' },
    cardBody: { flexDirection: 'row', alignItems: 'flex-start' },
    emoji: { fontSize: 40, marginRight: 15, marginTop: 5 },
    textContainer: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
    summary: { fontSize: 14, color: '#666', lineHeight: 20 },
});
