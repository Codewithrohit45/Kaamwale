const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Booking = require('./models/Booking');

dotenv.config();

const categories = ['Labour', 'Plumber', 'Electrician', 'Carpenter', 'Tutor', 'Painter', 'Mechanic', 'AC Repair'];
const locations = ['Andheri East, Mumbai', 'Bandra West, Mumbai', 'Dadar, Mumbai', 'Worli, Mumbai', 'Juhu, Mumbai', 'Powai, Mumbai', 'Goregaon, Mumbai', 'Malad, Mumbai', 'Koramangala, Bengaluru', 'Indiranagar, Bengaluru', 'Lajpat Nagar, Delhi', 'Connaught Place, Delhi'];

const firstNames = ['Rajesh', 'Suresh', 'Amit', 'Ramesh', 'Priya', 'Dinesh', 'Vikram', 'Neha', 'Arun', 'Pooja', 'Rahul', 'Anjali', 'Karan', 'Sneha', 'Mohan', 'Anita'];
const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Das', 'Joshi'];

const providerImages = {
  Labour: ['https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop'],
  Plumber: ['https://images.unsplash.com/photo-1603712725038-e933396ce100?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop'],
  Electrician: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1620061545610-d8a9bd41d6da?w=400&h=400&fit=crop'],
  Carpenter: ['https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400&h=400&fit=crop'],
  Tutor: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1580894732444-8ecded790047?w=400&h=400&fit=crop'],
  Painter: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop'],
  Mechanic: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=400&fit=crop'],
  'AC Repair': ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=400&h=400&fit=crop']
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateUsers = async () => {
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1 Admin
  users.push({
    name: 'Kaamwale Admin',
    email: 'admin@kaamwale.com',
    password: hashedPassword,
    role: 'admin',
  });

  // 15 Standard Users
  for (let i = 1; i <= 15; i++) {
    users.push({
      name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
      email: `user${i}@example.com`,
      password: hashedPassword,
      role: 'user',
      phone: `99${getRandomInt(10000000, 99999999)}`
    });
  }

  // 40 Providers (5 per category)
  for (const category of categories) {
    for (let i = 1; i <= 5; i++) {
      const name = `${getRandom(firstNames)} ${category === 'Labour' ? 'Kumar' : category === 'AC Repair' ? 'Cooling' : category}`;
      users.push({
        name: name,
        email: `provider_${category.replace(' ', '').toLowerCase()}${i}@example.com`,
        password: hashedPassword,
        role: 'provider',
        phone: `98${getRandomInt(10000000, 99999999)}`,
        category: category,
        hourlyRate: getRandomInt(200, 800),
        location: getRandom(locations),
        rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
        reviewsCount: getRandomInt(10, 500),
        image: getRandom(providerImages[category])
      });
    }
  }

  return users;
};

const generateBookings = (insertedUsers) => {
  const bookings = [];
  const standardUsers = insertedUsers.filter(u => u.role === 'user');
  const providers = insertedUsers.filter(u => u.role === 'provider');
  const statuses = ['pending', 'accepted', 'completed', 'cancelled'];
  const times = ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

  for (let i = 0; i < 100; i++) {
    const user = getRandom(standardUsers);
    const provider = getRandom(providers);
    
    // Random date within the last 30 days or next 15 days
    const date = new Date();
    date.setDate(date.getDate() + getRandomInt(-30, 15));

    bookings.push({
      user: user._id,
      provider: provider._id,
      serviceLocation: getRandom(locations),
      date: date,
      time: getRandom(times),
      status: getRandom(statuses),
      notes: `Demo booking requirement ${i} for ${provider.category}`,
      totalPrice: provider.hourlyRate * getRandomInt(1, 4) // 1-4 hours
    });
  }
  return bookings;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Large Data Seeding...');
    
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Booking.deleteMany();

    console.log('Generating Users & Providers...');
    const usersToInsert = await generateUsers();
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`Inserted ${insertedUsers.length} users/providers.`);

    console.log('Generating Bookings...');
    const bookingsToInsert = generateBookings(insertedUsers);
    const insertedBookings = await Booking.insertMany(bookingsToInsert);
    console.log(`Inserted ${insertedBookings.length} bookings.`);

    console.log('Database Seeded Successfully with Large Demo Data!');
    process.exit();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

seedDB();
