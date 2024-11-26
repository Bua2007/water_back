import { updateUser } from '../services/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getCurrentUser } from '../services/user.js';


export const updateUserController = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    const { ...userData } = req.body;
    const avatar = req.file ? await saveFileToCloudinary(req.file) : null;

    const updatedUser = await updateUser(req.user._id, { ...userData, avatar });

    res.json({
        status: 200,
        message: 'User was updated',
        data: updatedUser,
    });
};

export const getCurrentUserController = async (req, res) => {

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    const userId = req.user._id;

    const user = await getCurrentUser({ userId });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        status: 200,
        message: 'Successfully found user!',
        data: user,
    });
};
