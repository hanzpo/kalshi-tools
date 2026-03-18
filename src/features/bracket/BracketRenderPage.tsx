import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createDefaultConfig, decodeBracket } from './bracketData';
import { BracketPreview } from './BracketPreview';

export default function BracketRenderPage() {
  const [searchParams] = useSearchParams();
  const [fontsReady, setFontsReady] = useState(false);

  const config = useMemo(() => {
    const encoded = searchParams.get('b');
    if (!encoded) {
      return createDefaultConfig();
    }

    return decodeBracket(encoded) ?? createDefaultConfig();
  }, [searchParams]);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  if (!fontsReady) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0d0c] p-6">
      <BracketPreview config={config} onPick={() => undefined} />
    </div>
  );
}
