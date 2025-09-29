declare module 'clipboard-event' {
  const clipboard: {
    on(event: 'change', callback: () => void): void;
    startListening(): void;
    stopListening(): void;
  };
  export default clipboard;
}
