'use client';

import { Children, ReactNode, cloneElement } from 'react';

type ButtonPickerProps = {
  type: string;
  children?: ReactNode;
};

export default function ButtonPicker(props: ButtonPickerProps) {
  const { type, children } = props;

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,5.4rem)] sm:grid-cols-[repeat(auto-fill,max(6rem,100%/10))] gap-0.5 mb-2">
        {Children.map(children, (child: any) =>
          cloneElement(child, {
            type,
          })
        )}
      </div>
    </>
  );
}
