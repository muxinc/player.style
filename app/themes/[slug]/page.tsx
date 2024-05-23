import Grid from '../../_components/Grid';

export default function Theme(props: any) {
  console.log(props.params.slug);

  return (
    <>
      <div className="flex-1">
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="-m-0.5px grid grid-cols-1 h-2"></div>
          </div>
        </div>
        <div className="relative grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="block lg:flex items-center dark">
              <video
                className="aspect-video block w-full"
                src=""
                controls
                poster="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/thumbnail.webp?time=13"
              ></video>
            </div>
          </div>
        </div>
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="-m-0.5px grid grid-cols-1 h-3"></div>
          </div>
        </div>
        <Grid>
        </Grid>
      </div>
    </>
  );
}
