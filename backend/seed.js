const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const mockProviders = [
  { name: 'Kaamwale Admin', email: 'admin@kaamwale.com', password: 'password123', role: 'admin' },
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', password: 'password123', role: 'provider', phone: '9876543210', category: 'Labour', hourlyRate: 300, location: 'Andheri East, Mumbai', rating: 4.8, reviewsCount: 124, image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop' },
  { name: 'Suresh Plumbing', email: 'suresh@example.com', password: 'password123', role: 'provider', phone: '9876543211', category: 'Plumber', hourlyRate: 400, location: 'Bandra West, Mumbai', rating: 4.9, reviewsCount: 89, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop' },
  { name: 'Amit Electrician', email: 'amit@example.com', password: 'password123', role: 'provider', phone: '9876543212', category: 'Electrician', hourlyRate: 350, location: 'Dadar, Mumbai', rating: 4.7, reviewsCount: 200, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop' },
  { name: 'Ramesh Carpenter', email: 'ramesh@example.com', password: 'password123', role: 'provider', phone: '9876543213', category: 'Carpenter', hourlyRate: 450, location: 'Worli, Mumbai', rating: 4.6, reviewsCount: 112, image: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=400&h=400&fit=crop' },
  { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'provider', phone: '9876543214', category: 'Tutor', hourlyRate: 500, location: 'Juhu, Mumbai', rating: 5.0, reviewsCount: 340, image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop' },
  { name: 'Dinesh Colors', email: 'dinesh@example.com', password: 'password123', role: 'provider', phone: '9876543215', category: 'Painter', hourlyRate: 300, location: 'Powai, Mumbai', rating: 4.5, reviewsCount: 76, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop' },
  { name: 'Vikram Auto', email: 'vikram@example.com', password: 'password123', role: 'provider', phone: '9876543216', category: 'Mechanic', hourlyRate: 600, location: 'Goregaon, Mumbai', rating: 4.8, reviewsCount: 155, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop' },
  { name: 'CoolTech Services', email: 'cooltech@example.com', password: 'password123', role: 'provider', phone: '9876543217', category: 'AC Repair', hourlyRate: 400, location: 'Malad, Mumbai', rating: 4.4, reviewsCount: 92, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop' }
];
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
    await User.deleteMany();
    for (let p of mockProviders) {
      const bcrypt = require('bcryptjs');
      p.password = await bcrypt.hash(p.password, 10);
    }
    await User.insertMany(mockProviders);
    console.log('Database Seeded!');
    process.exit();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

seedDB();
