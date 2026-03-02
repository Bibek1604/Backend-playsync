import { User } from '../modules/auth/auth.model';
import { signAccessToken } from '../Share/config/jwt';

export const createTestUser = async (userOverrides = {}) => {
    const defaultUser = {
        fullName: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
    };

    const userData = { ...defaultUser, ...userOverrides };
    const user = await User.create(userData);

    const token = signAccessToken({ id: user._id.toString(), role: user.role });

    return { user, token };
};

export const clearUsers = async () => {
    await User.deleteMany({});
};
