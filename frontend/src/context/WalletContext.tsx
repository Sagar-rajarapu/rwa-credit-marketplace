'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import {
  isConnected,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';

interface WalletCtx {
  publicKey: string | null;
  connect: () => Promise<string | undefined>;
  sign: (xdr: string, network: string) => Promise<string>;
}

const WalletContext = createContext<WalletCtx>({
  publicKey: null,
  connect: async () => undefined,
  sign: async () => '',
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = useCallback(async () => {
    // freighter-api v2: isConnected() returns { isConnected: boolean }
    const result = await isConnected();
    if (!result.isConnected) {
      alert('Please install the Freighter wallet extension.');
      return;
    }
    const key = await getPublicKey();
    setPublicKey(key);
    return key;
  }, []);

  const sign = useCallback(
    (xdr: string, network: string) => signTransaction(xdr, { networkPassphrase: network }),
    []
  );

  return (
    <WalletContext.Provider value={{ publicKey, connect, sign }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
