import { FileText, Loader2 } from 'lucide-react';

export default function OCRResult({ images, ocrStatus }) {
  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-950">OCR 识别结果</h2>
        </div>
        {ocrStatus.running && (
          <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            正在识别第 {ocrStatus.current}/{ocrStatus.total} 张
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">上传图片后，这里会显示每张图片的识别状态和原始文字。</p>
      ) : (
        <div className="mt-4 space-y-3">
          {images.map((image) => (
            <details key={image.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                {image.label}：{image.name}
              </summary>
              <div className="mt-3 rounded-md bg-white p-3 text-sm text-slate-700">
                {image.text ? (
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words font-sans leading-6">
                    {image.text}
                  </pre>
                ) : (
                  <p className="text-slate-500">
                    {image.status === 'error' ? image.error || '识别失败' : '暂无识别文本'}
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
