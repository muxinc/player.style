export default function Footer() {
  return (
    <>
      <div className="overflow-hidden my-1px">
        <div className="relative border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray">
          <div className="col-start-2 col-end-3 border-x border-ctx-gray">
            <div className="-m-0.5px grid grid-cols-1 h-2"></div>
          </div>
        </div>
        <div className="relative -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="-m-0.5px grid-cols-1 block lg:flex items-center p-1 lg:px-2 dark">
              <div className="mb-2 lg:mb-0 flex flex-col lg:flex-row space-y-0.25 lg:space-y-0 lg:space-x-2">
                <div>© player.style</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
