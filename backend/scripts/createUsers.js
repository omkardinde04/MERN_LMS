import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// User Model (inline to avoid import issues)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'faculty'], required: true },
    avatar: { type: String },
    contact: { type: String, default: '' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    notificationPrefs: {
        emailNotifications: { type: Boolean, default: true },
        assignmentReminders: { type: Boolean, default: true },
        gradeUpdates: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Users to create
const usersToCreate = [
    {
        fullName: 'Omkar Dinde',
        email: 'omkar.dinde@somaiya.edu',
        studentId: '1001',
        password: 'Vd!17777',
        role: 'faculty'
    },
    {
        fullName: 'Manasi',
        email: 'manasi23@somaiya.edu',
        studentId: '2340',
        password: 'Manasidoremon234',
        role: 'student'
    }
];

async function createUsers() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnify');
        console.log('✅ Connected to MongoDB');

        for (const userData of usersToCreate) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({
                    $or: [{ email: userData.email }, { studentId: userData.studentId }]
                });

                if (existingUser) {
                    console.log(`⚠️  User ${userData.email} already exists, skipping...`);
                    continue;
                }

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                // Create user
                const user = await User.create({
                    ...userData,
                    password: hashedPassword,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`
                });

                console.log(`✅ Created ${user.role}: ${user.email} (ID: ${user.studentId})`);
            } catch (error) {
                console.error(`❌ Error creating user ${userData.email}:`, error.message);
            }
        }

        console.log('\n🎉 User creation completed!');
        console.log('\n📋 Login Credentials:');
        console.log('━'.repeat(50));
        console.log('\n👨‍🏫 Faculty:');
        console.log('   Email: omkar.dinde@somaiya.edu');
        console.log('   Password: Vd!17777');
        console.log('   ID: 1001');
        console.log('\n👨‍🎓 Student:');
        console.log('   Email: manasi23@somaiya.edu');
        console.log('   Password: Manasidoremon234');
        console.log('   ID: 2340');
        console.log('\n━'.repeat(50));

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('\n⚠️  Make sure MongoDB is running!');
        console.log('   Run: net start MongoDB (as Administrator)');
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createUsers();
