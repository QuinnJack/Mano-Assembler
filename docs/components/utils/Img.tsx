import Image, { ImageProps } from 'next/image'
import styles from "../../theme-image.module.css"

console.log("jkdfakjdfakjljkdasljdka;lfkalkjfjkl ad;lkjf", styles)
type Props = Omit<ImageProps, 'src' | 'priority' | 'loading'> & {
  srcLight: string
  srcDark: string
}
 
const Img = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props
 
  return (
    <>
      <Image {...rest} src={srcLight} className={styles.imgLight} />
      <Image {...rest} src={srcDark} className={styles.imgDark} />
    </>
  )
}