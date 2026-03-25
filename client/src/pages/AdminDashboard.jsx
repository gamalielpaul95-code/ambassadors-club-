import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Users, Megaphone, MessageSquare, Edit, LogOut, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const AdminDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);
    newSocket.emit('join-admin');

    newSocket.on('new-feedback', (data) => {
      toast.success('New feedback received!');
      fetchFeedbacks();
    });

    return () => newSocket.close();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(data.members);
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(data.announcements);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(data.feedbacks);
    } catch (error) {
      toast.error('Failed to fetch feedbacks');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
        newAnnouncement,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Announcement sent successfully!');
      setNewAnnouncement({ title: '', content: '', priority: 'normal' });
      fetchAnnouncements();
      if (socket) {
        socket.emit('send-announcement', data.announcement);
      }
    } catch (error) {
      toast.error('Failed to send announcement');
    }
  };

  const handleEditMember = async (memberId, updates) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/members/${memberId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Member updated successfully');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update member');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'members') fetchMembers();
    if (activeTab === 'announcements') fetchAnnouncements();
    if (activeTab === 'feedback') fetchFeedbacks();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Crown size={32} className="text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-emerald-200">Ambassadors Club - Balili SDA</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold">{user?.fullName}</p>
              <p className="text-sm text-emerald-200">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-emerald-700 rounded-lg transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-2 shadow">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'members' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={20} />
            <span>Members</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'announcements' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Megaphone size={20} />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'feedback' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={20} />
            <span>Feedback</span>
          </button>
        </div>

        {/* Members Management */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Club Members</h2>
              <p className="text-gray-500">Manage all ambassadors club members</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.profilePicture}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{member.fullName}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{member.memberId}</td>
                      <td className="px-6 py-4 text-gray-600">{member.phone}</td>
                      <td className="px-6 py-4">
                        <select
                          value={member.position}
                          onChange={(e) => handleEditMember(member._id, { position: e.target.value })}
                          className="px-2 py-1 border rounded-lg text-sm"
                        >
                          <option value="Member">Member</option>
                          <option value="Ambassador">Ambassador</option>
                          <option value="Leader">Leader</option>
                          <option value="Coordinator">Coordinator</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditMember(member._id, { isActive: !member.isActive })}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Announcements Form */}
        {activeTab === 'announcements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Send Announcement</h2>
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <textarea
                  placeholder="Announcement Content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Send Announcement
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Announcements</h3>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="border-l-4 border-emerald-500 pl-4 py-2">
                    <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
                    <p className="text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Management */}
        {activeTab === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Member Feedback</h2>
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{feedback.member?.fullName}</p>
                      <p className="text-sm text-gray-500">{feedback.subject}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{feedback.message}</p>
                  <textarea
                    placeholder="Write a reply..."
                    className="mt-3 w-full px-3 py-2 border rounded-lg"
                    rows="2"
                  />
                  <button className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
                    Reply
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer with Designed by */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Designed by <span className="text-emerald-600 font-semibold">Gamaliel Protech</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            © {new Date().getFullYear()} Ambassadors Club - Balili SDA Church | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
