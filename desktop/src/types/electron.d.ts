export {};

declare global {
  interface Window {
    rk?: {
      openExternal: (url: string) => Promise<boolean>;
      listPrinters: () => Promise<Array<{ name: string; isDefault: boolean }>>;

      printReceiptHtml: (payload: { html: string; silent?: boolean; deviceName?: string }) => Promise<boolean>;
      exportPdfFromHtml: (payload: { html: string; defaultFileName?: string }) => Promise<{ saved: boolean; filePath?: string }>;

      // ✅ NEW
      printThermalBill: (payload: { printerInterface: string; paperWidth: string; bill: any }) => Promise<boolean>;

      // existing (if used)
      printThermalReport: (payload: any) => Promise<boolean>;
      printThermalItemDetailsReport: (payload: any) => Promise<boolean>;
    };
  }
}