'use client'
import { useEffect, useState,  } from 'react'
import { styles } from './styles'
import { useSigner, useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const API_KEY = process.env.NEXT_PUBLIC_GC_API_KEY
const SCORER_ID = process.env.NEXT_PUBLIC_GC_SCORER_ID

const headers = API_KEY ? ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}) : undefined

// submitting passport
const SUBMIT_PASSPORT_URI = 'https://api.scorer.gitcoin.co/registry/submit-passport'
// getting the signing message
const SIGNING_MESSAGE_URI = 'https://api.scorer.gitcoin.co/registry/signing-message'
// score needed to see hidden message
const thresholdNumber = 20

export default function Passport(props) {
  const [score, setScore] = useState<string>('')
  const [noScoreMessage, setNoScoreMessage] = useState<string>('')
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()

  useEffect(() => {
    if (isConnected) {
      checkPassport()
    }
  }, [isConnected])

  async function checkPassport(currentAddress = address) {
    setScore('')
    setNoScoreMessage('')
    const GET_PASSPORT_SCORE_URI = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${currentAddress}`
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
    if (!signer) return
    try {
      const { message, nonce } = await getSigningMessage()
      const signature = await signer.signMessage(message)
      
      const response = await fetch(SUBMIT_PASSPORT_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          address,
          scorer_id: SCORER_ID,
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
            !isConnected && (
              <ConnectButton />
            )
          }
          {
            score && (
              <div>
                <h1>Your passport score is {score}</h1>
                <div style={styles.hiddenMessageContainer}>
                  {
                    Number(score) >= thresholdNumber && (
                      <h2>Congratulations, you can view this secret message!  🎉</h2>
                    )
                  }
                  {
                    Number(score) < thresholdNumber && (
                      <h2>Sorry, your score is not high enough to view the secret message. Please increase your score to {thresholdNumber}.</h2>
                    )
                  }
                </div>
              </div>
            )
          }
          {
            isConnected && (
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

