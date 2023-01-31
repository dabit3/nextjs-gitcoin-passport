'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const APIKEY = process.env.NEXT_PUBLIC_GC_API_KEY
const COMMUNITYID = process.env.NEXT_PUBLIC_GC_COMMUNITY_ID

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${APIKEY}`
}

declare global {
  interface Window{
    ethereum?: any
  }
}

// submitting passport
const SUBMIT_PASSPORT_URI = 'https://api.scorer.gitcoin.co/registry/submit-passport'
// getting the signing message
const SIGNING_MESSAGE_URI = 'https://api.scorer.gitcoin.co/registry/signing-message'
// score needed to see hidden message
const thresholdNumber = 20

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
    const GET_PASSPORT_SCORE_URI = `https://api.scorer.gitcoin.co/registry/score/${COMMUNITYID}/${currentAddress}`
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
          community: COMMUNITYID,
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

const styles = {
  main: {
    width: '900px',
    margin: '0 auto',
    paddingTop: 90
  },
  heading: {
    fontSize: 60
  },
  intro: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, .55)'
  },
  configurePassport: {
    marginTop: 20,
  },
  linkStyle: {
    color: '#008aff'
  },
  buttonContainer: {
    marginTop: 20
  },
  buttonStyle: {
    padding: '10px 30px',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
    borderBottom: '2px solid rgba(0, 0, 0, .2)',
    borderRight: '2px solid rgba(0, 0, 0, .2)'
  },
  hiddenMessageContainer: {
    marginTop: 15
  },
  noScoreMessage: {
    marginTop: 20
  }
}

// async function getScorer() {
//   //  api scorer
//   const COMMUNITY_SCORER_URI = `https://api.scorer.gitcoin.co/registry/score/${COMMUNITYID}`
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

// async function verify() {
//   const verifier = await loadVerifier()
//   console.log('verifier: ', verifier)
//   const data = await verifier.verifyPassport('0xB2Ebc9b3a788aFB1E942eD65B59E9E49A1eE500D')

//   if (!data) {
//     console.log('no data...')
//     return
//   }
//   console.log('data from passport: ', data)
// }

// const loadVerifier = useCallback(async () => {
//   const PassportVerifier = (await import('@gitcoinco/passport-sdk-verifier')).PassportVerifier;
//   // Create PassportVerifier with given URL and Network
//   return new PassportVerifier(PROD_GITCOIN_CERAMIC_NODE_URL, MAINNET_NETWORK_ID);
// }, [])


// const loadScorer = useCallback(async (stamps: Criteria[]) => {
//   const PassportScorer = (await import('@gitcoinco/passport-sdk-scorer')).PassportScorer;
//   // Create PassportScorer with given stamp criteria, URL, and Network
//   return new PassportScorer(stamps, PROD_GITCOIN_CERAMIC_NODE_URL, MAINNET_NETWORK_ID);
// }, []);


// async function readPassport() {
//   try {
//     const reader = new PassportReader(PROD_GITCOIN_CERAMIC_NODE_URL, MAINNET_NETWORK_ID)
//     const data = await reader.getPassport('0xB2Ebc9b3a788aFB1E942eD65B59E9E49A1eE500D');
//   // If data is false, the passport was missing
//   if (!data) {
//     console.log('no data for addres...')
//     return
//   }
//   console.log('Passport Data', data)
//   const scorer = await loadScorer(acceptedStamps)
//   const score = await scorer.getScore('0xB2Ebc9b3a788aFB1E942eD65B59E9E49A1eE500D')

//   console.log('score: ', score)
//   } catch (err) {
//     console.log('error reading passport...', err)
//   }
// }