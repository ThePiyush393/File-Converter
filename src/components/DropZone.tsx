import { useRef, useState, type DragEvent, type ChangeEvent, type ReactNode } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  icon?: ReactNode;
}

export default function DropZone({ onFiles, accept = '*/*', multiple = false, label, sublabel, icon }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);

  const handle = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFiles(multiple ? Array.from(files) : [files[0]]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDragover(false);
    handle(e.dataTransfer.files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => handle(e.target.files);

  return (
    <div
      className={`dropzone${dragover ? ' dragover' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={onDrop}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={onChange} />
      <div className="dropzone-icon">
        {icon ?? <UploadCloud size={48} />}
      </div>
      <h3>{label ?? 'Drop files here'}</h3>
      <p>{sublabel ?? 'or click to browse from your device'}</p>
      <span className="dropzone-btn">
        <UploadCloud size={15} /> Choose File{multiple ? 's' : ''}
      </span>
    </div>
  );
}
