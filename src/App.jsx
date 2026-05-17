import { useCallback, useMemo, useRef, useState } from 'react';
import AmountTable from './components/AmountTable.jsx';
import ExportButtons from './components/ExportButtons.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import OCRResult from './components/OCRResult.jsx';
import SummaryCard from './components/SummaryCard.jsx';
import { calculateSummary, createId, parseAmounts } from './utils/amountParser.js';
import { processImages } from './utils/ocr.js';

const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png']);

function createImageEntry(file, imageIndex) {
  return {
    id: createId('image'),
    name: file.name,
    file,
    previewUrl: URL.createObjectURL(file),
    status: 'pending',
    progress: 0,
    text: '',
    error: '',
    label: `图片${imageIndex}`
  };
}

export default function App() {
  const [images, setImages] = useState([]);
  const [records, setRecords] = useState([]);
  const [filterImageId, setFilterImageId] = useState('all');
  const [ocrStatus, setOcrStatus] = useState({ running: false, current: 0, total: 0 });
  const nextImageIndex = useRef(1);

  const summary = useMemo(() => calculateSummary(records), [records]);

  const updateImage = useCallback((imageId, patch) => {
    setImages((current) =>
      current.map((image) => (image.id === imageId ? { ...image, ...patch } : image))
    );
  }, []);

  const recognizeEntries = useCallback(
    async (entries) => {
      if (entries.length === 0) {
        return;
      }

      setOcrStatus({ running: true, current: 1, total: entries.length });

      await processImages(entries, {
        onImageStart: ({ entry, index, total }) => {
          setOcrStatus({ running: true, current: index + 1, total });
          updateImage(entry.id, {
            status: 'processing',
            progress: 5,
            error: ''
          });
        },
        onImageProgress: ({ entry, progress }) => {
          const percent = Math.max(5, Math.round((progress?.progress || 0) * 100));
          updateImage(entry.id, { progress: percent });
        },
        onImageSuccess: ({ entry, text }) => {
          updateImage(entry.id, {
            status: 'done',
            progress: 100,
            text,
            error: ''
          });

          const parsed = parseAmounts(text, {
            imageId: entry.id,
            imageName: entry.name,
            sourceImageLabel: entry.label
          });

          setRecords((current) => [
            ...current.filter((record) => record.imageId !== entry.id),
            ...parsed
          ]);
        },
        onImageError: ({ entry, error }) => {
          updateImage(entry.id, {
            status: 'error',
            progress: 0,
            error: error?.message || 'OCR 识别失败，请尝试更清晰的图片。'
          });
        }
      });

      setOcrStatus({ running: false, current: 0, total: 0 });
    },
    [updateImage]
  );

  const handleFilesSelected = useCallback(
    (files) => {
      const acceptedFiles = files.filter((file) => SUPPORTED_TYPES.has(file.type));
      const newImages = acceptedFiles.map((file) => {
        const entry = createImageEntry(file, nextImageIndex.current);
        nextImageIndex.current += 1;
        return entry;
      });

      if (newImages.length === 0) {
        return;
      }

      setImages((current) => [...current, ...newImages]);
      recognizeEntries(newImages);
    },
    [recognizeEntries]
  );

  const removeImage = useCallback(
    (imageId) => {
      setImages((current) => {
        const removed = current.find((image) => image.id === imageId);
        if (removed) {
          URL.revokeObjectURL(removed.previewUrl);
        }
        return current.filter((image) => image.id !== imageId);
      });
      setRecords((current) => current.filter((record) => record.imageId !== imageId));
      if (filterImageId === imageId) {
        setFilterImageId('all');
      }
    },
    [filterImageId]
  );

  const recognizeSingleImage = useCallback(
    (imageId) => {
      const image = images.find((item) => item.id === imageId);
      if (image) {
        recognizeEntries([image]);
      }
    },
    [images, recognizeEntries]
  );

  const cancelImageAmounts = useCallback((imageId) => {
    setRecords((current) =>
      current.map((record) => (record.imageId === imageId ? { ...record, included: false } : record))
    );
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setRecords([]);
    setFilterImageId('all');
    setOcrStatus({ running: false, current: 0, total: 0 });
    nextImageIndex.current = 1;
  }, [images]);

  const addRecord = useCallback(
    (draft) => {
      const source = images.find((image) => image.id === draft.imageId);
      const isManual = draft.imageId === 'manual' || !source;

      setRecords((current) => [
        ...current,
        {
          id: createId(),
          imageId: isManual ? 'manual' : source.id,
          imageName: isManual ? '手动新增' : source.name,
          sourceImageLabel: isManual ? '手动新增' : source.label,
          rawText: draft.rawText || '手动新增金额',
          amount: Math.abs(Number(draft.amount) || 0),
          type: draft.type,
          included: true,
          createdAt: new Date().toISOString()
        }
      ]);
    },
    [images]
  );

  const updateRecord = useCallback((recordId, patch) => {
    setRecords((current) =>
      current.map((record) => (record.id === recordId ? { ...record, ...patch } : record))
    );
  }, []);

  const toggleIncluded = useCallback((recordId, included) => {
    setRecords((current) =>
      current.map((record) => (record.id === recordId ? { ...record, included } : record))
    );
  }, []);

  const deleteRecord = useCallback((recordId) => {
    setRecords((current) => current.filter((record) => record.id !== recordId));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="py-2">
          <p className="text-sm font-semibold text-teal-700">本地 OCR · 多图片合并统计 · PWA</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">银行流水图片金额自动汇总</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            上传银行流水截图或照片，系统在本地浏览器识别文字并提取金额。你可以逐条核对、编辑、取消计入，再导出汇总结果。
          </p>
        </header>

        <ImageUploader
          images={images}
          isProcessing={ocrStatus.running}
          onFilesSelected={handleFilesSelected}
          onRemoveImage={removeImage}
          onRecognizeImage={recognizeSingleImage}
          onCancelImageAmounts={cancelImageAmounts}
          onClearAll={clearAll}
        />

        <OCRResult images={images} ocrStatus={ocrStatus} />

        <SummaryCard summary={summary} />

        <AmountTable
          records={records}
          images={images}
          filterImageId={filterImageId}
          onFilterChange={setFilterImageId}
          onToggleIncluded={toggleIncluded}
          onUpdateRecord={updateRecord}
          onDeleteRecord={deleteRecord}
          onAddRecord={addRecord}
          onCancelImageAmounts={cancelImageAmounts}
        />

        <ExportButtons records={records} summary={summary} />
      </div>
    </main>
  );
}
