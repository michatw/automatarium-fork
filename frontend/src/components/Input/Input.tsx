import { ForwardedRef, forwardRef, InputHTMLAttributes } from 'react'

import { InputColor, StyledInput } from './inputStyle'

interface InputProps {
  type?: string
  color?: InputColor
  small?: boolean
  maxLength?: number
}

const Input = forwardRef(({
  type,
  color,
  small = false,
  maxLength,
  ...props
}: InputProps & InputHTMLAttributes<HTMLInputElement>, ref: ForwardedRef<HTMLInputElement>) => {
  return (
    <StyledInput
      id={props.id ?? props.name}
      $color={color}
      $small={small}
      maxLength={maxLength}
      {...props}
      as={type === 'select' ? 'select' : 'input'}
      type={type}
      ref={ref}
    />
  );
})

export default Input
