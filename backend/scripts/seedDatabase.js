import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Assignment from '../models/assignmentModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learnify';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Course.deleteMany({});
        await Assignment.deleteMany({});

        console.log('\n👥 Creating Users...');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword1 = await bcrypt.hash('Vd!17777', salt);
        const hashedPassword2 = await bcrypt.hash('Manasidoremon234', salt);
        const hashedPassword3 = await bcrypt.hash('Student123', salt);

        // Create Faculty
        const faculty = await User.create({
            fullName: 'Omkar Dinde',
            email: 'omkar.dinde@somaiya.edu',
            studentId: '1001',
            password: hashedPassword1,
            role: 'faculty'
        });
        console.log(`✅ Created faculty: ${faculty.email}`);

        // Create Students
        const student1 = await User.create({
            fullName: 'Manasi',
            email: 'manasi23@somaiya.edu',
            studentId: '2340',
            password: hashedPassword2,
            role: 'student'
        });
        console.log(`✅ Created student: ${student1.email}`);

        const student2 = await User.create({
            fullName: 'Raj Sharma',
            email: 'raj.sharma@somaiya.edu',
            studentId: '2341',
            password: hashedPassword3,
            role: 'student'
        });
        console.log(`✅ Created student: ${student2.email}`);

        const student3 = await User.create({
            fullName: 'Priya Patel',
            email: 'priya.patel@somaiya.edu',
            studentId: '2342',
            password: hashedPassword3,
            role: 'student'
        });
        console.log(`✅ Created student: ${student3.email}`);

        console.log('\n📚 Creating Courses...');

        // Create Courses
        const course1 = await Course.create({
            name: 'Data Structures and Algorithms',
            code: 'CS201',
            faculty: faculty._id,
            semester: 'Fall 2025',
            credits: 4,
            class: 'TY-C1',
            description: 'Learn fundamental data structures and algorithms',
            students: [student1._id, student2._id]
        });
        console.log(`✅ Created course: ${course1.code} - ${course1.name}`);

        const course2 = await Course.create({
            name: 'Database Management Systems',
            code: 'CS301',
            faculty: faculty._id,
            semester: 'Fall 2025',
            credits: 3,
            class: 'TY-C1',
            description: 'Comprehensive study of database systems',
            students: [student1._id, student3._id]
        });
        console.log(`✅ Created course: ${course2.code} - ${course2.name}`);

        const course3 = await Course.create({
            name: 'Web Development',
            code: 'CS101',
            faculty: faculty._id,
            semester: 'Fall 2025',
            credits: 3,
            class: 'SY-A',
            description: 'Full-stack web development with MERN',
            students: [student2._id, student3._id]
        });
        console.log(`✅ Created course: ${course3.code} - ${course3.name}`);

        // Update students' courses array
        student1.courses = [course1._id, course2._id];
        await student1.save();

        student2.courses = [course1._id, course3._id];
        await student2.save();

        student3.courses = [course2._id, course3._id];
        await student3.save();

        console.log('\n📝 Creating Assignments...');

        // Create Assignments
        const assignment1 = await Assignment.create({
            title: 'Implement Binary Search Tree',
            description: 'Create a BST with insert, delete, and search operations',
            course: course1._id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            maxScore: 100
        });
        console.log(`✅ Created assignment: ${assignment1.title}`);

        const assignment2 = await Assignment.create({
            title: 'Design Relational Database Schema',
            description: 'Create ER diagram and normalize to 3NF',
            course: course2._id,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            maxScore: 100
        });
        console.log(`✅ Created assignment: ${assignment2.title}`);

        const assignment3 = await Assignment.create({
            title: 'Build REST API with Express',
            description: 'Create a RESTful API with CRUD operations',
            course: course3._id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            maxScore: 100
        });
        console.log(`✅ Created assignment: ${assignment3.title}`);

        console.log('\n\n🎉 Database Seeded Successfully!\n');
        console.log('='.repeat(50));
        console.log('📋 LOGIN CREDENTIALS:');
        console.log('='.repeat(50));
        console.log('\n👨‍🏫 FACULTY:');
        console.log('   Email: omkar.dinde@somaiya.edu');
        console.log('   Password: Vd!17777');
        console.log('\n👨‍🎓 STUDENTS:');
        console.log('   1. Email: manasi23@somaiya.edu');
        console.log('      Password: Manasidoremon234');
        console.log('   2. Email: raj.sharma@somaiya.edu');
        console.log('      Password: Student123');
        console.log('   3. Email: priya.patel@somaiya.edu');
        console.log('      Password: Student123');
        console.log('\n📚 ENROLLMENT CODES (Course Codes):');
        console.log('   CS201 - Data Structures and Algorithms');
        console.log('   CS301 - Database Management Systems');
        console.log('   CS101 - Web Development');
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
