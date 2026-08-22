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
        name: 'Sabarmati Ashram Tour',
        description: "Peaceful historical visit to Mahatma Gandhi's home along the riverfront.",
        cost: new Prisma.Decimal(0.00),
        location: 'Gandhi Smarak Sangrahalaya, Ashram Road',
        duration: 120
      },
      {
        name: 'Adalaj Stepwell Exploration',
        description: 'Marvel at the stunning 5-story deep Solanki-style sandstone stepwell.',
        cost: new Prisma.Decimal(50.00),
        location: 'Adalaj Road, Gandhinagar',
        duration: 90
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
        name: 'Gateway of India & Taj Palace Sightseeing',
        description: 'Iconic historic arch monument overlooking the Arabian Sea.',
        cost: new Prisma.Decimal(0.00),
        location: 'Apollo Bandar, Colaba',
        duration: 60
      },
      {
        name: 'Marine Drive Sunset Walk',
        description: "A beautiful walk along the Queen's Necklace promenade at sunset.",
        cost: new Prisma.Decimal(0.00),
        location: 'Marine Drive, Netaji Subhash Chandra Bose Road',
        duration: 90
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
        description: 'Explore the grand 17th-century Mughal fort complex in Old Delhi.',
        cost: new Prisma.Decimal(80.00),
        location: 'Netaji Subhash Marg, Chandni Chowk',
        duration: 180
      },
      {
        name: 'Qutub Minar Historical Walk',
        description: 'Visit the 73-meter tall minaret and the surrounding ancient ruins.',
        cost: new Prisma.Decimal(40.00),
        location: 'Mehrauli, New Delhi',
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
        description: 'Experience thrilling water sports including parasailing and jet-skiing.',
        cost: new Prisma.Decimal(1500.00),
        location: 'Baga Beach, North Goa',
        duration: 150
      },
      {
        name: 'Basilica of Bom Jesus Tour',
        description: 'Visit the historic UNESCO World Heritage church housing the remains of St. Francis Xavier.',
        cost: new Prisma.Decimal(0.00),
        location: 'Old Goa Road, Bainguinim',
        duration: 60
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
        description: 'Explore the majestic hilltop fort with artistic Hindu-style elements.',
        cost: new Prisma.Decimal(200.00),
        location: 'Devisinghpura, Amer',
        duration: 180
      },
      {
        name: 'Hawa Mahal Visual Walk',
        description: 'Admire the unique facade of the Palace of Winds from the street and cafes.',
        cost: new Prisma.Decimal(50.00),
        location: 'Hawa Mahal Road, Badi Choupad',
        duration: 60
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
      }
    ]
  },
  {
    name: 'London',
    country: 'UK',
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
        location: 'Piazza del Colosseum, 1',
        duration: 180
      },
      {
        name: 'Trevi Fountain & Pantheon Walk',
        description: 'Toss a coin into the Trevi and marvel at the Pantheon\'s historic dome.',
        cost: new Prisma.Decimal(0.00),
        location: 'Piazza di Trevi / Piazza della Rotonda',
        duration: 90
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
      }
    ]
  }
];

async function main() {
  console.log('Start seeding...');
  let citiesInsertedCount = 0;
  let activitiesInsertedCount = 0;

  for (const cityInfo of citiesData) {
    let city = await prisma.city.findFirst({
      where: {
        name: cityInfo.name,
        country: cityInfo.country
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
      console.log(`City already exists, skipping: ${city.name}, ${city.country}`);
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
        console.log(`  Activity already exists, skipping: ${activity.name}`);
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
