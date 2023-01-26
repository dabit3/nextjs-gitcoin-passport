import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from './page.module.css'
import dynamic from 'next/dynamic'
import Passport from '../components/Passport'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Passport />
      </div>
    </main>
  )
}
