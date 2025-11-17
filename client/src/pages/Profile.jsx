import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FILE_BASE_URL = API_URL.replace(/\/api$/, '');

const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `${FILE_BASE_URL}${avatar}`;
};

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }));
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? getAvatarUrl(user.avatar) : ''
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Keep local state in sync when user data (including avatar) changes
  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setAvatarPreview(user.avatar ? getAvatarUrl(user.avatar) : '');
    setAvatarFile(null);
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let latestUser;

      // Update basic profile info (including email)
      const profileRes = await api.put('/users/me', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });
      latestUser = profileRes.data.user;

      // Upload avatar if selected
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);
        const avatarRes = await api.put('/users/me/avatar', formDataUpload);
        latestUser = avatarRes.data.user;
      }

      if (latestUser) {
        updateUser(latestUser);
        setAvatarPreview(
          latestUser.avatar ? getAvatarUrl(latestUser.avatar) : avatarPreview
        );
        setFormData((prev) => ({
          ...prev,
          name: latestUser.name || prev.name,
          email: latestUser.email || prev.email,
          phone: latestUser.phone || prev.phone
        }));
      }

      alert('Profile updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 mb-8">
          View and update your account information.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete="on"
          >
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-500">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block text-sm text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG up to 2MB.
                </p>
              </div>
            </div>
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="profile-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;


