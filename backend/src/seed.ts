import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Expert from "./models/Expert.ts";
import User from "./models/User.ts";
import Booking from "./models/Booking.ts";
import Notification from "./models/Notification.ts";

dotenv.config();

const expertData = [
    {
        name: "Dr. Sarah Chen",
        email: "sarah@expert.com",
        category: "Technology",
        experience: 12,
        rating: 4.9,
        bio: "AI/ML researcher with 12 years of experience at top tech companies. Specializes in deep learning, NLP, and computer vision. Published 30+ papers in top-tier conferences.",
    },
    {
        name: "James Wilson",
        email: "james@expert.com",
        category: "Business",
        experience: 15,
        rating: 4.8,
        bio: "Serial entrepreneur and business strategist. Founded 3 successful startups and mentored over 200 founders. Expert in go-to-market strategy and fundraising.",
    },
    {
        name: "Dr. Emily Rodriguez",
        email: "emily@expert.com",
        category: "Health",
        experience: 10,
        rating: 4.7,
        bio: "Board-certified nutritionist and wellness coach. Specializes in holistic health, sports nutrition, and preventive medicine. Author of bestselling health books.",
    },
    {
        name: "Alex Thompson",
        email: "alex@expert.com",
        category: "Design",
        experience: 8,
        rating: 4.6,
        bio: "Award-winning UX/UI designer. Former design lead at FAANG companies. Expert in design systems, accessibility, and user research methodologies.",
    },
    {
        name: "Michael Park",
        email: "michael@expert.com",
        category: "Finance",
        experience: 20,
        rating: 4.9,
        bio: "CFA charterholder and wealth management advisor with 20 years on Wall Street. Expert in portfolio management, risk assessment, and retirement planning.",
    },
    {
        name: "Prof. Lisa Kumar",
        email: "lisa@expert.com",
        category: "Education",
        experience: 18,
        rating: 4.8,
        bio: "Professor of Education Technology at Stanford. Pioneer in adaptive learning systems and online pedagogy. Consults for EdTech startups worldwide.",
    },
    {
        name: "David Kim",
        email: "david@expert.com",
        category: "Technology",
        experience: 10,
        rating: 4.5,
        bio: "Full-stack architect specializing in cloud-native applications. AWS Solutions Architect and Kubernetes expert. Led engineering teams at multiple unicorn startups.",
    },
    {
        name: "Rachel Foster",
        email: "rachel@expert.com",
        category: "Business",
        experience: 14,
        rating: 4.7,
        bio: "Management consultant and leadership coach. Former McKinsey partner. Helps organizations transform culture, improve operations, and develop leadership pipelines.",
    },
    {
        name: "Dr. Mark Stevens",
        email: "mark@expert.com",
        category: "Health",
        experience: 16,
        rating: 4.8,
        bio: "Clinical psychologist and mental health advocate. Specializes in cognitive behavioral therapy, stress management, and workplace wellness programs.",
    },
    {
        name: "Sophia Martinez",
        email: "sophia@expert.com",
        category: "Design",
        experience: 7,
        rating: 4.4,
        bio: "Brand identity designer and creative director. Built visual identities for Fortune 500 companies. Expert in typography, color theory, and motion design.",
    },
    {
        name: "Robert Chang",
        email: "robert@expert.com",
        category: "Finance",
        experience: 12,
        rating: 4.6,
        bio: "Fintech innovation expert and blockchain consultant. Advises banks and startups on digital transformation, DeFi strategies, and regulatory compliance.",
    },
    {
        name: "Dr. Amanda White",
        email: "amanda@expert.com",
        category: "Education",
        experience: 11,
        rating: 4.5,
        bio: "Curriculum development specialist and learning scientist. Designs evidence-based training programs for corporate and academic sectors. TEDx speaker.",
    },
];

async function seed() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI ||
            "mongodb://localhost:27017/expert-session-management-app"
        );
        console.log("Connected to MongoDB");

        // Clear existing data
        await Expert.deleteMany({});
        await User.deleteMany({});
        await Booking.deleteMany({});
        await Notification.deleteMany({});
        console.log("Cleared existing data");

        // Hash password once for all experts
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Create a test user
        const testUser = new User({
            name: "Test User",
            email: "user@test.com",
            password: hashedPassword,
            role: "user",
            phone: "+1 555-0100",
        });
        // Skip pre-save hook since password is already hashed
        await User.collection.insertOne({
            name: testUser.name,
            email: testUser.email,
            password: hashedPassword,
            role: testUser.role,
            phone: testUser.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("Created test user: user@test.com / password123");

        // Create expert users and profiles
        for (const data of expertData) {
            // Create user account for expert
            const result = await User.collection.insertOne({
                name: data.name,
                email: data.email.toLowerCase(),
                password: hashedPassword,
                role: "expert",
                phone: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Create expert profile linked to user
            // Note: blockedSlots is empty by default, meaning ALL slots are available
            const expert = new Expert({
                userId: result.insertedId,
                name: data.name,
                category: data.category,
                experience: data.experience,
                rating: data.rating,
                bio: data.bio,
                profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.toLowerCase().replace(/\s/g, "")}`,
                blockedSlots: [],  // All slots available by default
            });
            await expert.save();
        }

        console.log(`Seeded ${expertData.length} experts with user accounts and time slots`);
        console.log("\n--- Login Credentials ---");
        console.log("Test User:  user@test.com / password123");
        console.log("All Experts: [firstname]@expert.com / password123");
        console.log("Example:    sarah@expert.com / password123");

        await mongoose.disconnect();
        console.log("\nDone! Disconnected from MongoDB.");
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seed();
