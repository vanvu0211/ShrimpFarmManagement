import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaArrowUp, FaArrowDown, FaTrash, FaPaperPlane, FaTimes } from 'react-icons/fa';

const MemberModal = ({ isOpen, onClose, members, farmId, callApi, FarmRequestApi }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const userEmail = localStorage.getItem('email');
  const userRole = members.find((member) => member.email === userEmail)?.role || 0;

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email không được để trống!');
      return;
    }

    setLoading(true);

    const data = {
      inviteEmail: inviteEmail.trim(),
      email: userEmail,
      farmId,
    };

    callApi(
      [FarmRequestApi.farmRequest.invite(data)],
      (res) => {
        toast.success('Mời thành viên thành công!');
        setInviteEmail('');
        onClose(true);
        setLoading(false);
      },
      (err) => {
        console.error('Invite error:', err);
        setLoading(false);
      }
    );
  };

  const handleRemove = (email) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${email}?`)) return;

    setActionLoading((prev) => ({ ...prev, [`remove-${email}`]: true }));

    const data = {
      email: userEmail,
      removeEmail: email,
      farmId,
    };

    callApi(
      [FarmRequestApi.farmRequest.remove(data)],
      (res) => {
        toast.success('Xóa thành viên thành công!');
        onClose(true);
        setActionLoading((prev) => ({ ...prev, [`remove-${email}`]: false }));
      },
      (err) => {
        console.error('Remove error:', err);
        setActionLoading((prev) => ({ ...prev, [`remove-${email}`]: false }));
      }
    );
  };

  const handleUpdateRole = (email, currentRole) => {
    const newRole = currentRole === 1 ? 0 : 1;
    const action = newRole === 1 ? 'nâng' : 'giảm';

    if (!window.confirm(`Bạn có chắc chắn muốn ${action} quyền cho ${email}?`)) return;

    setActionLoading((prev) => ({ ...prev, [`update-${email}`]: true }));

    const data = {
      email: userEmail,
      updateEmail: email,
      role: newRole,
      farmId,
    };

    callApi(
      [FarmRequestApi.farmRequest.updateRole(data)],
      (res) => {
        toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} quyền thành công!`);
        onClose(true);
        setActionLoading((prev) => ({ ...prev, [`update-${email}`]: false }));
      },
      (err) => {
        console.error('Update role error:', err);
        setActionLoading((prev) => ({ ...prev, [`update-${email}`]: false }));
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full">
        <h2 className="text-2xl font-bold text-teal-800 mb-6">Quản lý thành viên</h2>

        {userRole !== 0 && (
          <form onSubmit={handleInvite} className="mb-6">
            <div className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Nhập email để mời"
                className="flex-grow p-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700"
                disabled={loading}
              />
              <button
                type="submit"
                className={`p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
                title="Gửi lời mời"
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
                    Đang gửi...
                  </>
                ) : (
                  <FaPaperPlane className="text-lg" />
                )}
              </button>
            </div>
          </form>
        )}

        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-teal-100 text-teal-800">
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Vai trò</th>
                <th className="p-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-3 text-center text-gray-500">
                    Chưa có thành viên nào.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.email}
                    className={`border-b ${
                      member.email === userEmail ? 'bg-teal-100 font-semibold' : 'bg-white'
                    } hover:bg-teal-50`}
                  >
                    <td className="p-3">{member.email}</td>
                    <td className="p-3">
                      {member.role === 2 && (
                        <span className="inline-block text-xs bg-teal-600 text-white px-3 py-1 rounded w-20 text-center">
                          Admin
                        </span>
                      )}
                      {member.role === 1 && (
                        <span className="inline-block text-xs bg-blue-500 text-white px-3 py-1 rounded w-20 text-center">
                          Manager
                        </span>
                      )}
                      {member.role === 0 && (
                        <span className="inline-block text-xs bg-gray-500 text-white px-3 py-1 rounded w-20 text-center">
                          Member
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {member.email !== userEmail && (
                        <div className="flex justify-end gap-2">
                          {/* Admin (role = 2) có thể thao tác với role 0 và 1 */}
                          {userRole === 2 && member.role !== 2 && (
                            <>
                              <button
                                onClick={() => handleUpdateRole(member.email, member.role)}
                                className={`p-2 ${
                                  member.role === 0
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-yellow-500 hover:bg-yellow-600'
                                } text-white rounded-lg transition-all hover:-translate-y-1 active:scale-95 ${
                                  actionLoading[`update-${member.email}`]
                                    ? 'opacity-70 cursor-not-allowed'
                                    : ''
                                }`}
                                title={member.role === 0 ? 'Nâng vai trò' : 'Giảm vai trò'}
                                disabled={actionLoading[`update-${member.email}`]}
                              >
                                {actionLoading[`update-${member.email}`] ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
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
                                ) : member.role === 0 ? (
                                  <FaArrowUp className="text-lg" />
                                ) : (
                                  <FaArrowDown className="text-lg" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRemove(member.email)}
                                className={`p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all hover:-translate-y-1 active:scale-95 ${
                                  actionLoading[`remove-${member.email}`]
                                    ? 'opacity-70 cursor-not-allowed'
                                    : ''
                                }`}
                                title="Xóa thành viên"
                                disabled={actionLoading[`remove-${member.email}`]}
                              >
                                {actionLoading[`remove-${member.email}`] ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
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
                                ) : (
                                  <FaTrash className="text-lg" />
                                )}
                              </button>
                            </>
                          )}
                          {/* Manager (role = 1) chỉ có thể nâng role 0 */}
                          {userRole === 1 && member.role === 0 && (
                            <button
                              onClick={() => handleUpdateRole(member.email, member.role)}
                              className={`p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:-translate-y-1 active:scale-95 ${
                                actionLoading[`update-${member.email}`]
                                  ? 'opacity-70 cursor-not-allowed'
                                  : ''
                              }`}
                              title="Nâng vai trò"
                              disabled={actionLoading[`update-${member.email}`]}
                            >
                              {actionLoading[`update-${member.email}`] ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
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
                              ) : (
                                <FaArrowUp className="text-lg" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => onClose()}
          className="mt-6 w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95"
          title="Đóng"
        >
          <FaTimes className="mr-2 text-lg" /> Đóng
        </button>
      </div>
    </div>
  );
};

export default MemberModal;