const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('../models/Destination');
const connectDB = require('../config/db');

dotenv.config();

const SEED_DESTINATIONS = [
  {
    name: 'Ahmedabad',
    country: 'India',
    state: 'Gujarat',
    region: 'South Asia',
    description: 'India\'s first UNESCO World Heritage City, famous for heritage architecture, textile history, Sabarmati Ashram, and vibrant street food.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41',
    costIndex: 2,
    popularity: 82,
    latitude: 23.0225,
    longitude: 72.5714,
    popularCategories: ['culture', 'food', 'heritage', 'shopping'],
    bestTimeToVisit: 'October to March'
  },
  {
    name: 'Mumbai',
    country: 'India',
    state: 'Maharashtra',
    region: 'South Asia',
    description: 'The City of Dreams, featuring the iconic Gateway of India, bustling nightlife, Bollywood, Marine Drive, and colonial heritage.',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
    costIndex: 3,
    popularity: 90,
    latitude: 19.076,
    longitude: 72.8777,
    popularCategories: ['entertainment', 'food', 'shopping', 'sightseeing'],
    bestTimeToVisit: 'November to February'
  },
  {
    name: 'Delhi',
    country: 'India',
    state: 'Delhi',
    region: 'South Asia',
    description: 'The historic capital of India showcasing ancient monuments like Qutub Minar and Red Fort alongside vibrant bazaars and modern cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    costIndex: 2,
    popularity: 88,
    latitude: 28.6139,
    longitude: 77.209,
    popularCategories: ['heritage', 'culture', 'food', 'sightseeing'],
    bestTimeToVisit: 'October to March'
  },
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    region: 'South Asia',
    description: 'Tropical paradise renowned for sun-kissed golden beaches, Portuguese-influenced architecture, seafood, and vibrant nightlife.',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
    costIndex: 3,
    popularity: 95,
    latitude: 15.2993,
    longitude: 74.124,
    popularCategories: ['relaxation', 'adventure', 'food', 'entertainment'],
    bestTimeToVisit: 'November to February'
  },
  {
    name: 'Jaipur',
    country: 'India',
    state: 'Rajasthan',
    region: 'South Asia',
    description: 'The Pink City of India, celebrated for majestic royal palaces, Amer Fort, Hawa Mahal, and traditional Rajasthani crafts.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    costIndex: 2,
    popularity: 89,
    latitude: 26.9124,
    longitude: 75.7873,
    popularCategories: ['heritage', 'culture', 'shopping', 'sightseeing'],
    bestTimeToVisit: 'October to March'
  },
  {
    name: 'Udaipur',
    country: 'India',
    state: 'Rajasthan',
    region: 'South Asia',
    description: 'The City of Lakes, famous for romantic Lake Pichola, grand City Palace, hilltop forts, and breathtaking sunsets.',
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10',
    costIndex: 3,
    popularity: 86,
    latitude: 24.5854,
    longitude: 73.7125,
    popularCategories: ['relaxation', 'heritage', 'romance', 'sightseeing'],
    bestTimeToVisit: 'September to March'
  },
  {
    name: 'Manali',
    country: 'India',
    state: 'Himachal Pradesh',
    region: 'South Asia',
    description: 'High-altitude Himalayan resort town popular for snow adventures, Solang Valley sports, trekking, and pine valleys.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23',
    costIndex: 2,
    popularity: 87,
    latitude: 32.2432,
    longitude: 77.1892,
    popularCategories: ['adventure', 'nature', 'relaxation', 'sightseeing'],
    bestTimeToVisit: 'October to June'
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    state: 'Dubai',
    region: 'Middle East',
    description: 'Futuristic metropolis known for ultra-modern architecture like Burj Khalifa, luxury shopping malls, desert safaris, and beach resorts.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    costIndex: 5,
    popularity: 98,
    latitude: 25.2048,
    longitude: 55.2708,
    popularCategories: ['shopping', 'entertainment', 'adventure', 'sightseeing'],
    bestTimeToVisit: 'November to March'
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    state: '',
    region: 'Southeast Asia',
    description: 'Global financial hub featuring Gardens by the Bay, Marina Bay Sands, diverse culinary scenes, and lush green urban planning.',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    costIndex: 4,
    popularity: 94,
    latitude: 1.3521,
    longitude: 103.8198,
    popularCategories: ['food', 'shopping', 'sightseeing', 'entertainment'],
    bestTimeToVisit: 'November to January'
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    state: 'Bangkok',
    region: 'Southeast Asia',
    description: 'Vibrant capital famed for ornate shrines, bustling riverboats, famous night markets, and world-renowned street food.',
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
    costIndex: 2,
    popularity: 93,
    latitude: 13.7563,
    longitude: 100.5018,
    popularCategories: ['food', 'culture', 'shopping', 'entertainment'],
    bestTimeToVisit: 'November to February'
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    state: 'Bali',
    region: 'Southeast Asia',
    description: 'Idyllic tropical island celebrated for iconic terraced rice paddies, Hindu temples, surf beaches, and holistic wellness retreats.',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    costIndex: 2,
    popularity: 96,
    latitude: -8.4095,
    longitude: 115.1889,
    popularCategories: ['relaxation', 'nature', 'adventure', 'culture'],
    bestTimeToVisit: 'April to October'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    state: 'Tokyo',
    region: 'East Asia',
    description: 'Dynamic capital blending ultramodern skyscrapers with historic temples, anime culture, world-class gastronomy, and cherry blossoms.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    costIndex: 4,
    popularity: 97,
    latitude: 35.6762,
    longitude: 139.6503,
    popularCategories: ['culture', 'food', 'entertainment', 'shopping'],
    bestTimeToVisit: 'March to May & September to November'
  },
  {
    name: 'Paris',
    country: 'France',
    state: 'Île-de-France',
    region: 'Europe',
    description: 'Global center for art, fashion, gastronomy, and culture with landmarks including Eiffel Tower, Louvre, and Notre-Dame Cathedral.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    costIndex: 4,
    popularity: 99,
    latitude: 48.8566,
    longitude: 2.3522,
    popularCategories: ['culture', 'heritage', 'food', 'sightseeing'],
    bestTimeToVisit: 'June to August & September to October'
  },
  {
    name: 'London',
    country: 'United Kingdom',
    state: 'England',
    region: 'Europe',
    description: 'Historic city featuring Big Ben, Tower of London, British Museum, West End theaters, and rich multicultural neighborhoods.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    costIndex: 4,
    popularity: 96,
    latitude: 51.5074,
    longitude: -0.1278,
    popularCategories: ['heritage', 'culture', 'entertainment', 'sightseeing'],
    bestTimeToVisit: 'March to May & September to November'
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    state: 'North Holland',
    region: 'Europe',
    description: 'Charming canal city known for artistic heritage, Van Gogh Museum, cycling paths, narrow gable houses, and historic bridges.',
    imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4',
    costIndex: 4,
    popularity: 91,
    latitude: 52.3676,
    longitude: 4.9041,
    popularCategories: ['culture', 'sightseeing', 'relaxation', 'food'],
    bestTimeToVisit: 'April to May & September to November'
  },
  {
    name: 'Rome',
    country: 'Italy',
    state: 'Lazio',
    region: 'Europe',
    description: 'The Eternal City packed with almost 3,000 years of globally influential art, architecture, Colosseum, Vatican City, and pasta.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    costIndex: 3,
    popularity: 95,
    latitude: 41.9028,
    longitude: 12.4964,
    popularCategories: ['heritage', 'culture', 'food', 'sightseeing'],
    bestTimeToVisit: 'October to April'
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    state: 'Catalonia',
    region: 'Europe',
    description: 'Mediterranean city famous for Antoni Gaudí\'s Sagrada Família, Park Güell, sunny beaches, Gothic Quarter, and tapas bars.',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
    costIndex: 3,
    popularity: 92,
    latitude: 41.3851,
    longitude: 2.1734,
    popularCategories: ['culture', 'beach', 'food', 'sightseeing'],
    bestTimeToVisit: 'May to June & September to October'
  },
  {
    name: 'New York',
    country: 'United States',
    state: 'New York',
    region: 'North America',
    description: 'The Big Apple, featuring Times Square, Central Park, Statue of Liberty, Broadway shows, and iconic skyline skyscrapers.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    costIndex: 5,
    popularity: 98,
    latitude: 40.7128,
    longitude: -74.006,
    popularCategories: ['entertainment', 'shopping', 'food', 'sightseeing'],
    bestTimeToVisit: 'April to June & September to November'
  },
  {
    name: 'Toronto',
    country: 'Canada',
    state: 'Ontario',
    region: 'North America',
    description: 'Multicultural Canadian metropolis dominated by iconic CN Tower, Lake Ontario waterfront, Royal Ontario Museum, and diverse cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1517935703375-251c22ec208c',
    costIndex: 4,
    popularity: 85,
    latitude: 43.6532,
    longitude: -79.3832,
    popularCategories: ['culture', 'sightseeing', 'food', 'shopping'],
    bestTimeToVisit: 'May to September'
  },
  {
    name: 'Sydney',
    country: 'Australia',
    state: 'New South Wales',
    region: 'Oceania',
    description: 'Coastal harbour city famous for Sydney Opera House, Harbour Bridge, Bondi Beach surfing, and vibrant waterfront dining.',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    costIndex: 4,
    popularity: 93,
    latitude: -33.8688,
    longitude: 151.2093,
    popularCategories: ['sightseeing', 'beach', 'nature', 'food'],
    bestTimeToVisit: 'September to November & March to May'
  }
];

async function seedDestinations() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding destinations...\n');

    let createdCount = 0;
    let updatedCount = 0;

    for (const destData of SEED_DESTINATIONS) {
      const existing = await Destination.findOne({
        name: destData.name,
        country: destData.country
      });

      if (existing) {
        await Destination.updateOne({ _id: existing._id }, destData);
        updatedCount++;
      } else {
        await Destination.create(destData);
        createdCount++;
      }
    }

    console.log(`====================================================================`);
    console.log(`  DESTINATION SEEDING COMPLETE`);
    console.log(`  Created: ${createdCount} new destinations`);
    console.log(`  Updated: ${updatedCount} existing destinations`);
    console.log(`  Total active in database: ${await Destination.countDocuments({ isActive: true })}`);
    console.log(`====================================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seedDestinations();
