import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { faMeteor } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GoogleLoginButton from './GoogleLoginButton';
import '../../styles/Authentication/Authentication.css'
import axios from 'axios';

const Authentication = () => {
    const [authConfig, setAuthConfig] = useState('signUp');
    const [redEmailPlaceHolder, setRedEmailPlaceHolder] = useState(false);
    const [redPasswordPlaceholder, setRedPasswordPlaceholder] = useState(false);
    const [loader, setLoader] = useState(false);
    const [demoLoader, setDemoLoader] = useState(false)
    const [email, setEmail] = useState({
        value: "",
        placeholder: "Enter your email",
    });
    const [password, setPassword] = useState({
        value: "",
        placeholder: "Enter your password",
    });
    const navigate = useNavigate()

    // Resets the values and placeholders for all the input fields if the authConfig changes from signUp to signIn and vice versa
    useEffect(() => {
        setRedPasswordPlaceholder(false);
        setRedEmailPlaceHolder(false);
        setEmail({ ...email, value: "", placeholder: "Enter your email" });
        setPassword({ ...password, value: "", placeholder: "Enter your password" });
    }, [authConfig]);

    // Handles the sign in/up form functionality
    const handleFormSubmit = async (event: any) => {
        event.preventDefault();
        // If the user is currently in the process of signing into the demo account,
        // prevent any further sign-in or sign-up attempts to avoid conflicts by returning nothing.
        if (demoLoader) return
        setLoader(true);
        // Check if either the email or password fields are empty
        if (email.value === "" || password.value === "") {
            // If either field is empty, display a placeholder message and set appropriate state variables
            if (email.value === "") {
                setRedEmailPlaceHolder(true);
                setEmail({ ...email, placeholder: "Please Fill Out This Field" });
            }
            if (password.value === "") {
                setRedPasswordPlaceholder(true);
                setPassword({ ...password, placeholder: "Please Fill Out This Field" });
            }
            setLoader(false);
            return;
        }

        const user = {
            email: email.value.toUpperCase(),
            password: password.value,
        };

        try {
            const path = authConfig === 'signUp' ? "sign-up-page" : "log-in-page";

            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/${path}`, user, { withCredentials: true, });
            if (authConfig === 'signUp' && response.status === 200) {
                setAuthConfig('logIn')
                setEmail({ ...email, value: "" });
                setPassword({ ...password, value: "" });
            } else if (authConfig === "logIn" && response.status === 200) {
                navigate('/')
            }
            setLoader(false);
        } catch (error: any) {
            if (error.response) {
                console.error("Error message: ", error.response.data.message);
                // This code handles errors from a server response. It checks the error message received
                // and updates the user interface accordingly, such as displaying placeholder text and
                // setting error flags. If no specific error message is recognized, it logs a generic error.
                if (error.response.data.message === "Email is incorrect") {
                    setRedEmailPlaceHolder(true);
                    setEmail({ ...email, value: "", placeholder: "Incorrect email" });
                } else if (error.response.data.message === "Incorrect password") {
                    setRedPasswordPlaceholder(true);
                    setPassword({ ...password, value: "", placeholder: "Incorrect password", });
                } else if (error.response.data.message === "Email has already been taken") {
                    setRedEmailPlaceHolder(true);
                    setEmail({ ...email, value: "", placeholder: "Email has already been taken", });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error("Error", error.message);
                }
                setLoader(false);
            }
        };
    }

    // resets the placeholder color and text to its default setting if the email value is empty
    useEffect(() => {
        if (email.value !== "") {
            setRedEmailPlaceHolder(false);
            setEmail({ ...email, placeholder: "Enter your email" });
        }
    }, [email.value]);

    // resets the placeholder color and text to its default setting if the password value is empty
    useEffect(() => {
        if (password.value !== "") {
            setRedPasswordPlaceholder(false);
            setPassword({ ...password, placeholder: "Enter your password" });
        }
    }, [password.value]);

    // handles the login functionality for if a user decides to use the demo account
    const demoAccountLogIn = async () => {
        // If the user is currently in the process of signing up/in,
        // prevent any further demoaccount sign-in attempts to avoid conflicts by returning nothing.
        if (loader) return
        setDemoLoader(true)
        const user = {
            email: "DEMOACCOUNT@GMAIL.COM",
            password: "1234",
        };
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/log-in-page`, user, { withCredentials: true });
            if (response.status === 200) {
                navigate('/')
            }
            setDemoLoader(false)
        } catch (err) {
            console.log(err);
            setDemoLoader(false)
        }
    };

    return (
        <div className='authWrapper'>
            <div className='authContent'>
                <div className='authLogoWrapper'>
                    <FontAwesomeIcon icon={faMeteor} className='authLogoIcon' />
                </div>
                <h2 className='authTitle'>{authConfig === 'signUp' ? 'Create your Account' : "Log into your Account"}</h2>
                <div className='authOptionsWrapper'>
                    {demoLoader ? (
                        <span className='authDemoLoader'></span>
                    ) : (
                        <span className='authDemoAccountTxt' onClick={() => demoAccountLogIn()}>Use Demo Account</span>
                    )}
                    <>
                        <GoogleLoginButton loader={loader} demoLoader={demoLoader}/>
                    </>
                </div>
                <span></span>
                <form method="POST" className="authForm" onSubmit={handleFormSubmit}>
                    <label className="authLabel">Email<span className="authRequireTag">*</span>
                    </label>
                    <input type="email" name="email" placeholder={email.placeholder}
                        className={`authFormEmailInput ${redEmailPlaceHolder ? "field" : ""}`}
                        onChange={(e) => setEmail({ ...email, value: e.target.value })} value={email.value}
                    />
                    <label className="authLabel">Password<span className="authRequireTag">*</span></label>
                    <input type="password" name="password" placeholder={password.placeholder}
                        className={`authFormPassWordInput ${redPasswordPlaceholder ? "field" : ""}`}
                        onChange={(e) => setPassword({ ...password, value: e.target.value })} value={password.value}
                    />
                    <div className='authBtnsWrapper'>
                        {loader ? (
                            <button type='button' className="authBtn authLoader">
                                <span className="btnLoader"></span>
                            </button>
                        ) : (
                            <button type="submit" className="authBtn">
                                {authConfig === 'signUp' ? "Sign Up" : "Log In"}
                            </button>
                        )}
                    </div>
                    <span className='authPromptWrapper'>{authConfig === 'signUp' ? "Already have an account?" : "Don't have an account?"}
                        {authConfig === 'signUp' ? <span className='authPrompt' onClick={() => setAuthConfig('logIn')}>Log In</span> :
                            <span className='authPrompt' onClick={() => setAuthConfig('signUp')}>Create Account</span>}</span>
                </form>
            </div>
        </div >
    )
}


export default Authentication
