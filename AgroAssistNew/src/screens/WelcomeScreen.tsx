import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

interface SlideItem {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const { width, height } = Dimensions.get('window');

const slides: SlideItem[] = [
  {
    id: '1',
    emoji: '🌤️',
    icon: '☀️',
    title: 'Revisa las condiciones\nmeteorológicas de tu zona',
    description: 'Obtén pronósticos precisos y recomendaciones para tus cultivos',
    color: '#E3F2FD',
  },
  {
    id: '2',
    emoji: '🐛',
    icon: '🌿',
    title: 'Identifica y controla\nlas plagas que pueden\nafectar tus cultivos',
    description: 'Reconocimiento inteligente y soluciones efectivas',
    color: '#E8F5E9',
  },
];

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const renderSlide = ({ item }: { item: SlideItem }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.card, { backgroundColor: item.color }]}>
        <View style={styles.iconRow}>
          <Text style={styles.iconLeft}>{item.icon}</Text>
          <Text style={styles.iconRight}>☁️</Text>
          <Text style={styles.iconBottom}>💧</Text>
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.viewButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />

      {renderDots()}

      <View style={styles.footer}>
        <Text style={styles.brandName}>Agroassist IA</Text>
        
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Comenzar</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  card: {
    width: width - 80,
    height: 240,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    position: 'relative',
    width: '100%',
  },
  iconLeft: {
    fontSize: 50,
    marginRight: 10,
  },
  iconRight: {
    fontSize: 35,
    position: 'absolute',
    right: 40,
    top: -10,
  },
  iconBottom: {
    fontSize: 25,
    position: 'absolute',
    left: 50,
    bottom: -30,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  viewButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 35,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginTop: 10,
  },
  viewButtonText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#2C3E50',
    width: 24,
  },
  dotInactive: {
    backgroundColor: '#BDC3C7',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  brandName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  getStartedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  loginLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default WelcomeScreen;
