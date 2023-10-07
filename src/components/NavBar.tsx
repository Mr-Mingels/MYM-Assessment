import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { faUserAstronaut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../styles/NavBar.css'
import axios from 'axios';

interface NavBarProps {
    userEmail: string
}

const NavBar: FC<NavBarProps> = ({ userEmail }) => {
    const [logOutModalOpen, setLogOutModalOpen] = useState(false)
    const [loader, setLoader] = useState(false)
    const navigate = useNavigate()

    // This function sends a logout request to the server, which clears the user's session in the backend,
    // and redirects them to the authentication page on a successful logout.
    const logOut = async () => {
        setLoader(true)
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/log-out`, { withCredentials: true })
            if (response.status === 200) {
                navigate('/auth')
            }
            setLoader(false)
        } catch (error) {
            console.log(error)
            setLoader(false)
        }
    }

    return (
        <div className='navBarWrapper'>
            <div className='navBarContent'>
                <div className='navBarIconWrapper' onClick={() => setLogOutModalOpen(true)}>
                    <FontAwesomeIcon className='navBarIcon' icon={faUserAstronaut} />
                </div>
            </div>
            {logOutModalOpen && (
                <div className='logOutModalWrapper'>
                    <div className='logOutModalContent'>
                        <h5 className='logOutTitle'>Log Out</h5>
                        <div className='logOutTxtWrapper'>
                            <span className='logOutTxt accountInfo'>Logged in as: {userEmail.toUpperCase()}</span>
                            <span className='logOutTxt'>Are you sure you want to log out of your account?</span>
                        </div>
                        <div className='logOutBtnsWrapper'>
                            {loader ? (
                                <button type='button' className="logOutBtns">
                                    <span className="btnLoader"></span>
                                </button>
                            ) : (
                                <button type='button' className='logOutBtns' onClick={() => logOut()}>LOG OUT</button>
                            )}
                            <button className='logOutBtns close'
                                onClick={loader ? undefined : () => setLogOutModalOpen(false)}>CLOSE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NavBar;
