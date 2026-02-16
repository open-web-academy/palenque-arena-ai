import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WagmiProvider, createConfig, http } from "wagmi";
import { monad } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Hub } from "./pages/Hub";
import { ArenaClasicaPage } from "./pages/ArenaClasicaPage";
import { ElementalPage } from "./pages/ElementalPage";
import { RuletaPage } from "./pages/RuletaPage";
import { Layout } from "./components/Layout";
import "./index.css";

const config = createConfig(
  getDefaultConfig({
    appName: "Palenque Arena",
    appDescription: "Cyber Rooster League on Monad",
    appUrl: "https://palenque-arena.vercel.app",
    appIcon: "",
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "",
    chains: [monad],
    transports: {
      [monad.id]: http(import.meta.env.VITE_RPC_URL || "https://rpc.monad.xyz"),
    },
  })
);

function App() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ConnectKitProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Hub />} />
                <Route path="arena-clasica" element={<ArenaClasicaPage />} />
                <Route path="elemental" element={<ElementalPage />} />
                <Route path="ruleta" element={<RuletaPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ConnectKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
