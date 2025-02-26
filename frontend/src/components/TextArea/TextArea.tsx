import { InputColor } from '../Input/inputStyle'
import { ForwardedRef, forwardRef, TextareaHTMLAttributes } from 'react'
import { StyledTextArea } from './TextAreaStyle'

interface TextAreaProps {
    color?: InputColor
    small?: boolean
    maxLength?: number
}

const InputTextArea = forwardRef(({
    color,
    small = false,
    maxLength,
    ...props
}: TextAreaProps & TextareaHTMLAttributes<HTMLTextAreaElement>, ref: ForwardedRef<HTMLTextAreaElement>) => {
    return (
        <StyledTextArea
            id={props.id ?? props.name}
            $color={color}
            $small={small}
            maxLength={maxLength}
            {...props}
        />
    );
})

export default InputTextArea