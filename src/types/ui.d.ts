declare module '@/components/ui/label' {
  import * as React from 'react';

  export const Label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module '@/components/ui/switch' {
  import * as React from 'react';
  import * as SwitchPrimitive from '@radix-ui/react-switch';

  export const Switch: React.ForwardRefExoticComponent<
    SwitchPrimitive.SwitchProps & React.RefAttributes<HTMLButtonElement>
  >;
}
