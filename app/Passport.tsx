'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { styles } from './styles'

const API_KEY = process.env.NEXT_PUBLIC_GC_API_KEY
const COMMUNITY_ID = process.env.NEXT_PUBLIC_GC_COMMUNITY_ID

declare global {
  interface Window {
    ethereum?: any
  }
}

const headers = API_KEY ? ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}) : undefined

// submitting passport
const SUBMIT_PASSPORT_URI = 'https://api.scorer.gitcoin.co/registry/submit-passport'
// getting the signing message
const SIGNING_MESSAGE_URI = 'https://api.scorer.gitcoin.co/registry/signing-message'
// score needed to see hidden message
const thresholdNumber = 32

export default function Passport() {
  const [address, setAddress] = useState<string>('')
  const [connected, setConnected] = useState<boolean>(false)
  const [score, setScore] = useState<string>('')
  const [noScoreMessage, setNoScoreMessage] = useState<string>('')

  useEffect(() => {
    checkConnection()
    async function checkConnection() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts && accounts[0]) {
          setConnected(true)
          setAddress(accounts[0])
          checkPassport(accounts[0])
        }
      } catch (err) {
        console.log('not connected...')
      }
    }
  }, [])

  async function connect() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAddress(accounts[0])
      setConnected(true)
      checkPassport(accounts[0])
    } catch (err) {
      console.log('error connecting...')
    }
  }

  async function checkPassport(currentAddress = address) {
    setScore('')
    setNoScoreMessage('')
    const GET_PASSPORT_SCORE_URI = `https://api.scorer.gitcoin.co/registry/score/${COMMUNITY_ID}/${currentAddress}`
    try {
      const response = await fetch(GET_PASSPORT_SCORE_URI, {
        headers
      })
      const passportData = await response.json()
      console.log('passportData: ', passportData)
      if (passportData.score) {
        const roundedScore = Math.round(passportData.score * 100) / 100
        setScore(roundedScore.toString())
      } else {
        console.log('No score available, please add stamps to your passport and then resubmit.')
        setNoScoreMessage('No score available, please submit your passport after you have added some stamps.')
      }
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async function getSigningMessage() {
    try {
      const response = await fetch(SIGNING_MESSAGE_URI, {
        headers
      })
      const json = await response.json()
      return json
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async function submitPassport() {
    setNoScoreMessage('')
    try {
      const { message, nonce } = await getSigningMessage()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const signature = await signer.signMessage(message)
      
      const response = await fetch(SUBMIT_PASSPORT_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          address,
          community: COMMUNITY_ID,
          signature,
          nonce
        })
      })

      const data = await response.json()
      console.log('data:', data)
    } catch (err) {
      console.log('error: ', err)
    }
  }

  return (
    <div style={styles.main}>
      <h1 style={styles.heading}>Passport Scorer 🫶</h1>
      <p style={styles.intro}>Gitcoin Passport is an identity protocol that proves your trustworthiness without needing to collect personally identifiable information.</p>
      <p style={styles.configurePassport}>Configure your passport <a style={styles.linkStyle} target="_blank" href="https://passport.gitcoin.co/#/dashboard">here</a></p>
      <p style={styles.configurePassport}>Once you've added more stamps to your passport, submit your passport again to recalculate your score.</p>
      <div style={styles.buttonContainer}>
      {
        !connected && (
          <button style={styles.buttonStyle} onClick={connect}>Connect Wallet</button>
        )
      }
      {
        score && (
          <div>
            <h1>Your passport score is {score} 🎉</h1>
            <div style={styles.hiddenMessageContainer}>
              {
                Number(score) >= thresholdNumber && (
                  <h2>Congratulations, you can view this secret message!</h2>
                )
              }
              {
                Number(score) < thresholdNumber && (
                  <h2>Sorry, your score is not high enough to view the secret message.</h2>
                )
              }
            </div>
          </div>
        )
      }
      {
        connected && (
          <div style={styles.buttonContainer}>
            <button style={styles.buttonStyle} onClick={submitPassport}>Submit Passport</button>
            <button style={styles.buttonStyle} onClick={() => checkPassport()}>Check passport score</button>
          </div>
        )
      }
      {
        noScoreMessage && (<p style={styles.noScoreMessage}>{noScoreMessage}</p>)
      }
      </div>
    </div>
  )
}



// async function getScorer() {
//   //  api scorer
//   const COMMUNITY_SCORER_URI = `https://api.scorer.gitcoin.co/registry/score/${COMMUNITY_ID}`
//   try {
//     const response = await fetch(COMMUNITY_SCORER_URI, {
//       headers
//     })
//     const data = await response.json()
//     console.log('data: ', data)
//   } catch (err) {
//     console.log('error: ', err)
//   }
// }