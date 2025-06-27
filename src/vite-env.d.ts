/// <reference types="vite/client" />

declare global {
  const algosdk: typeof import('algosdk');
  const Purchases: typeof import('@revenuecat/purchases-js');
}

export {};