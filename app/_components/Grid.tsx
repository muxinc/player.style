import { ReactNode } from 'react';

type GridProps = {
  children?: ReactNode;
};

export default function Grid({ children }: GridProps) {
  return (
    <>
      <div className="relative flex-1 border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray">
        <div className="col-start-2 col-end-3 border-x border-ctx-gray">
          <div className="gap-2 lg:gap-3 items-center py-2 px-1 md:p-2 lg:py-3 lg:px-3">
            <div className="block border-ctx-gray bg-putty-light [&amp;>*]:set-border-ctx-gray [&amp;>*]:set-bg-ctx-putty-light text-black text-center">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
