'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import styles from './index.module.scss'

type TanzakuProps = {
  textLine1: string
  textLine2?: string
  nameLine: string
} & React.HTMLAttributes<HTMLCanvasElement>

export const CreateTanzaku = forwardRef<HTMLCanvasElement, TanzakuProps>(
  function CreateTanzaku({ textLine1, textLine2, nameLine, ...props }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }

      const img = new Image()
      // img.src = '/tanzaku.webp'
      const random = Math.floor(Math.random() * 7)
      img.src = `/tanzaku/${random}.webp`
      img.onload = () => {
        setImage(img)
        setImageLoaded(true)
      }
    }, [])

    useEffect(() => {
      if (!imageLoaded) {
        return
      }

      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }

      ctx.drawImage(image as HTMLImageElement, 0, 0, 300, 500)

      ctx.save()
      ctx.translate(45, 100)
      ctx.rotate((85 * Math.PI) / 180)
      canvas.style.writingMode = 'vertical-rl'
      ctx.font = '50px Yuji Syuku, HG正楷書体-PRO, serif'
      ctx.fillStyle = 'black'
      ctx.fillText(textLine1, 25, -110)
      ctx.fillText(textLine2 || '', 40, -50)
      ctx.font = '30px Yuji Syuku, HG正楷書体-PRO, serif'
      ctx.fillText(nameLine, 150, -10)
      ctx.restore()
    }, [textLine1, textLine2, nameLine, image, imageLoaded])

    return (
      <canvas
        ref={canvasRef}
        width={300}
        height={500}
        className={styles.animated}
        {...props}
      />
    )
  },
)
