export default function Footer() {
  return (
    <>
      <div className="overflow-hidden my-1px">
        <div className="relative border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray">
          <div className="col-start-2 col-end-3 border-x border-ctx-gray">
            <div className="-m-0.5px grid grid-cols-1 px-1 py-2 text-md text-gray-dark">
              © {new Date().getFullYear()} player.style
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
