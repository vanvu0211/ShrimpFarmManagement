import React, { useState } from 'react';
import { toast } from 'react-toastify';

const MemberModal = ({ isOpen, onClose, members, farmId, callApi, FarmRequestApi }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const userEmail = localStorage.getItem('email'); // Get the logged-in user's email

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email không được để trống!');
      return;
    }

    setLoading(true); // Set loading to true when the invite starts

    const data = {
      email: inviteEmail.trim(),
      farmId,
    };

    callApi(
      [FarmRequestApi.farmRequest.invite(data)],
      (res) => {
        toast.success('Mời thành viên thành công!');
        setInviteEmail('');
        console.log(res);
        onClose(true);
        setLoading(false); // Reset loading state on success
      },
      (err) => {
        console.error('Invite error:', err);
        setLoading(false); // Reset loading state on error
      }
    );
  };

  const handleRemove = (email) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${email}?`)) return;

    const data = {
      email,
      farmId,
    };

    callApi(
      [FarmRequestApi.farmRequest.remove(data)],
      (res) => {
        toast.success('Xóa thành viên thành công!');
        onClose(true);
      },
      (err) => {
        console.error('Remove error:', err);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-xl font-bold text-teal-700 mb-4">Danh sách thành viên</h2>
        
        <form onSubmit={handleInvite} className="mb-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Nhập email để mời"
              className="flex-grow p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading} // Disable input during loading
            />
            <button
              type="submit"
              className={`px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={loading} // Disable button during loading
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang mời...
                </>
              ) : (
                'Mời'
              )}
            </button>
          </div>
        </form>

        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {members.length === 0 ? (
            <p className="text-gray-500">Chưa có thành viên nào.</p>
          ) : (
            members.map((member) => (
              <li
                key={member.email}
                className="flex justify-between items-center p-2 bg-teal-50 rounded-lg"
              >
                <div>
                  <span className="font-medium">{member.email}</span>
                  {member.isAdmin && (
                    <span className="ml-2 text-xs bg-teal-600 text-white px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
                {!member.isAdmin && member.email !== userEmail && (
                  <button
                    onClick={() => handleRemove(member.email)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                )}
              </li>
            ))
          )}
        </ul>

        <button
          onClick={() => onClose()}
          className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default MemberModal;