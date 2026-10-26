import { useMemo, useState } from 'react';
import {
  Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';

type Condition = 'Excellent' | 'Good' | 'Fair' | 'Needs repair';
type Bike = {
  id: string; brand: string; model: string; cc: string; quantity: number;
  price: number; condition: Condition; year: string; km: string;
};

const initialBikes: Bike[] = [
  { id: 'demo-1', brand: 'Hero', model: 'Splendor Plus', cc: '100', quantity: 2, price: 45000, condition: 'Good', year: '2022', km: '24000' },
  { id: 'demo-2', brand: 'Honda', model: 'Shine', cc: '125', quantity: 1, price: 52000, condition: 'Excellent', year: '2023', km: '12000' },
  { id: 'demo-3', brand: 'Bajaj', model: 'Pulsar 150', cc: '150', quantity: 3, price: 61000, condition: 'Fair', year: '2021', km: '31000' },
];
const conditions: Condition[] = ['Excellent', 'Good', 'Fair', 'Needs repair'];
const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function HomeScreen() {
  const [bikes, setBikes] = useState<Bike[]>(initialBikes);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [cc, setCc] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [year, setYear] = useState('');
  const [km, setKm] = useState('');

  const filtered = useMemo(() => bikes.filter(b => `${b.brand} ${b.model} ${b.cc}`.toLowerCase().includes(search.toLowerCase())), [bikes, search]);
  const totalUnits = bikes.reduce((sum, b) => sum + b.quantity, 0);
  const stockValue = bikes.reduce((sum, b) => sum + b.quantity * b.price, 0);

  const saveBike = async () => {
    if (!brand.trim() || !model.trim() || !cc.trim() || !price.trim()) {
      Alert.alert('Missing details', 'Please enter brand, model, engine CC and selling price.'); return;
    }
    const newBike: Bike = {
      id: `local-${Date.now()}`, brand: brand.trim(), model: model.trim(), cc: cc.trim(),
      quantity: Math.max(1, Number.parseInt(quantity, 10) || 1), price: Number(price), condition,
      year: year.trim(), km: km.trim(),
    };
    // The local demo is usable before the client creates a Supabase project.
    // Individual-bike database persistence is connected in the next integration step.
    if (isSupabaseConfigured && supabase) {
      Alert.alert('Supabase configured', 'The connection is configured. Apply the SQL migration and enable authentication/RLS before saving live inventory.');
    }
    setBikes(current => [newBike, ...current]);
    setModalVisible(false);
    setBrand(''); setModel(''); setCc(''); setQuantity('1'); setPrice(''); setCondition('Good'); setYear(''); setKm('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>AUTOCARE MANAGER</Text>
            <Text style={styles.heading}>Inventory</Text>
            <Text style={styles.subheading}>Workshop & pre-owned bikes</Text>
          </View>
          <View style={styles.avatar}><Ionicons name="speedometer-outline" size={25} color="#FFFFFF" /></View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#758094" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search brand or bike model" placeholderTextColor="#8C95A5" style={styles.searchInput} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={19} color="#758094" /></TouchableOpacity>}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><View style={styles.statIcon}><Ionicons name="bicycle-outline" size={18} color="#146C5A" /></View><Text style={styles.statLabel}>Available bikes</Text><Text style={styles.statValue}>{totalUnits}</Text></View>
          <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#FFF1DE' }]}><Ionicons name="pricetag-outline" size={18} color="#A95C00" /></View><Text style={styles.statLabel}>Stock asking value</Text><Text style={styles.statValue}>{money(stockValue)}</Text></View>
        </View>

        <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Bike stock</Text><Text style={styles.sectionSub}>{filtered.length} model entries · demo data</Text></View><TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}><Ionicons name="add" size={19} color="#FFFFFF" /><Text style={styles.addButtonText}>Add bike</Text></TouchableOpacity></View>

        {filtered.length === 0 ? <View style={styles.empty}><Ionicons name="search-outline" size={30} color="#98A2B3"/><Text style={styles.emptyTitle}>No bikes found</Text><Text style={styles.emptyText}>Try another search or add a bike to inventory.</Text></View> : filtered.map(bike => (
          <View key={bike.id} style={styles.bikeCard}>
            <View style={styles.bikeImage}><Ionicons name="bicycle" size={35} color="#6B778C" /><Text style={styles.imageHint}>PHOTO</Text></View>
            <View style={styles.bikeInfo}>
              <View style={styles.bikeTitleRow}><Text style={styles.brand}>{bike.brand}</Text><View style={[styles.conditionPill, bike.condition === 'Excellent' ? styles.greenPill : bike.condition === 'Needs repair' ? styles.redPill : styles.amberPill]}><Text style={styles.conditionText}>{bike.condition}</Text></View></View>
              <Text style={styles.model}>{bike.model}</Text>
              <Text style={styles.specs}>{bike.cc} CC{bike.year ? `  ·  ${bike.year}` : ''}{bike.km ? `  ·  ${Number(bike.km).toLocaleString('en-IN')} km` : ''}</Text>
              <View style={styles.bikeBottom}><View><Text style={styles.price}>{money(bike.price)}</Text><Text style={styles.quantity}>{bike.quantity} available</Text></View><TouchableOpacity onPress={() => Alert.alert(bike.model, `Brand: ${bike.brand}\nEngine: ${bike.cc} CC\nCondition: ${bike.condition}\nAvailable quantity: ${bike.quantity}\nSelling price: ${money(bike.price)}`)} style={styles.detailsButton}><Text style={styles.detailsText}>Details</Text><Ionicons name="chevron-forward" size={15} color="#146C5A" /></TouchableOpacity></View>
            </View>
          </View>
        ))}
        <View style={styles.notice}><Ionicons name="information-circle-outline" size={18} color="#667085"/><Text style={styles.noticeText}>Starter preview: sample bikes are local demo data. Connect Supabase to persist real shop inventory.</Text></View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}><View style={styles.modalSheet}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Add a bike</Text><Text style={styles.modalSubtitle}>Enter the inventory details</Text></View><TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}><Ionicons name="close" size={22} color="#344054" /></TouchableOpacity></View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Brand *</Text><TextInput value={brand} onChangeText={setBrand} placeholder="e.g. Hero" style={styles.input} />
            <Text style={styles.fieldLabel}>Bike name / model *</Text><TextInput value={model} onChangeText={setModel} placeholder="e.g. Splendor Plus" style={styles.input} />
            <View style={styles.twoCol}><View style={styles.fieldCol}><Text style={styles.fieldLabel}>Engine capacity (CC) *</Text><TextInput value={cc} onChangeText={setCc} placeholder="125" keyboardType="numeric" style={styles.input} /></View><View style={styles.fieldCol}><Text style={styles.fieldLabel}>Quantity *</Text><TextInput value={quantity} onChangeText={setQuantity} placeholder="1" keyboardType="number-pad" style={styles.input} /></View></View>
            <View style={styles.twoCol}><View style={styles.fieldCol}><Text style={styles.fieldLabel}>Selling price (₹) *</Text><TextInput value={price} onChangeText={setPrice} placeholder="45000" keyboardType="numeric" style={styles.input} /></View><View style={styles.fieldCol}><Text style={styles.fieldLabel}>Year</Text><TextInput value={year} onChangeText={setYear} placeholder="2022" keyboardType="number-pad" style={styles.input} /></View></View>
            <Text style={styles.fieldLabel}>Odometer (km)</Text><TextInput value={km} onChangeText={setKm} placeholder="e.g. 24000" keyboardType="numeric" style={styles.input} />
            <Text style={styles.fieldLabel}>Bike condition *</Text><View style={styles.conditionOptions}>{conditions.map(c => <TouchableOpacity key={c} onPress={() => setCondition(c)} style={[styles.conditionOption, condition === c && styles.conditionSelected]}><Text style={[styles.conditionOptionText, condition === c && styles.conditionSelectedText]}>{c}</Text></TouchableOpacity>)}</View>
            <TouchableOpacity style={styles.saveButton} onPress={saveBike}><Text style={styles.saveButtonText}>Add to inventory</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' }, page: { padding: 20, paddingBottom: 36 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: '#146C5A', marginBottom: 7 }, heading: { fontSize: 29, fontWeight: '800', color: '#17212F', letterSpacing: -0.7 }, subheading: { color: '#758094', fontSize: 13, marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#146C5A', alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 50, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E7EAF0', marginBottom: 16 }, searchInput: { flex: 1, color: '#17212F', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 27 }, statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 17, padding: 15, borderWidth: 1, borderColor: '#ECEEF2' }, statIcon: { width: 33, height: 33, borderRadius: 11, backgroundColor: '#E2F4EE', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, statLabel: { color: '#758094', fontSize: 11 }, statValue: { fontSize: 20, fontWeight: '800', color: '#17212F', marginTop: 5 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, sectionTitle: { color: '#17212F', fontSize: 19, fontWeight: '800' }, sectionSub: { color: '#8A93A3', fontSize: 11, marginTop: 4 }, addButton: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#146C5A', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 }, addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  bikeCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 12, borderWidth: 1, borderColor: '#ECEEF2', marginBottom: 12, gap: 12 }, bikeImage: { width: 86, minHeight: 118, borderRadius: 13, backgroundColor: '#EEF1F5', alignItems: 'center', justifyContent: 'center' }, imageHint: { fontSize: 8, color: '#8A93A3', fontWeight: '800', letterSpacing: 1, marginTop: 5 }, bikeInfo: { flex: 1, paddingVertical: 2 }, bikeTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 }, brand: { fontSize: 10, color: '#758094', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }, model: { fontSize: 16, fontWeight: '800', color: '#17212F', marginTop: 4 }, specs: { fontSize: 10, color: '#7D8798', marginTop: 6 }, conditionPill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7 }, greenPill: { backgroundColor: '#DDF6E9' }, amberPill: { backgroundColor: '#FFF0D6' }, redPill: { backgroundColor: '#FCE5E5' }, conditionText: { fontSize: 9, color: '#344054', fontWeight: '700' }, bikeBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 13 }, price: { color: '#146C5A', fontWeight: '800', fontSize: 17 }, quantity: { color: '#758094', fontSize: 10, marginTop: 3 }, detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 3 }, detailsText: { color: '#146C5A', fontSize: 11, fontWeight: '800' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8, padding: 12, backgroundColor: '#EEF1F5', borderRadius: 12 }, noticeText: { flex: 1, color: '#667085', fontSize: 11, lineHeight: 16 }, empty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, alignItems: 'center', gap: 8 }, emptyTitle: { color: '#17212F', fontWeight: '800', fontSize: 16 }, emptyText: { color: '#758094', fontSize: 12, textAlign: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(13,22,35,0.45)' }, modalSheet: { maxHeight: '92%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 28 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, modalTitle: { color: '#17212F', fontWeight: '800', fontSize: 23 }, modalSubtitle: { color: '#758094', fontSize: 12, marginTop: 4 }, closeButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F1F3F6', alignItems: 'center', justifyContent: 'center' }, fieldLabel: { color: '#344054', fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 10 }, input: { height: 46, borderRadius: 11, borderWidth: 1, borderColor: '#DDE2EA', paddingHorizontal: 12, color: '#17212F', fontSize: 14, marginBottom: 5, backgroundColor: '#FFFFFF' }, twoCol: { flexDirection: 'row', gap: 10 }, fieldCol: { flex: 1 }, conditionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, conditionOption: { borderWidth: 1, borderColor: '#DDE2EA', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10 }, conditionSelected: { borderColor: '#146C5A', backgroundColor: '#E2F4EE' }, conditionOptionText: { color: '#667085', fontSize: 11, fontWeight: '600' }, conditionSelectedText: { color: '#146C5A' }, saveButton: { height: 50, borderRadius: 13, backgroundColor: '#146C5A', alignItems: 'center', justifyContent: 'center', marginTop: 22, marginBottom: 12 }, saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
