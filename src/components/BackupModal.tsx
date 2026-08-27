import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppData } from '../types';
import { exportBackupJSON, importBackupJSON } from '../storage';
import { INITIAL_DEMO_DATA } from '../constants';
import { BottomSheet } from './BottomSheet';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onRestoreData: (data: AppData) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  appData,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleExport = () => {
    exportBackupJSON(appData);
    setStatusMsg({ text: '备份文件已成功生成并下载', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importBackupJSON(file);
      onRestoreData(restored);
      setStatusMsg({ text: '数据恢复成功！', type: 'success' });
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ text: err?.message || '文件解析失败', type: 'error' });
    }
    e.target.value = '';
  };

  const handleResetDemo = () => {
    if (confirm('确认重置并载入演示数据？当前所有未导出的数据将被覆盖。')) {
      onRestoreData(INITIAL_DEMO_DATA);
      setStatusMsg({ text: '已恢复初始演示数据', type: 'success' });
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1200);
    }
  };

  const totalItems =
    appData.habits.length + appData.days.length + appData.treeholes.length;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="数据备份与设置">
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">
            当前本地数据汇总
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
            <span>习惯 {appData.habits.length} 项</span>
            <span>日子 {appData.days.length} 个</span>
            <span>树洞 {appData.treeholes.length} 条</span>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="space-y-2.5">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="w-full py-3.5 px-4 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs flex items-center justify-center gap-2 shadow-sm touch-spring"
          >
            <Download className="w-4 h-4" /> 导出 JSON 备份文件
          </button>

          {/* Import button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 px-4 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-medium text-xs flex items-center justify-center gap-2 touch-spring"
          >
            <Upload className="w-4 h-4" /> 导入恢复备份数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          {/* Reset Demo button */}
          <button
            onClick={handleResetDemo}
            className="w-full py-3 px-4 rounded-2xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-rose-500/10 hover:text-rose-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 恢复示例演示数据
          </button>
        </div>

        <p className="text-[11px] text-center text-[var(--md-sys-color-on-surface-variant)] opacity-70">
          数据保存在手机本地离线环境，定期导出备份可保障长久安全。
        </p>
      </div>
    </BottomSheet>
  );
};
