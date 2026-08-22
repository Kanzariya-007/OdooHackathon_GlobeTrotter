import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const citiesData = [
  {
    name: 'Ahmedabad',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    activities: [
      {
        name: 'Sabarmati Ashram Visit',
        description: "Peaceful historical visit to Mahatma Gandhi's home along the Sabarmati riverfront.",
        cost: new Prisma.Decimal(0.00),
        location: 'Gandhi Smarak Sangrahalaya, Ashram Road',
        duration: 120
      },
      {
        name: 'Adalaj Stepwell',
        description: 'Marvel at the stunning 5-story deep Solanki-style sandstone stepwell built in 1498.',
        cost: new Prisma.Decimal(50.00),
        location: 'Adalaj Road, Gandhinagar',
        duration: 90
      },
      {
        name: 'Kankaria Lake',
        description: 'Large circular lake with zoo, toy train, balloon safari, and speedboats.',
        cost: new Prisma.Decimal(20.00),
        location: 'Maninagar, Ahmedabad',
        duration: 150
      },
      {
        name: 'Sidi Saiyyed Mosque',
        description: 'Historic 16th-century mosque famous for its beautiful stone lattice windows (jalis).',
        cost: new Prisma.Decimal(0.00),
        location: 'Salapose Road, Lal Darwaja',
        duration: 45
      },
      {
        name: 'Manek Chowk Food Walk',
        description: 'Bustling evening food market famous for Gwalior Dosa, Jamun Shots, and Butter Sandwiches.',
        cost: new Prisma.Decimal(300.00),
        location: 'Manek Chowk, Old City',
        duration: 120
      }
    ]
  },
  {
    name: 'Mumbai',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    activities: [
      {
        name: 'Gateway of India',
        description: 'Iconic stone arch monument overlooking the Arabian Sea, built during the British Raj.',
        cost: new Prisma.Decimal(0.00),
        location: 'Apollo Bandar, Colaba',
        duration: 60
      },
      {
        name: 'Marine Drive',
        description: "Beautiful arc-shaped seafront promenade, also known as the Queen's Necklace.",
        cost: new Prisma.Decimal(0.00),
        location: 'Netaji Subhash Chandra Bose Road',
        duration: 90
      },
      {
        name: 'Elephanta Caves',
        description: 'Take a ferry to Elephanta Island and explore ancient rock-cut Shiva temple caves.',
        cost: new Prisma.Decimal(250.00),
        location: 'Elephanta Island, Mumbai Harbour',
        duration: 240
      },
      {
        name: 'Chhatrapati Shivaji Maharaj Terminus',
        description: 'Historic UNESCO World Heritage railway station showcasing Victorian Gothic Revival architecture.',
        cost: new Prisma.Decimal(0.00),
        location: 'Chhatrapati Shivaji Terminus Area, Fort',
        duration: 45
      },
      {
        name: 'Colaba Market',
        description: 'Lively shopping street filled with clothing, antiques, and local Indian handicrafts.',
        cost: new Prisma.Decimal(100.00),
        location: 'Colaba Causeway',
        duration: 120
      }
    ]
  },
  {
    name: 'Delhi',
    country: 'India',
    latitude: 28.7041,
    longitude: 77.1025,
    activities: [
      {
        name: 'Red Fort Guided Tour',
        description: 'Explore the grand 17th-century Mughal fort complex built in red sandstone.',
        cost: new Prisma.Decimal(80.00),
        location: 'Netaji Subhash Marg, Chandni Chowk',
        duration: 180
      },
      {
        name: 'Qutub Minar Historical Walk',
        description: 'Visit the 73-meter tall minaret and the surrounding complex of historic ruins.',
        cost: new Prisma.Decimal(40.00),
        location: 'Mehrauli, New Delhi',
        duration: 120
      },
      {
        name: 'India Gate & Kartavya Path',
        description: 'War memorial archway dedicated to soldiers, leading down the ceremonial boulevard.',
        cost: new Prisma.Decimal(0.00),
        location: 'Rajpath, Central Secretariat',
        duration: 60
      },
      {
        name: 'Lotus Temple',
        description: "Bahá'í House of Worship famous for its flowerlike shape and serene prayer halls.",
        cost: new Prisma.Decimal(0.00),
        location: 'Lotus Temple Road, Kalkaji',
        duration: 90
      },
      {
        name: "Humayun's Tomb",
        description: 'Spectacular garden tomb of the Mughal Emperor, inspiring the design of the Taj Mahal.',
        cost: new Prisma.Decimal(80.00),
        location: 'Mathura Road, Nizamuddin East',
        duration: 120
      },
      {
        name: 'Chandni Chowk Rickshaw Ride',
        description: 'Bustling market experience with rickshaws and stops at Paranthe Wali Gali.',
        cost: new Prisma.Decimal(150.00),
        location: 'Old Delhi, Chandni Chowk',
        duration: 120
      }
    ]
  },
  {
    name: 'Goa',
    country: 'India',
    latitude: 15.2993,
    longitude: 74.1240,
    activities: [
      {
        name: 'Baga Beach Water Sports',
        description: 'Experience thrilling water sports including parasailing, jet-skiing, and banana rides.',
        cost: new Prisma.Decimal(1500.00),
        location: 'Baga Beach, North Goa',
        duration: 150
      },
      {
        name: 'Basilica of Bom Jesus',
        description: 'Visit the historic Baroque church housing the sacred relics of St. Francis Xavier.',
        cost: new Prisma.Decimal(0.00),
        location: 'Old Goa Road, Bainguinim',
        duration: 60
      },
      {
        name: 'Dudhsagar Waterfalls Trek',
        description: 'Majestic four-tiered waterfall on the Mandovi River surrounded by rich forest reserves.',
        cost: new Prisma.Decimal(400.00),
        location: 'Sonalium, Goa-Karnataka border',
        duration: 300
      },
      {
        name: 'Anjuna Flea Market',
        description: 'Lively beachfront flea market featuring local crafts, spices, clothes, and street food.',
        cost: new Prisma.Decimal(50.00),
        location: 'Anjuna Beach Road, North Goa',
        duration: 180
      },
      {
        name: 'Spice Plantation Tour & Lunch',
        description: 'Guided walk through spice gardens followed by a traditional Goan buffet cooked with fresh spices.',
        cost: new Prisma.Decimal(500.00),
        location: 'Ponda, Central Goa',
        duration: 180
      }
    ]
  },
  {
    name: 'Jaipur',
    country: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
    activities: [
      {
        name: 'Amber Palace Royal Tour',
        description: 'Explore the majestic hilltop palace featuring intricate Sheesh Mahal (mirror hall).',
        cost: new Prisma.Decimal(200.00),
        location: 'Devisinghpura, Amer',
        duration: 180
      },
      {
        name: 'Hawa Mahal Palace of Winds',
        description: 'Admire the iconic honeycomb pink sandstone facade built for royal women.',
        cost: new Prisma.Decimal(50.00),
        location: 'Hawa Mahal Road, Badi Choupad',
        duration: 60
      },
      {
        name: 'City Palace Museum',
        description: 'Royal residence with gorgeous courtyards and galleries of weapons, textiles, and art.',
        cost: new Prisma.Decimal(300.00),
        location: 'Tulsi Marg, Gangori Bazaar',
        duration: 120
      },
      {
        name: 'Jantar Mantar Observatory',
        description: 'UNESCO World Heritage site containing nineteen architectural astronomical instruments.',
        cost: new Prisma.Decimal(100.00),
        location: 'Kanwar Nagar, Jaipur',
        duration: 90
      },
      {
        name: 'Chokhi Dhani Ethnic Experience',
        description: 'Cultural village featuring traditional Rajasthani dances, camel rides, and local dinner.',
        cost: new Prisma.Decimal(900.00),
        location: 'Tonk Road, Jaipur',
        duration: 240
      }
    ]
  },
  {
    name: 'Dubai',
    country: 'UAE',
    latitude: 25.2048,
    longitude: 55.2708,
    activities: [
      {
        name: 'Burj Khalifa Observation Deck',
        description: 'Ride the high-speed elevator to the 124th floor for unmatched panoramic city views.',
        cost: new Prisma.Decimal(179.00),
        location: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
        duration: 120
      },
      {
        name: 'Desert Safari & BBQ Dinner',
        description: 'Enjoy thrilling dune bashing followed by traditional dances and a delicious BBQ buffet.',
        cost: new Prisma.Decimal(75.00),
        location: 'Lahbab Desert, Dubai',
        duration: 360
      },
      {
        name: 'Dubai Mall & Fountain Show',
        description: "Shop at the world's largest mall and watch the synchronized outdoor fountain performance.",
        cost: new Prisma.Decimal(0.00),
        location: 'Financial Center Road, Downtown Dubai',
        duration: 180
      },
      {
        name: 'Dubai Marina Yacht Cruise',
        description: 'Guided cruise past spectacular modern skyscrapers, Palm Jumeirah, and Atlantis.',
        cost: new Prisma.Decimal(45.00),
        location: 'Marina Promenade, Dubai Marina',
        duration: 120
      },
      {
        name: 'Museum of the Future',
        description: 'Exhibition space for innovative and futuristic ideologies, services, and products.',
        cost: new Prisma.Decimal(40.00),
        location: 'Sheikh Zayed Road, Trade Centre 2',
        duration: 150
      }
    ]
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    activities: [
      {
        name: 'Gardens by the Bay Walk',
        description: 'Walk through the futuristic Flower Dome and Cloud Forest conservatories.',
        cost: new Prisma.Decimal(32.00),
        location: '18 Marina Gardens Dr',
        duration: 180
      },
      {
        name: 'Sentosa Cable Car Sky Pass',
        description: "Take in birds-eye views of Singapore's skyline and Sentosa Island.",
        cost: new Prisma.Decimal(28.00),
        location: 'HarbourFront Tower 2',
        duration: 120
      },
      {
        name: 'Singapore Zoo & Night Safari',
        description: 'Take a tram ride through naturalistic environments to view nocturnal animal behaviors.',
        cost: new Prisma.Decimal(48.00),
        location: '80 Mandai Lake Road',
        duration: 240
      },
      {
        name: 'Universal Studios Singapore',
        description: 'Action-packed movie-themed amusement park with roller coasters and shows.',
        cost: new Prisma.Decimal(82.00),
        location: '8 Sentosa Gateway',
        duration: 360
      },
      {
        name: 'Chinatown & Heritage Food Tour',
        description: 'Explore local Chinese temples and sample Michelin-starred street food stalls.',
        cost: new Prisma.Decimal(35.00),
        location: 'Chinatown, Singapore',
        duration: 120
      }
    ]
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    activities: [
      {
        name: 'Shibuya Crossing Walk',
        description: "Experience the world's busiest pedestrian intersection and meet the Hachiko statue.",
        cost: new Prisma.Decimal(0.00),
        location: 'Dogenzaka, Shibuya City',
        duration: 45
      },
      {
        name: 'Senso-ji Temple Visit',
        description: "Tokyo's oldest and most iconic Buddhist temple in Asakusa.",
        cost: new Prisma.Decimal(0.00),
        location: '2 Chome-3-1 Asakusa, Taito City',
        duration: 90
      },
      {
        name: 'Tokyo Skytree Admission',
        description: 'Access Japan\'s tallest structure for panoramic vistas extending to Mt. Fuji.',
        cost: new Prisma.Decimal(23.00),
        location: '1 Chome-1-2 Oshiage, Sumida City',
        duration: 120
      },
      {
        name: 'Shinjuku Gyoen National Garden',
        description: 'Beautiful public park containing traditional Japanese landscape gardens and teahouses.',
        cost: new Prisma.Decimal(3.50),
        location: '11 Naitomachi, Shinjuku City',
        duration: 120
      },
      {
        name: 'Akihabara Anime & Electronics Tour',
        description: 'Guided tour of retro arcades, hobby stores, and duty-free electronics shops.',
        cost: new Prisma.Decimal(15.00),
        location: 'Sotokanda, Chiyoda City',
        duration: 180
      }
    ]
  },
  {
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    activities: [
      {
        name: 'Eiffel Tower Summit Access',
        description: 'Access the peak of the iconic iron tower for stunning aerial views of Paris.',
        cost: new Prisma.Decimal(29.40),
        location: 'Champ de Mars, 5 Avenue Anatole France',
        duration: 150
      },
      {
        name: 'Louvre Museum Masterpieces Tour',
        description: "Guided tour of the world's largest art museum, featuring the Mona Lisa.",
        cost: new Prisma.Decimal(22.00),
        location: 'Rue de Rivoli, 75001 Paris',
        duration: 240
      },
      {
        name: 'Seine River Cruise',
        description: 'A relaxing boat cruise down the River Seine passing architectural highlights.',
        cost: new Prisma.Decimal(15.00),
        location: 'Port de la Bourdonnais, 75007 Paris',
        duration: 60
      },
      {
        name: 'Palace of Versailles Day Trip',
        description: 'Visit the royal palace and spectacular gardens of Louis XIV.',
        cost: new Prisma.Decimal(21.50),
        location: 'Place d\'Armes, 78000 Versailles',
        duration: 300
      },
      {
        name: 'Montmartre & Sacré-Cœur Walking Tour',
        description: 'Explore the artsy winding streets of Montmartre up to the white Basilica.',
        cost: new Prisma.Decimal(0.00),
        location: 'Place du Tertre, 75018 Paris',
        duration: 120
      }
    ]
  },
  {
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    activities: [
      {
        name: 'British Museum Exploration',
        description: 'View millions of years of human history, including the Rosetta Stone.',
        cost: new Prisma.Decimal(0.00),
        location: 'Great Russell St, Bloomsbury',
        duration: 180
      },
      {
        name: 'London Eye Flight',
        description: 'Take a spin on the giant Ferris wheel for 360-degree views of London and the Thames.',
        cost: new Prisma.Decimal(40.00),
        location: 'Riverside Building, County Hall',
        duration: 45
      },
      {
        name: 'Tower of London & Crown Jewels',
        description: 'Visit the historic castle, fortress, and prison containing the Royal Crown Jewels.',
        cost: new Prisma.Decimal(33.60),
        location: 'St Katharine\'s & Wapping, London',
        duration: 180
      },
      {
        name: 'Westminster Abbey',
        description: 'Tour the coronation church of the British monarchy and resting place of great historical figures.',
        cost: new Prisma.Decimal(27.00),
        location: '20 Dean\'s Yard, Westminster',
        duration: 120
      },
      {
        name: 'Borough Market Food Walk',
        description: 'Sample culinary treasures at London\'s historic and world-renowned food market.',
        cost: new Prisma.Decimal(25.00),
        location: '8 Southwark St, London',
        duration: 90
      }
    ]
  },
  {
    name: 'Rome',
    country: 'Italy',
    latitude: 41.9028,
    longitude: 12.4964,
    activities: [
      {
        name: 'Colosseum & Roman Forum Tour',
        description: 'Walk in the footsteps of gladiators and explore the heart of ancient Rome.',
        cost: new Prisma.Decimal(24.00),
        location: 'Piazza del Colosseo, 1',
        duration: 180
      },
      {
        name: 'Trevi Fountain & Pantheon Walk',
        description: "Toss a coin into the Trevi and marvel at the Pantheon's historic dome.",
        cost: new Prisma.Decimal(0.00),
        location: 'Piazza di Trevi / Piazza della Rotonda',
        duration: 90
      },
      {
        name: 'Vatican Museums & Sistine Chapel',
        description: 'Tour the vast Papal collections and Michelangelo\'s ceiling frescoes.',
        cost: new Prisma.Decimal(22.00),
        location: 'Viale Vaticano, 00120 Vatican City',
        duration: 240
      },
      {
        name: "Piazza Navona & Campo de' Fiori",
        description: 'Explore the fountains of Piazza Navona and the morning produce market of Campo de\' Fiori.',
        cost: new Prisma.Decimal(0.00),
        location: 'Piazza Navona, Rome',
        duration: 90
      },
      {
        name: 'Trastevere Food Tour',
        description: 'Taste authentic Roman pizzas, supplì, and gelatos in the charming Trastevere area.',
        cost: new Prisma.Decimal(45.00),
        location: 'Piazza di Santa Maria in Trastevere',
        duration: 150
      }
    ]
  },
  {
    name: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    activities: [
      {
        name: 'Statue of Liberty & Ellis Island Ferry',
        description: 'Take the ferry to visit Lady Liberty and explore immigration history at Ellis Island.',
        cost: new Prisma.Decimal(31.50),
        location: 'Battery Park, Lower Manhattan',
        duration: 240
      },
      {
        name: 'Central Park Bike Tour',
        description: 'Rent a bike and explore the beautiful sights and trails of Central Park.',
        cost: new Prisma.Decimal(25.00),
        location: 'Central Park, Manhattan',
        duration: 120
      },
      {
        name: 'Empire State Building Observation Deck',
        description: 'Ride to the 86th floor for sweeping panoramic views of the Manhattan skyline.',
        cost: new Prisma.Decimal(44.00),
        location: '20 W 34th St, New York',
        duration: 120
      },
      {
        name: 'Metropolitan Museum of Art',
        description: 'Browse thousands of years of art across world-class collections and the Temple of Dendur.',
        cost: new Prisma.Decimal(30.00),
        location: '1000 5th Ave, New York',
        duration: 180
      },
      {
        name: 'Broadway Show',
        description: 'Enjoy a world-famous live musical or theater performance in the heart of Times Square.',
        cost: new Prisma.Decimal(120.00),
        location: 'Broadway, Times Square',
        duration: 150
      },
      {
        name: 'High Line & Chelsea Market Walk',
        description: 'Stroll the converted elevated rail line park, finishing at the Chelsea food market.',
        cost: new Prisma.Decimal(0.00),
        location: 'Gansevoort St to W 34th St',
        duration: 90
      }
    ]
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    latitude: 41.3851,
    longitude: 2.1734,
    activities: [
      {
        name: 'Sagrada Familia Guided Entrance',
        description: "Step inside Antoni Gaudi's breathtaking, unfinished basilica.",
        cost: new Prisma.Decimal(33.80),
        location: 'C/ de Mallorca, 401',
        duration: 120
      },
      {
        name: 'Park Güell Mosaic Walk',
        description: 'Stroll through the whimsical public park system designed by Antoni Gaudi.',
        cost: new Prisma.Decimal(13.50),
        location: 'Gràcia, Barcelona',
        duration: 90
      },
      {
        name: 'La Rambla & Gothic Quarter Walk',
        description: 'Wander along the famous pedestrian avenue and through medieval alleys of the Gothic Quarter.',
        cost: new Prisma.Decimal(0.00),
        location: 'La Rambla, Barcelona',
        duration: 120
      },
      {
        name: 'Camp Nou Stadium Tour',
        description: 'Tour the home stadium of FC Barcelona, the interactive museum, and player areas.',
        cost: new Prisma.Decimal(28.00),
        location: 'C. d\'Arístides Maillol, 12',
        duration: 120
      },
      {
        name: 'Tapas & Paella Cooking Class',
        description: 'Participate in a hands-on kitchen workshop cooking traditional Spanish dishes.',
        cost: new Prisma.Decimal(55.00),
        location: 'Mercat de la Boqueria, La Rambla',
        duration: 180
      }
    ]
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    latitude: 52.3676,
    longitude: 4.9041,
    activities: [
      {
        name: 'Classic Canal Cruise',
        description: 'A relaxing boat cruise through the historic UNESCO-protected canal ring.',
        cost: new Prisma.Decimal(22.00),
        location: 'Prins Hendrikkade 37A',
        duration: 75
      },
      {
        name: 'Van Gogh Museum Visit',
        description: 'Browse the largest collection of paintings and drawings by Vincent van Gogh.',
        cost: new Prisma.Decimal(24.00),
        location: 'Museumplein 6',
        duration: 120
      },
      {
        name: 'Rijksmuseum Tour',
        description: 'Visit the national museum dedicated to Dutch art, history, and Rembrandt.',
        cost: new Prisma.Decimal(22.50),
        location: 'Museumstraat 1, Amsterdam',
        duration: 180
      },
      {
        name: 'Anne Frank House',
        description: 'Tour the preserved secret annex where Anne Frank and her family hid during WWII.',
        cost: new Prisma.Decimal(16.00),
        location: 'Prinsengracht 263-267',
        duration: 90
      },
      {
        name: 'Vondelpark Bicycle Ride',
        description: 'Cycle around the famous green park in the middle of Amsterdam.',
        cost: new Prisma.Decimal(15.00),
        location: 'Vondelpark, Amsterdam',
        duration: 90
      }
    ]
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    latitude: 13.7563,
    longitude: 100.5018,
    activities: [
      {
        name: 'Grand Palace & Temple of the Emerald Buddha',
        description: 'Stunning royal palace complex with the sacred Wat Phra Kaew Buddha statue.',
        cost: new Prisma.Decimal(15.00),
        location: 'Na Phra Lan Road, Phra Borom Maha Ratchawang',
        duration: 180
      },
      {
        name: 'Wat Arun (Temple of Dawn)',
        description: 'Historic Buddhist temple on the Chao Phraya River, featuring iconic porcelain towers.',
        cost: new Prisma.Decimal(3.00),
        location: '158 Thanon Wang Doem, Wat Arun',
        duration: 60
      },
      {
        name: 'Chatuchak Weekend Market',
        description: 'Explore one of the largest outdoor markets in the world with over 15,000 stalls.',
        cost: new Prisma.Decimal(0.00),
        location: 'Kamphaeng Phet 2 Road, Chatuchak',
        duration: 240
      },
      {
        name: 'Chao Phraya River Dinner Cruise',
        description: 'Enjoy a traditional Thai dinner buffet aboard a boat sailing past lit-up temples.',
        cost: new Prisma.Decimal(40.00),
        location: 'Iconsiam Pier, Bangkok',
        duration: 120
      },
      {
        name: 'Damnoen Saduak Floating Market',
        description: 'Ride a long-tail boat through canals bustling with vendors selling food and crafts.',
        cost: new Prisma.Decimal(20.00),
        location: 'Damnoen Saduak District, Ratchaburi',
        duration: 240
      }
    ]
  }
];

