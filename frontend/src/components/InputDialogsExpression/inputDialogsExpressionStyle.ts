import { styled } from 'goober'

export const TransitionInputStyle = {
  width: 'calc(12ch + 3.5em)',
  margin: '0 .4em',
  paddingRight: '2.5em'
}

export const TMInputStyle = {
  ...TransitionInputStyle,
  width: 'calc(13ch + 3.5em)'
}

export const InputWrapper = styled('div')`
  position: relative;
  display: flex;
  align-items: center;
`

export const SubmitButton = styled('button')`
  position: absolute;
  padding: 0;
  margin: 0;
  right: .4em;
  top: 0;
  bottom: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5em;
  cursor: pointer;
`

// CheckButton is a SubmitButton with a checkmark icon
export const CheckButton = styled(SubmitButton)`
  position: relative;
  padding: 0.5em 1em;
  margin: 0.5em;
  border: 1px solid var(--surface);
  background: var(--background);
  color: var(--surface);
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '✔';
    margin-left: 0.5em;
    color: var(--success);
  }

  &:hover {
    &::after {
      color: white;
    }
  }
`

export const TMSubmitButton = styled(SubmitButton)`
  color: white;
  right: .2em;
  width: 2.0em;
`

export const RadioWrapper = styled('div')`
  padding-top: 0.5em;
  padding-bottom: 0.3em;
  padding-left: 0.4em;
  `
