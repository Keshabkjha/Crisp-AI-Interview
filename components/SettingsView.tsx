import React from 'react';

const SettingsView: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400">Microphone</label>
          <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
            <option>Default Microphone</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400">Camera</label>
          <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
            <option>Default Camera</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
