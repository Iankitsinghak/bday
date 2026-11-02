import { useState, type ImgHTMLAttributes } from 'react';
import { Flower2 } from 'lucide-react';

export default function SafeImage({ alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={`photo-fallback ${className}`} role="img" aria-label={alt || 'A photograph from Shalu’s story'} style={props.style}><Flower2 size={30} strokeWidth={1}/><span>A page held for you.</span><small>{alt}</small></div> : <img {...props} className={className} alt={alt} onError={() => setFailed(true)} />;
}