async function main() {
  console.log('Start seeding...');
  let citiesInsertedCount = 0;
  let activitiesInsertedCount = 0;

  for (const cityInfo of citiesData) {
    // Gracefully handle Standardizing country name: check if city exists by name and country, or name and 'UK'
    let city = await prisma.city.findFirst({
      where: {
        name: cityInfo.name,
        country: { in: [cityInfo.country, 'UK'] }
      }
    });

    if (!city) {
      city = await prisma.city.create({
        data: {
          name: cityInfo.name,
          country: cityInfo.country,
          latitude: cityInfo.latitude,
          longitude: cityInfo.longitude
        }
      });
      console.log(`Created city: ${city.name}, ${city.country}`);
      citiesInsertedCount++;
    } else {
      // Standardize to "United Kingdom" if it was "UK"
      if (city.country !== cityInfo.country) {
        city = await prisma.city.update({
          where: { id: city.id },
          data: { country: cityInfo.country }
        });
        console.log(`Updated city country: ${city.name} to ${city.country}`);
      } else {
        console.log(`City already exists: ${city.name}, ${city.country}`);
      }
    }

    for (const actInfo of cityInfo.activities) {
      let activity = await prisma.activity.findFirst({
        where: {
          name: actInfo.name,
          cityId: city.id
        }
      });

      if (!activity) {
        activity = await prisma.activity.create({
          data: {
            cityId: city.id,
            name: actInfo.name,
            description: actInfo.description,
            cost: actInfo.cost,
            location: actInfo.location,
            duration: actInfo.duration
          }
        });
        console.log(`  Created activity: ${activity.name}`);
        activitiesInsertedCount++;
      } else {
        console.log(`  Activity already exists: ${activity.name}`);
      }
    }
  }

  console.log('Seeding finished.');
  console.log(`[Result] Cities created: ${citiesInsertedCount}`);
  console.log(`[Result] Activities created: ${activitiesInsertedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
