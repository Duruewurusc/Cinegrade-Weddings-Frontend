import { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

const ClientModal = ({ client, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState(client || {
    first_name: '',
    last_name: '',
    email: '',
    event_role: '',
    address: '',
    instagram_handle: '',
    phone: '',
    trad_anniversary: '',
    wedding_anniversary: '',
    spouse_name: '',
    spouse_phone: '',
    spouse_email: '',
    spouse_instagram: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Client' : 
               mode === 'edit' ? 'Edit Client' : 'Client Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="event_role"
                    value={formData.event_role}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Role</option>
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                    <option value="Relation">Relation</option>
                    <option value="Planner">Planner</option>
                  </select>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instagram Handle</label>
                  <input
                    type="text"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Wedding Anniversary</label>
                  <input
                    type="date"
                    name="wedding_anniversary"
                    value={formData.wedding_anniversary}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Traditional Anniversary</label>
                  <input
                    type="date"
                    name="trad_anniversary"
                    value={formData.trad_anniversary}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Spouse Info */}
              {(formData.event_role === 'Bride' || formData.event_role === 'Groom') && (
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Spouse Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spouse Name</label>
                      <input
                        type="text"
                        name="spouse_name"
                        value={formData.spouse_name}
                        onChange={handleChange}
                        disabled={isViewMode}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spouse Phone</label>
                      <input
                        type="tel"
                        name="spouse_phone"
                        value={formData.spouse_phone}
                        onChange={handleChange}
                        disabled={isViewMode}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spouse Email</label>
                      <input
                        type="email"
                        name="spouse_email"
                        value={formData.spouse_email}
                        onChange={handleChange}
                        disabled={isViewMode}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spouse Instagram</label>
                      <input
                        type="text"
                        name="spouse_instagram"
                        value={formData.spouse_instagram}
                        onChange={handleChange}
                        disabled={isViewMode}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isViewMode && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Create Client' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;