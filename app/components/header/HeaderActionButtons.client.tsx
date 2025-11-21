import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { DeployButton } from '~/components/deploy/DeployButton';
import { toast } from 'react-toastify';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted: _chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];

  const shouldShowButtons = activePreview;

  // --- FUNGSI BARU: HARD RESET ---
  const handleHardReset = async () => {
    if (!confirm('⚠️ Peringatan: Ini akan menghapus semua data chat lokal dan mereset aplikasi untuk memperbaiki error. Lanjutkan?')) {
      return;
    }

    try {
      // 1. Hapus Local Storage
      localStorage.clear();

      // 2. Hapus IndexedDB (Database lokal browser)
      if (window.indexedDB && window.indexedDB.databases) {
        const dbs = await window.indexedDB.databases();
        dbs.forEach((db) => {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        });
      }

      // 3. Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      toast.success('Reset berhasil! Reloading...');
      
      // 4. Reload Halaman
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Gagal melakukan reset:', error);
      toast.error('Gagal reset otomatis. Silakan refresh manual.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Deploy Button */}
      {shouldShowButtons && <DeployButton />}

      {/* TOMBOL BARU: HARD RESET (Warna Merah) */}
      <button
        onClick={handleHardReset}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        title="Hard Reset App (Fix Crashes)"
      >
        <div className="i-ph:trash" />
        <span>Reset App</span>
      </button>

      {/* Debug Tools Original */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm">
          <button
            onClick={() =>
              window.open('https://github.com/stackblitz-labs/bolt.diy/issues/new?template=bug_report.yml', '_blank')
            }
            className="rounded-l-md items-center justify-center px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent hover:bg-bolt-elements-button-primary-backgroundHover flex gap-1.5"
            title="Report Bug"
          >
            <div className="i-ph:bug" />
          </button>
          <div className="w-px bg-bolt-elements-borderColor" />
          <button
            onClick={async () => {
              try {
                const { downloadDebugLog } = await import('~/utils/debugLogger');
                await downloadDebugLog();
              } catch (error) {
                console.error('Failed to download debug log:', error);
              }
            }}
            className="rounded-r-md items-center justify-center px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent hover:bg-bolt-elements-button-primary-backgroundHover flex gap-1.5"
            title="Download Debug Log"
          >
            <div className="i-ph:download" />
          </button>
        </div>
      )}
    </div>
  );
}
