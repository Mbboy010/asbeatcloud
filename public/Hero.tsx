import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated, 
  FlatList 
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Hero = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Carousel images
  const carouselImages = [
    { id: '1', uri: require("../../assets/images/herro/1.jpeg") },
    { id: '2', uri: require("../../assets/images/herro/2.jpeg")  },
    { id: '3', uri: require("../../assets/images/herro/3.jpeg")  },
    { id: '4', uri: require("../../assets/images/herro/4.jpeg")  },
    { id: '5', uri: require("../../assets/images/herro/5.jpeg")  },
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselImages.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderCarouselItem = ({ item }: { item: { id: string; uri: string } }) => (
    <View style={{ width, height: 220 }}>
      <Image source={item.uri} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <Text style={styles.heroText}>Transform Your Images Like a Pro</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Photo Editing Guides</Text>
        <Text style={styles.subtitle}>Master your favorite apps</Text>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={carouselImages}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
        />
        <View style={styles.pagination}>
          {carouselImages.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Rest of your content... */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  carouselContainer: {
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    
  },
  heroText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 12,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  // ... other styles
});

export default Hero;