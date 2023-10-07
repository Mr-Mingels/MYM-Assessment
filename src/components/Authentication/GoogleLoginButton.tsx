import React, { FC } from 'react';
import googleLogo from '../../assets/googleLogo.png'
import '../../styles/Authentication/GoogleLoginButton.css'

interface GoogleLoginButtonProps {
  loader: boolean,
  demoLoader: boolean,
}

const GoogleLoginButton: FC<GoogleLoginButtonProps> = ({ loader, demoLoader }) => {

  const handleGoogleLogin = () => {
    // If the user is currently in the process of signing up or into any account,
    // prevent any further google sign-in attempts to avoid conflicts by returning nothing.
    if (loader || demoLoader) return
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/auth/google/callback`;
  };

  return (
    <button type='button' className='googleLogInBtn' onClick={handleGoogleLogin} onMouseDown={(e) => e.preventDefault()}>
      <img src={googleLogo} className='googleLogoImg' alt='google logo' />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
