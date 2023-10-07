import React, { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Main.css'
import NavBar from './NavBar'
import axios from 'axios'

interface AstronomyPictureOfTheDay {
    copyright: string;
    date: string;
    explanation: string;
    hdurl: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
}

interface MainProps {
    imageData: AstronomyPictureOfTheDay | null
}

const Main: FC<MainProps> = ({ imageData }) => {
    const [userEmail, setUserEmail] = useState('')
    const [imgLoaded, setImgLoaded] = useState(false)
    const navigate = useNavigate()

    // Send a request to check whether or not the user is logged in and authenticated, if they are the server sends back the users email
    // The users email will be used to let the user know what account they're logged into
    const getUserInfo = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/user-info`, { withCredentials: true })
            if (response.status === 200) {
                setUserEmail(response.data)
            }
        } catch (err: any) {
            console.log(err)
            navigate('/auth')
        }
    }

    useEffect(() => {
        getUserInfo()
    }, [])

    // Disables the default scrolling behavior when the loader is set to true and re-enables it when it's set to false.
    // This is purely a stylistic decision, as I find the default scrollbar appearance unattractive when the loader is active
    useEffect(() => {
        if (!imgLoaded && userEmail === '') {
            document.body.style.overflowY = 'hidden';
        } else {
            document.body.style.overflowY = 'auto';
        }
    }, [imgLoaded, userEmail])

    return (
        <div className='mainWrapper'>
            <NavBar userEmail={userEmail} />
            <div className='mainContent'>
                <h1 className='mainHeaderTxt'>Image of the day:</h1>
                <img onLoad={() => setImgLoaded(false)} src={`${imageData?.hdurl}`} className='mainImg' onMouseDown={(e) => e.preventDefault()} alt='img of the day' />
                <div className='mainImgInfoWrapper'>
                    <h2 className='mainImgTitle'>{imageData?.title}</h2>
                    <p className='mainImgDescTxt'>{imageData?.explanation}</p>
                    <span className='mainCopyRightTxt'>Copy right: {imageData?.copyright === null ? imageData?.copyright : 'No copyright is claimed in this work'}</span>
                </div>
            </div>
            {!imgLoaded && userEmail === '' && (
                <div className='mainLoaderWrapper'>
                    <span className='mainLoader'></span>
                </div>
            )}
        </div>
    )
}

export default Main