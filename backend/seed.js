const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const mockProviders = [
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', password: 'password123', role: 'provider', phone: '9876543210', category: 'Labour', hourlyRate: 300, location: 'Andheri East, Mumbai', rating: 4.8, reviewsCount: 124 },
  { name: 'Suresh Plumbing', email: 'suresh@example.com', password: 'password123', role: 'provider', phone: '9876543211', category: 'Plumber', hourlyRate: 400, location: 'Bandra West, Mumbai', rating: 4.9, reviewsCount: 89 },
  { name: 'Amit Electrician', email: 'amit@example.com', password: 'password123', role: 'provider', phone: '9876543212', category: 'Electrician', hourlyRate: 350, location: 'Dadar, Mumbai', rating: 4.7, reviewsCount: 200 }
];

const seedDB = async () => {
  try {
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
