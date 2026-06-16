export {};

declare global {
  interface Window {
    rk?: {
      openExternal: (url: string) => Promise<boolean>;
      printReceiptHtml: (payload: { html: string }) => Promise<boolean>;
      printThermalReport: (payload: {
        printerInterface: string;
        paperWidth: string;
        from: string;
        to: string;
        summary: any;
        items: any[];
      }) => Promise<boolean>;
    };
  }
}