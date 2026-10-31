import type { SVGProps } from 'react'

// Inline replacements for the handful of icons react-bootstrap-icons supplied.
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const PersonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 11.5a6.5 6.5 0 0 1-4.9-2.2C3.9 10.6 5.8 9.5 8 9.5s4.1 1.1 4.9 2.8A6.5 6.5 0 0 1 8 14.5Z" />
  </Icon>
)

export const BriefcaseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 1A1.5 1.5 0 0 0 4 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v2.4l6.5 1.7V8h3v.6L16 6.9V4.5A1.5 1.5 0 0 0 14.5 3H12v-.5A1.5 1.5 0 0 0 10.5 1h-5ZM5 3v-.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V3H5Zm-5 4.9v5.6A1.5 1.5 0 0 0 1.5 15h13a1.5 1.5 0 0 0 1.5-1.5V7.9l-6.5 1.7v.4h-3v-.4L0 7.9Z" />
  </Icon>
)

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 4h12v1.25H2zM2 7.4h12v1.25H2zM2 10.8h12v1.25H2z" />
  </Icon>
)

export const TelephoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.9.5a1.7 1.7 0 0 1 2.6.2l1.8 2.4c.3.4.4 1 .3 1.5l-.6 2.2a.7.7 0 0 0 .2.6l2.4 2.4a.7.7 0 0 0 .6.2l2.2-.6c.5-.1 1.1 0 1.5.3l2.4 1.8c.8.6.9 1.9.2 2.6l-1.1 1.1c-.8.8-2 1.1-3.1.7a17.6 17.6 0 0 1-6.6-4.2A17.6 17.6 0 0 1 .5 5C.1 3.9.4 2.7 1.2 1.9L1.9.5Z" />
  </Icon>
)

export const EnvelopeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M.05 3.55A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.55L8 8.4.05 3.55ZM0 4.7v7.1l5.8-3.55L0 4.7Zm6.76 4.14L.2 12.86A2 2 0 0 0 2 14h12a2 2 0 0 0 1.8-1.14L9.24 8.84 8 9.6l-1.24-.76Zm3.44-.59L16 11.8V4.7l-5.8 3.55Z" />
  </Icon>
)

export const ShieldLockIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 0c-.7 0-1.9.3-3 .6C3.9.9 2.7 1.3 2.1 1.5A1.1 1.1 0 0 0 1.3 2.4C.7 6.9 2 10.2 3.7 12.3A11 11 0 0 0 7.1 15.8c.3.1.6.2.9.2s.6-.1.9-.2a11 11 0 0 0 3.4-3.5c1.7-2.1 3-5.4 2.4-9.9a1.1 1.1 0 0 0-.8-.9C13.3 1.3 12.1.9 11 .6 9.9.3 8.7 0 8 0Zm0 5a1.5 1.5 0 0 1 .5 2.9l.4 2.1H7.1l.4-2.1A1.5 1.5 0 0 1 8 5Z" />
  </Icon>
)
