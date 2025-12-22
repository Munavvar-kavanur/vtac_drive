'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession, getSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData) {
    await dbConnect();

    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return { success: false, error: 'Invalid credentials' };
        }

        // Compare password (assuming user.password is hash)
        // Note: For existing plain text passwords in demo/mock, this might fail unless we reset them.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return { success: false, error: 'Invalid credentials' };
        }

        await createSession(user._id.toString(), user.name, user.email);
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Something went wrong.' };
    }

    redirect('/dashboard');
}

export async function register(formData) {
    await dbConnect();

    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!name || !email || !password) {
        return { success: false, error: 'All fields are required' };
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { success: false, error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        await createSession(newUser._id.toString(), newUser.name, newUser.email);

    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Registration failed.' };
    }

    redirect('/dashboard');
}

export async function logout() {
    (await cookies()).delete('session');
    redirect('/login');
}
