import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortalJson from './utils/WavePortal.json';

import edaTweetsIcon from './mvp.png';

const TWITTER_HANDLE = 'edatweets_';
const TWITTER_HANDLE_BUILDSPACE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TWITTER_LINK_BUILDSPACE= `https://twitter.com/${TWITTER_HANDLE_BUILDSPACE}`;

const contractAddress = "0x6e0F8F048cc7FEEc0A122D721f16ED9205543199";

const App = () => {
  
  
  const messageRef = useRef();
  const [modalBox, setModalBox] = useState({
    open: false,
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [load, setLoad] = useState(false);


  const [currentAccount, setCurrentAccount] = useState("");
  
  const contractABI = wavePortalJson.abi;
  const [allWaves, setAllWaves] = useState([]);
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

        // calling getAllWaves()
        getAllWaves();

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      // calling getAllWaves()
      getAllWaves();

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (messageRef.current.value === '') {
      alert("Opps, don't forget to add a tip!");
      return;
    }

    try { const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const currentNetwork = ethereum.networkVersion;
        console.log("Current network", currentNetwork);

        if(currentNetwork != 4){
          alert("Opps, only works on Rinkeby! Please change your network :)");
          return;
        };
        
        let count = await wavePortalContract.getTotalWaves();
        console.log("total advice count...", count.toNumber());

        
        console.log(messageRef.current.value);
        const waveTxn = await wavePortalContract.wave(messageRef.current.value);
        setLoad(true);
        console.log("Minting...", waveTxn.hash);
    
        await waveTxn.wait();
        console.log("Minted -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("total advice count...", count.toNumber());
        setLoad(false);

        setSent(true);
        alert(
          `Woohoo! Got your tip, thank you very much! Don't forget to connect with me from twitter.`
        );

        // calling getAllWaves()
        getAllWaves();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }  
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWalletButton = () =>(
    <div>
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
          Connect Wallet
      </button>
    </div>
  );

  const sendButton = () =>(
    <div>
      <form onSubmit={handleSubmit}>
          <textarea
            ref={messageRef}
            className="messageBox"
            placeholder="what are some tips to navigate in the web3 world..."
          ></textarea>
          <br/> <br/>
          <button className="cta-button connect-wallet-button" type="submit">
              Click to send advice 
          </button>
        </form>
    </div>
  );

  const getTips = () =>(
    <div>
      {allWaves.reverse().map((wave, index) => {
        return (     
          <div className="message-container">
          <div className="message-text-mini">tip: {wave.message} </div>

          <div className="message-text-address">from: {wave.address}</div> 
          </div>
        );
      })}   
      <br/>
  </div>
  );

  const getLoader = () => (
    <div>
      <div class="lds-ellipsis"><div></div><div></div><div></div></div>
    </div>
  );
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">web3 advice</p>
           <img className="site-logo" src={edaTweetsIcon} />
           
          {currentAccount === "" ? connectWalletButton()  : sendButton()}<br/>

          {load ? getLoader() : null}

          {getTips()}                     
      </div>

        <div className="footer-container">
            <a className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
            <br />
            <a className="footer-text"
              href={TWITTER_LINK_BUILDSPACE}
              target="_blank"
              rel="noreferrer"
            >{`// from @${TWITTER_HANDLE_BUILDSPACE} `}</a>
        </div>

      </div>
    </div>
  );
};

export default App;