import React from "react";
import Button from "../../../../components/ui/Button";

const PengumumanDetailDialog = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        {/* HEADER: Menggunakan Blue-50 dan text-gray-800 */}
        <div className="px-6 py-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">📄 Detail Pengumuman</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-6">
            <div>
              {/* Label menggunakan aksen Blue-600 */}
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Judul</label>
              <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{data.judul}</h1>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Isi Pengumuman</label>
              {/* Background isi menggunakan Gray-50 */}
              <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                {data.isi}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-white flex justify-end">
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

export default PengumumanDetailDialog;