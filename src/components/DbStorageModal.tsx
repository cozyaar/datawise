'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Folder,
  HardDrive,
  Terminal,
  Copy,
  Check,
  X,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface DbStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbStorageModal: React.FC<DbStorageModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/db-storage')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setData(json);
          }
        })
        .catch((err) => console.error('Failed to load storage info:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d0f14] border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 bg-[#090b10] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Database className="h-4 w-4 text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-100">PostgreSQL Physical Storage &amp; Engine Inspector</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-emerald-400 border border-zinc-700">
                  Local Engine Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Authoritative verification of local disk paths, configuration files, and table relation files.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="py-16 text-center text-zinc-400 text-xs">
              Inspecting PostgreSQL system catalogs and filesystem...
            </div>
          ) : data ? (
            <>
              {/* Primary Location Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Data Directory Card */}
                <div className="p-3.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-zinc-300 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Folder className="h-4 w-4 text-emerald-400" />
                      PostgreSQL Data Directory on Local Disk
                    </span>
                    <button
                      onClick={() => handleCopy(data.storage.dataDirectory, 'dataDir')}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'dataDir' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'dataDir' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 font-mono text-xs text-zinc-200 break-all border border-zinc-800">
                    {data.storage.dataDirectory}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Windows system folder storing tablespaces, heap blocks, and write-ahead logs.
                  </p>
                </div>

                {/* Database Subfolder Card */}
                <div className="p-3.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-zinc-300 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <HardDrive className="h-4 w-4 text-indigo-400" />
                      &ldquo;datawise&rdquo; Database Physical Subfolder
                    </span>
                    <button
                      onClick={() => handleCopy(data.storage.databaseSubfolder, 'dbSub')}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'dbSub' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'dbSub' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 font-mono text-xs text-zinc-200 break-all border border-zinc-800">
                    {data.storage.databaseSubfolder}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Database OID: <strong className="text-zinc-200 font-mono">{data.storage.databaseOid}</strong> | Disk Footprint: <strong className="text-emerald-400 font-mono">{data.storage.databaseSize}</strong>
                  </p>
                </div>
              </div>

              {/* Quick Connection Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Port &amp; Host</span>
                  <div className="font-mono font-bold text-zinc-200">127.0.0.1:{data.server.port}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Active Database</span>
                  <div className="font-mono font-bold text-emerald-400">{data.server.database}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Total DB Disk Size</span>
                  <div className="font-mono font-bold text-zinc-200">{data.storage.databaseSize}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Connected User</span>
                  <div className="font-mono font-bold text-zinc-200">{data.server.user}</div>
                </div>
              </div>

              {/* Physical Table Files Ledger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Physical Table Storage Files (pg_relation_filepath)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Relative to data directory</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#08090d]">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-[#0c0e14] text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                      <tr>
                        <th className="px-3.5 py-2">Table Name</th>
                        <th className="px-3.5 py-2">Relative File Path</th>
                        <th className="px-3.5 py-2 text-right">Table Size</th>
                        <th className="px-3.5 py-2 text-right">Index Size</th>
                        <th className="px-3.5 py-2 text-right">Total Disk Footprint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
                      {data.tables.map((t: any) => (
                        <tr key={t.table_name} className="hover:bg-zinc-900/50">
                          <td className="px-3.5 py-1.5 font-semibold text-zinc-200">{t.table_name}</td>
                          <td className="px-3.5 py-1.5 text-zinc-400">{t.file_path}</td>
                          <td className="px-3.5 py-1.5 text-right text-zinc-400">{t.table_size}</td>
                          <td className="px-3.5 py-1.5 text-right text-zinc-400">{t.index_size}</td>
                          <td className="px-3.5 py-1.5 text-right text-emerald-400 font-semibold">{t.total_size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terminal Verification Commands */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Terminal Verification Commands (Engine Proof)</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                      <span>1. Connect via psql:</span>
                      <button
                        onClick={() => handleCopy(data.cliCommands.psqlConnect, 'cmd1')}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {copiedKey === 'cmd1' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-zinc-200 text-[11px] block">{data.cliCommands.psqlConnect}</code>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#08090d] border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                      <span>2. Query data directory:</span>
                      <button
                        onClick={() => handleCopy(data.cliCommands.showDataDir, 'cmd2')}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {copiedKey === 'cmd2' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-zinc-200 text-[11px] block">{data.cliCommands.showDataDir}</code>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-rose-400 text-xs">
              Failed to connect to PostgreSQL storage catalogs.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#090b10] flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>PostgreSQL 18.6 MSVC x64 instance verified</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
