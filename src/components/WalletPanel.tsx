"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { Wallet, Zap, Shield } from "lucide-react";
import { cn } from "@/utils/cn";

export function WalletPanel() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  return (
    <div className="rounded-2xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-purple/10 dark:bg-accent-purple/15">
          <Wallet className="h-3.5 w-3.5 text-accent-purple" />
        </div>
        Wallet Connect
      </h3>

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-xs text-text-muted dark:text-gray-500 leading-relaxed">
            Connect your MetaMask wallet to fund agents and execute real deals on Base Network.
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              const ready = mounted;
              return (
                <button
                  onClick={openConnectModal}
                  disabled={!ready}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                    "bg-accent-purple hover:bg-accent-purple/90 text-white shadow-lg shadow-accent-purple/25 active:scale-[0.98]"
                  )}
                >
                  <Wallet className="h-4 w-4" />
                  Connect MetaMask
                </button>
              );
            }}
          </ConnectButton.Custom>
          <div className="flex items-center gap-2 text-[10px] text-text-muted dark:text-gray-500">
            <Shield className="h-3 w-3" />
            <span>SKALE Base Sepolia — Zero Gas Fees (L2)</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Connected Status */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-medium text-accent-green">Connected</span>
          </div>

          {/* Address */}
          <div className="rounded-xl bg-surface-secondary dark:bg-gray-700/50 p-3">
            <p className="text-[10px] text-text-muted dark:text-gray-500 mb-1">Address</p>
            <p className="text-xs font-mono font-medium text-text-primary dark:text-gray-200 truncate">
              {address}
            </p>
          </div>

          {/* Balance & Chain */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-accent-green/5 dark:bg-accent-green/10 px-3 py-2.5">
              <p className="text-[10px] text-text-muted dark:text-gray-500 mb-0.5">Balance</p>
              <p className="text-sm font-bold text-accent-green">
                {balance ? parseFloat(balance.formatted).toFixed(4) : "0"} {balance?.symbol || "ETH"}
              </p>
            </div>
            <div className="rounded-xl bg-accent-blue/5 dark:bg-accent-blue/10 px-3 py-2.5">
              <p className="text-[10px] text-text-muted dark:text-gray-500 mb-0.5">Network</p>
              <p className="text-xs font-semibold text-accent-blue flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {chain?.name || "SKALE Base Sepolia"}
              </p>
            </div>
          </div>

          {/* Disconnect */}
          <ConnectButton.Custom>
            {({ openAccountModal, mounted }) => {
              const ready = mounted;
              return (
                <button
                  onClick={openAccountModal}
                  disabled={!ready}
                  className="w-full text-center text-[11px] text-text-muted dark:text-gray-500 hover:text-accent-red transition-colors py-1"
                >
                  Manage Wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      )}
    </div>
  );
}
