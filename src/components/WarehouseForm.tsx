import { useState } from 'react';

type WarehouseFormProps = {
  onClose: () => void;
  onSubmit: (data: { warehouseName: string; plant: string; location: string; pic: string }) => void;
};

const WarehouseForm = ({ onClose, onSubmit }: WarehouseFormProps) => {
  const [warehouseName, setWarehouseName] = useState('');
  const [plant, setPlant] = useState('');
  const [location, setLocation] = useState('');
  const [pic, setPic] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseName || !plant || !location || !pic) {
      setError('Please fill in all fields.');
      return;
    }

    onSubmit({ warehouseName, plant, location, pic });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="warehouseName" className="block text-sm font-medium text-gray-700">
          Warehouse Name
        </label>
        <input
          type="text"
          id="warehouseName"
          value={warehouseName}
          onChange={(e) => setWarehouseName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="plant" className="block text-sm font-medium text-gray-700">
          Plant
        </label>
        <input
          type="text"
          id="plant"
          value={plant}
          onChange={(e) => setPlant(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location Warehouse
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="pic" className="block text-sm font-medium text-gray-700">
          PIC
        </label>
        <input
          type="text"
          id="pic"
          value={pic}
          onChange={(e) => setPic(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default WarehouseForm;
