type PlayerStyleLogoProps = {
  className?: string;
  style?: React.CSSProperties;
};

export default function PlayerStyleLogo({ className, style }: PlayerStyleLogoProps) {
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 150 30"
    >
      <path
        fill="currentColor"
        d="M14.664 11.78c.627 1.199.935 2.608.935 4.216s-.314 2.96-.935 4.158c-.628 1.198-1.493 2.127-2.601 2.78-1.109.653-2.37.98-3.78.98-1.147 0-2.146-.211-2.992-.634-.845-.423-1.524-1-2.024-1.723v8.225H0V8.264h2.844l.391 2.3c1.25-1.653 2.934-2.48 5.048-2.48 1.41 0 2.671.32 3.78.955 1.108.634 1.973 1.55 2.6 2.748v-.006Zm-2.39 4.223c0-1.531-.416-2.774-1.255-3.722-.84-.949-1.929-1.423-3.28-1.423-1.352 0-2.441.468-3.268 1.403-.826.936-1.242 2.166-1.242 3.671s.416 2.812 1.242 3.78c.827.967 1.916 1.448 3.268 1.448 1.351 0 2.44-.48 3.28-1.448.839-.968 1.255-2.21 1.255-3.722v.013Zm9.219-13.428v21.166h-3.267V2.575h3.267Zm18.02 21.166H37.79c-1.006 0-1.736-.211-2.178-.634-.442-.423-.666-1.038-.666-1.845-1.166 1.774-2.87 2.659-5.113 2.659-1.736 0-3.126-.404-4.17-1.211-1.05-.807-1.57-1.916-1.57-3.325 0-1.595.564-2.819 1.692-3.67 1.127-.86 2.774-1.288 4.926-1.288h3.901v-.936c0-.864-.3-1.55-.91-2.043-.601-.494-1.44-.743-2.51-.743-.949 0-1.73.205-2.345.621-.615.416-.98.961-1.102 1.646h-3.203c.16-1.55.846-2.754 2.056-3.613 1.211-.858 2.793-1.287 4.747-1.287 2.076 0 3.677.48 4.805 1.454 1.127.967 1.691 2.357 1.691 4.17v6.105c0 .724.346 1.09 1.025 1.09h.634v2.844l.013.006Zm-8.95-6.893c-1.005 0-1.78.199-2.325.59-.544.39-.813.973-.813 1.736 0 .666.256 1.198.768 1.601.513.404 1.218.602 2.102.602 1.351 0 2.402-.365 3.158-1.089.756-.724 1.147-1.69 1.166-2.902v-.544H30.57l-.006.006Zm16.509 3.357 4.203-11.941h3.478L47.74 26.163c-.365.929-.699 1.64-1 2.133-.3.493-.672.865-1.12 1.121-.443.25-1.039.378-1.782.378h-3.504v-2.87h2.3c.628 0 1.057-.096 1.3-.288.244-.192.494-.622.756-1.288l.635-1.48L39.276 8.27h3.479l4.324 11.941-.007-.006Zm11.775-11.14c1.14-.654 2.44-.98 3.914-.98 1.473 0 2.806.3 3.946.91a6.7 6.7 0 0 1 2.69 2.568c.654 1.108.994 2.409 1.013 3.901 0 .404-.032.814-.09 1.237H58.648v.18c.084 1.35.506 2.42 1.269 3.202.768.788 1.78 1.179 3.055 1.179 1.006 0 1.858-.237 2.537-.711.686-.474 1.14-1.147 1.358-2.012h3.267c-.281 1.576-1.044 2.864-2.28 3.87-1.243 1.006-2.787 1.512-4.638 1.512-1.614 0-3.017-.327-4.215-.98a6.844 6.844 0 0 1-2.78-2.768c-.654-1.192-.98-2.569-.98-4.138 0-1.57.32-2.992.954-4.19.634-1.198 1.524-2.127 2.658-2.78h-.006Zm6.893 2.6c-.756-.634-1.71-.954-2.857-.954-1.07 0-1.992.327-2.768.98-.775.654-1.223 1.525-1.345 2.614h8.315c-.14-1.127-.59-2.012-1.345-2.646v.007Zm15.855-.352h-1.454c-1.352 0-2.326.436-2.934 1.313-.602.878-.91 1.993-.91 3.338v7.77H73.03V8.265h2.902l.365 2.325a4.948 4.948 0 0 1 1.724-1.71c.704-.416 1.652-.621 2.844-.621h.724v3.055h.006Zm2.659 8.495c.602 0 1.108.192 1.511.576.404.385.603.878.603 1.48s-.199 1.096-.602 1.48c-.404.384-.91.577-1.512.577-.603 0-1.102-.193-1.5-.577-.39-.384-.589-.878-.589-1.48s.199-1.095.59-1.48c.39-.384.89-.576 1.499-.576ZM98.02 7.854c-2.863 0-4.631 2.088-4.631 4.023 0 1.384.403 2.377 2.928 4.946 1.909 1.953 2.408 2.504 2.408 3.517 0 1.012-.877 1.985-2.55 1.985-1.396 0-2.594-.538-3.773-1.69l-.16-.16-1.377 1.274.14.173c1.186 1.448 2.82 2.178 4.857 2.178 2.94 0 4.843-1.55 4.843-3.96 0-1.62-.756-2.478-3.133-4.945-1.864-1.94-2.165-2.639-2.165-3.549 0-1.204.974-2.05 2.377-2.05 1.024 0 1.96.231 3.036.743l.218.103.756-1.62-.205-.11c-1.224-.634-1.948-.858-3.562-.858h-.007Zm14.92 11.012-1.358-.878-.134.193c-.929 1.37-2.819 3.235-4.017 3.99-.064-.3-.077-.666-.077-1.095 0-.602.058-1.396.173-2.293l1.057-8.719h4.741l.237-1.838h-4.741l.667-5.292-1.807.09-.871 5.253-2.62.198-.199 1.519 2.582.064-1.012 7.732c-.205 1.473-.314 2.857-.314 3.882 0 1.134.211 2.428 1.845 2.428 1.633 0 4.618-2.838 5.752-5.042l.103-.192h-.007Zm12.973-10.871-1.858.263.045.25c.205 1.095.307 2.107.307 2.94 0 3.248-.755 5.701-3.081 9.84-1.025-4.139-3.145-10.404-4.657-13.146l-.103-.18-1.793.654.102.23c1.723 3.992 3.946 10.328 4.882 14.793-1.871 2.697-4.184 4.106-7.483 4.56l-.256.033.378 1.762.218-.026c4.375-.551 7.373-2.831 10.358-7.886 2.973-5.093 3.556-7.81 3.556-10.775 0-1.096-.231-2.415-.545-3.152l-.07-.167v.007Zm7.995 13.517c-.673.25-1.871.621-2.704.82a20.36 20.36 0 0 1 .135-1.896l2.024-17.194c.071-.61.109-1.224.109-1.685 0-.462-.07-.968-.186-1.358l-.051-.193-1.505.135-2.358 19.98-.051.41c-.083.693-.16 1.288-.16 1.782 0 1.262.448 1.8 1.492 1.8 1.275 0 2.806-.526 3.908-1.34l.16-.12-.608-1.205-.199.077-.006-.013Zm13.754-3.46-.135.193c-1.96 2.754-3.747 3.984-5.797 3.984-1.339 0-2.883-.48-2.966-4.177 5.618-2.19 8.469-4.663 8.469-7.335 0-1.32-.551-2.895-3.171-2.895-4.51 0-7.419 3.99-7.419 10.166 0 4.056 1.615 6.118 4.805 6.118 2.831 0 5.15-1.505 7.514-4.881l.141-.199-1.441-.96v-.014Zm-4.017-8.494c1.121 0 1.538.41 1.538 1.518 0 1.185-1.685 3.216-6.4 5.112.295-3.927 2.261-6.636 4.862-6.636v.006Z"
      />
    </svg>
  );
}
