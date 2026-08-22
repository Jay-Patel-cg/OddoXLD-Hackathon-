const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('../models/Destination');
const connectDB = require('../config/db');

dotenv.config();

const SEED_DESTINATIONS = [
  {
    name: 'Sydney',
    country: 'Australia',
    state: 'New South Wales',
    region: 'Oceania',
    description: 'Iconic coastal metropolis celebrated for the Sydney Opera House, Harbour Bridge, golden Bondi surfing beaches, and vibrant harbor dining.',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', // Sydney Opera House
      'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=1200&q=80', // Sydney Harbour Bridge
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1200&q=80', // Sydney Harbour Skyline
      'https://images.unsplash.com/photo-1588001400947-6385aef4ab0e?auto=format&fit=crop&w=1200&q=80', // The Rocks Historic Quarter
      'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80'  // Royal Botanic Garden
    ],
    places: [
      { name: 'Sydney Opera House & Circular Quay', category: 'Landmark', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', description: 'World-famous performing arts centre on Sydney Harbour.' },
      { name: 'Sydney Harbour Bridge Climb', category: 'Adventure', image: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?auto=format&fit=crop&w=800&q=80', description: 'Iconic arch bridge connecting central Sydney to North Shore.' },
      { name: 'Bondi Beach & Coastal Walk', category: 'Beach & Surf', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80', description: 'Famous ocean coastline walk connecting Bondi to Coogee.' },
      { name: 'The Rocks Historic Quarter', category: 'Heritage', image: 'https://images.unsplash.com/photo-1588001400947-6385aef4ab0e?auto=format&fit=crop&w=800&q=80', description: 'Cobblestone lanes, artisanal markets, and historic pubs.' }
    ],
    costIndex: 4,
    popularity: 94,
    latitude: -33.8688,
    longitude: 151.2093,
    popularCategories: ['sightseeing', 'beach', 'nature', 'food'],
    bestTimeToVisit: 'September to November & March to May'
  },
  {
    name: 'Paris',
    country: 'France',
    state: 'Île-de-France',
    region: 'Europe',
    description: 'Global center for art, fashion, gastronomy, and romance featuring the Eiffel Tower, Louvre, and charming Parisian cafes.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', // Eiffel Tower
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80', // Louvre
      'https://images.unsplash.com/photo-1520939817895-060bdef4dc1a?auto=format&fit=crop&w=1200&q=80', // Montmartre
      'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80', // Notre Dame
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80'  // Seine River
    ],
    places: [
      { name: 'Eiffel Tower & Champ de Mars', category: 'Landmark', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', description: 'Iconic iron lattice tower with sparkling night views.' },
      { name: 'Louvre Museum', category: 'Art & History', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80', description: 'World\'s largest art museum holding Mona Lisa and Venus de Milo.' },
      { name: 'Montmartre & Sacré-Cœur', category: 'Bohemian Vibe', image: 'https://images.unsplash.com/photo-1520939817895-060bdef4dc1a?auto=format&fit=crop&w=800&q=80', description: 'Hilltop artist village overlooking the rooftops of Paris.' }
    ],
    costIndex: 4,
    popularity: 99,
    latitude: 48.8566,
    longitude: 2.3522,
    popularCategories: ['culture', 'heritage', 'food', 'sightseeing'],
    bestTimeToVisit: 'June to August & September to October'
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    state: 'Dubai',
    region: 'Middle East',
    description: 'Futuristic desert metropolis known for luxury shopping, ultra-modern skyscrapers, Burj Khalifa, and artificial islands.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', // Burj Khalifa
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80', // Dubai Marina
      'https://images.unsplash.com/photo-1546412414-8035e1776c9a?auto=format&fit=crop&w=1200&q=80', // Palm Jumeirah
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'  // Desert Safari
    ],
    places: [
      { name: 'Burj Khalifa Observation Deck', category: 'Landmark', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', description: 'The world\'s tallest building with 360-degree city views.' },
      { name: 'Dubai Marina & JBR Walk', category: 'Lifestyle', image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80', description: 'Waterfront promenade surrounded by soaring residential towers.' },
      { name: 'Palm Jumeirah Resort District', category: 'Luxury', image: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?auto=format&fit=crop&w=800&q=80', description: 'Tree-shaped artificial archipelago featuring beach resorts.' }
    ],
    costIndex: 5,
    popularity: 98,
    latitude: 25.2048,
    longitude: 55.2708,
    popularCategories: ['shopping', 'entertainment', 'adventure', 'sightseeing'],
    bestTimeToVisit: 'November to March'
  },
  {
    name: 'New York',
    country: 'United States',
    state: 'New York',
    region: 'North America',
    description: 'The city that never sleeps, boasting Broadway, Central Park, Times Square, Statue of Liberty, and an iconic skyline.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', // Times Square
      'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80', // Statue of Liberty
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80', // Central Park
      'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80'  // Brooklyn Bridge
    ],
    places: [
      { name: 'Times Square & Theater District', category: 'Entertainment', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', description: 'Bustling intersection lined with giant billboards and Broadway theaters.' },
      { name: 'Central Park Walk & Bethesda Terrace', category: 'Nature & Park', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80', description: '843-acre urban oasis in the center of Manhattan.' },
      { name: 'Statue of Liberty & Ellis Island', category: 'History', image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80', description: 'National monument symbol of freedom in New York Harbor.' }
    ],
    costIndex: 5,
    popularity: 98,
    latitude: 40.7128,
    longitude: -74.006,
    popularCategories: ['entertainment', 'shopping', 'food', 'sightseeing'],
    bestTimeToVisit: 'April to June & September to November'
  },
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    region: 'South Asia',
    description: 'Tropical coastal haven famous for golden sands, Portuguese colonial heritage, fresh seafood, and lively beach shacks.',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', // Baga Beach
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80', // Fontainhas
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', // Dudhsagar
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'  // Chapora Fort
    ],
    places: [
      { name: 'Baga & Anjuna Coast', category: 'Beach & Sunset', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', description: 'Famous golden sands, beach shacks, and watersports.' },
      { name: 'Fontainhas Latin Quarter', category: 'Heritage & Art', image: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80', description: 'Colorful Portuguese colonial houses, narrow alleys, and cafes.' },
      { name: 'Dudhsagar Waterfalls', category: 'Nature & Adventure', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80', description: 'Four-tiered waterfall on the Mandovi River amidst lush forests.' }
    ],
    costIndex: 3,
    popularity: 95,
    latitude: 15.2993,
    longitude: 74.124,
    popularCategories: ['relaxation', 'adventure', 'food', 'entertainment'],
    bestTimeToVisit: 'November to February'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    state: 'Tokyo',
    region: 'East Asia',
    description: 'Dynamic metropolis blending futuristic neon skyscrapers with ancient Shinto shrines, anime, and Michelin dining.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80', // Shibuya
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80', // Sensoji
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', // Tokyo Skytree
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'  // Mount Fuji & Pagoda
    ],
    places: [
      { name: 'Shibuya Scramble Crossing', category: 'Urban Vibe', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', description: 'World\'s busiest pedestrian crossing illuminated by neon billboards.' },
      { name: 'Sensō-ji Temple in Asakusa', category: 'Heritage', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80', description: 'Tokyo\'s oldest Buddhist temple founded in 645 AD.' },
      { name: 'Tokyo Skytree Vistas', category: 'Landmark', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', description: 'Tallest structure in Japan featuring panoramic observation decks.' }
    ],
    costIndex: 4,
    popularity: 97,
    latitude: 35.6762,
    longitude: 139.6503,
    popularCategories: ['culture', 'food', 'entertainment', 'shopping'],
    bestTimeToVisit: 'March to May & September to November'
  }
];

async function seedDestinations() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding destination gallery data...\n');

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
    console.log(`  Updated: ${updatedCount} existing destinations with gallery & places`);
    console.log(`  Total active in database: ${await Destination.countDocuments({ isActive: true })}`);
    console.log(`====================================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seedDestinations();
