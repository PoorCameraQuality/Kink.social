import type { CSSProperties } from 'react'
import {
  profilePhotoImageStyle,
  type ProfilePhotoDisplaySettings,
} from '@c2k/shared'

type Props = {
  src: string
  alt?: string
  displaySettings?: ProfilePhotoDisplaySettings | null
  className?: string
  style?: CSSProperties
}

export default function ProfilePhotoImage({
  src,
  alt = '',
  displaySettings,
  className = 'h-full w-full',
  style,
}: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ ...profilePhotoImageStyle(displaySettings), ...style }}
    />
  )
}
