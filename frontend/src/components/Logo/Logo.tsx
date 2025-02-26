import { HTMLAttributes } from 'react'

interface LogoProps extends HTMLAttributes<SVGElement> {
  size?: string
  primary?: string
  secondary?: string
  hideTriangle?: boolean
  hidePlanet?: boolean
}

const Logo = ({
  size = '4rem',
  primary = 'var(--primary)',
  secondary = 'hsl(var(--primary-h) var(--primary-s) 80%)',
  hideTriangle = false,
  hidePlanet = false,
  ...props
}: LogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
    style={{
      width: size,
      height: size
    }}
    {...props}
  >
    {!hidePlanet && <circle fill={secondary} cx="241.33" cy="241.33" r="173.99"/>}
    {!hideTriangle && <path fill={secondary} d="M375.28,386.46l7.05,49.68c1.15,8.07,11.02,11.37,16.78,5.6l42.64-42.64c5.76-5.76,2.47-15.64-5.6-16.78l-49.68-7.05c-6.52-.92-12.1,4.66-11.18,11.18Z"/>}

    {!hidePlanet && <>
      <path fill={primary} d="M275.17,153.93c-25.14,3.73-54.37,11.56-54.37,29.9,0,32.97,66.43,23.99,67.41,43.18,.58,11.49-13.38,18.41-11,40.41,3.11,28.77,81.43,29.8,129.76,27.28,5.42-16.82,8.35-34.75,8.35-53.37,0-33.33-9.38-64.47-25.63-90.93-39.53-3.06-79.69-1.65-114.52,3.52Z"/>
      <path fill={primary} d="M193.24,277.53c-11.59-7.6-73.05-20.03-124.98-18.25,2.83,27.58,12.1,53.25,26.28,75.49,34,1.87,90.31-.78,105.87-23.84,5.84-8.66,7.94-23.48-7.18-33.39Z"/>
      <path fill={primary} d="M241.33,415.32c25.67,0,50.04-5.56,71.97-15.54-35.4-25.35-113.41-30.89-155.4-5.73,24.77,13.56,53.19,21.27,83.42,21.27Z"/>
      <path fill={primary} d="M300.81,77.78c-18.56-6.75-38.59-10.43-59.48-10.43-18.36,0-36.05,2.85-52.66,8.12,34.12,33.19,89.74,23.67,112.14,2.31Z"/>
    </>}
  </svg>
)

export default Logo
