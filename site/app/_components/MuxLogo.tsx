type MuxLogoProps = {
  className?: string;
};

export default function MuxLogo({ className }: MuxLogoProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="70"
      height="19"
      viewBox="0 0 70 19"
    >
      <path
        fill="currentColor"
        d="M10.67 9.73H9.65v2.14h1.02c.34 0 .62-.09.82-.28.2-.19.3-.44.3-.76s-.1-.6-.3-.8c-.2-.2-.47-.3-.82-.3Zm-.05-.8c.31 0 .57-.08.75-.25.18-.17.28-.4.28-.7 0-.3-.09-.52-.28-.69-.19-.17-.43-.25-.75-.25h-.98v1.9h.01l.97-.01Z"
      />
      <path
        fill="currentColor"
        d="M60.54 0H9.46C4.24 0 0 4.23 0 9.45c0 5.22 4.24 9.46 9.46 9.46h51.08c5.22 0 9.46-4.23 9.46-9.46S65.76 0 60.54 0ZM12.21 12.2c-.36.33-.85.49-1.46.49H8.71V6.2h1.91c.61 0 1.09.15 1.45.45.35.3.53.71.53 1.22 0 .36-.09.66-.27.9-.18.24-.42.41-.74.49.36.09.64.27.85.56.21.28.31.63.31 1.05 0 .56-.18 1-.54 1.33Zm4.26-1.9v2.4h-.98v-2.4l-1.93-4.1h1l1.15 2.46a4 4 0 0 1 .19.45c.05.14.08.25.1.32.02-.07.05-.18.1-.32s.11-.29.18-.45L17.4 6.2h1l-1.93 4.1Zm17.8 3.47a1.44 1.44 0 0 1-2.88 0V8.61l-1.86 1.86c-.56.56-1.47.56-2.03 0l-1.86-1.86v5.16a1.44 1.44 0 0 1-2.88 0V5.14c0-.58.35-1.11.89-1.33.54-.22 1.16-.1 1.57.31l3.3 3.3 3.3-3.3c.41-.41 1.03-.53 1.57-.31h-.01c.54.22.89.75.89 1.33v8.63ZM47.3 9.45c0 3.17-2.58 5.75-5.75 5.75s-5.75-2.58-5.75-5.75V5.14a1.44 1.44 0 0 1 2.88 0v4.31a2.88 2.88 0 0 0 5.76 0V5.14c0-.8.64-1.43 1.43-1.44h-.01.02c.79 0 1.43.65 1.43 1.44v4.31h-.01Zm12.32 3.3a1.436 1.436 0 0 1-2.03 2.03l-3.3-3.3-3.3 3.3a1.436 1.436 0 0 1-2.03-2.03l3.3-3.3-3.3-3.3a1.436 1.436 0 0 1 2.03-2.03l3.3 3.3 3.3-3.3a1.436 1.436 0 0 1 2.03 2.03l-3.3 3.3 3.3 3.3Z"
      />
    </svg>
  );
}
