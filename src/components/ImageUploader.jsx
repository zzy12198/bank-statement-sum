import {
  Ban,
  Camera,
  ImagePlus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  X
} from 'lucide-react';

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,image/jpeg,image/png';

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-slate-100 text-slate-700',
    processing: 'bg-amber-100 text-amber-800',
    done: 'bg-emerald-100 text-emerald-800',
    error: 'bg-rose-100 text-rose-800'
  };

  const labels = {
    pending: '等待识别',
    processing: '识别中',
    done: '已完成',
    error: '识别失败'
  };

  return <span className={`badge ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
}

export default function ImageUploader({
  images,
  isProcessing,
  onFilesSelected,
  onRemoveImage,
  onRecognizeImage,
  onCancelImageAmounts,
  onClearAll
}) {
  const uploadLabelClass = isProcessing
    ? 'btn-primary pointer-events-none opacity-60'
    : 'btn-primary cursor-pointer';
  const cameraLabelClass = isProcessing
    ? 'btn-secondary pointer-events-none opacity-60'
    : 'btn-secondary cursor-pointer';

  const handleInput = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 0) {
      onFilesSelected(selected);
    }
    event.target.value = '';
  };

  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-teal-800">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-950">上传银行流水图片</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            支持 jpg、jpeg、png，可一次上传多张。图片只在本地浏览器中处理，不会上传到服务器。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={uploadLabelClass}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            选择图片
            <input
              className="hidden"
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              disabled={isProcessing}
              onChange={handleInput}
            />
          </label>
          <label className={cameraLabelClass}>
            <Camera className="h-4 w-4" aria-hidden="true" />
            手机拍照
            <input
              className="hidden"
              type="file"
              accept="image/*"
              capture="environment"
              disabled={isProcessing}
              onChange={handleInput}
            />
          </label>
          <button
            className="btn-danger"
            type="button"
            onClick={onClearAll}
            disabled={images.length === 0 || isProcessing}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            清空全部
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
        <div className="flex gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            请自行核对识别结果，软件只做辅助统计。默认本地 OCR，不保存用户图片，不上传银行流水到云端。
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="aspect-[4/3] overflow-hidden rounded-md bg-white">
                <img
                  className="h-full w-full object-contain"
                  src={image.previewUrl}
                  alt={`${image.label} 预览`}
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{image.label}</p>
                  <p className="truncate text-xs text-slate-500" title={image.name}>
                    {image.name}
                  </p>
                </div>
                <StatusBadge status={image.status} />
              </div>
              {image.status === 'processing' && (
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-teal-600 transition-all"
                    style={{ width: `${Math.round(image.progress || 8)}%` }}
                  />
                </div>
              )}
              {image.error && <p className="mt-2 text-xs text-rose-700">{image.error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="btn-secondary px-3 py-1.5"
                  type="button"
                  onClick={() => onRecognizeImage(image.id)}
                  disabled={isProcessing}
                  title="重新识别此图片"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  重识别
                </button>
                <button
                  className="btn-secondary px-3 py-1.5"
                  type="button"
                  onClick={() => onCancelImageAmounts(image.id)}
                  disabled={isProcessing}
                  title="取消此图片的全部金额"
                >
                  <Ban className="h-4 w-4" aria-hidden="true" />
                  取消金额
                </button>
                <button
                  className="btn-danger px-3 py-1.5"
                  type="button"
                  onClick={() => onRemoveImage(image.id)}
                  disabled={isProcessing}
                  title="删除此图片和对应金额"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
